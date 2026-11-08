/* Game rules: modes, answer matching, scoring and saved-game validation.
   No DOM access here, so the rules stay easy to test and change. */
(function (root) {
  'use strict';
  const ROUNDS = 7;
  const MODES = {
    crowd: { name: 'Crowd Pleaser', symbol: '◎', tagline: 'Say what everyone else would say', objective: 'Give the answer most people would give', rule: 'THE MORE POPULAR, THE BRIGHTER', kind: 'ranked', duration: 30000, color: '#ff9f68', highlight: 'CROWD FAVOURITES' },
    gem: { name: 'Hidden Gem', symbol: '◆', tagline: 'Find what nobody else would find', objective: 'Find an answer hardly anyone would think of', rule: 'THE RARER, THE BRIGHTER', kind: 'ranked', duration: 40000, color: '#b69cff', highlight: 'HIDDEN GEMS' },
    throwback: { name: 'Throwback', symbol: '◷', tagline: 'Reach as far back in time as you can', objective: 'Name the oldest one you can', rule: 'THE OLDER, THE BRIGHTER', kind: 'timeline', duration: 40000, color: '#e8c27a', highlight: 'OLDEST FIND' },
    fresh: { name: 'Fresh Pick', symbol: '✦', tagline: 'Name the most recent one you know', objective: 'Name the newest one you can', rule: 'THE NEWER, THE BRIGHTER', kind: 'timeline', duration: 40000, color: '#4ee1c1', highlight: 'NEWEST FIND' }
  };
  const ORDER = ['crowd', 'gem', 'throwback', 'fresh'];

  /* ---------- Text matching ---------- */
  const FOLD = { 'ø': 'o', 'æ': 'ae', 'œ': 'oe', 'ß': 'ss', 'ł': 'l', 'đ': 'd', 'ð': 'd', 'þ': 'th', 'ı': 'i' };
  const ARTICLES = new Set(['the', 'a', 'an']);
  const STOP = new Set(['and', 'of', 'in', 'on', 'to', 'de', 'la', 'le', 'el', 'da', 'di', 'du', 'des', 'van', 'von', 'der']);
  const fold = value => String(value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[øæœßłđðþı]/g, c => FOLD[c]).replace(/&/g, ' and ').replace(/\+/g, 'plus').replace(/#/g, 'sharp')
    .replace(/(\d)\.(\d)/g, '$1d$2');
  /* "Windows 1.0" and "Windows 10" stay different; "The Hobbit" equals "Hobbit". */
  const normalize = value => fold(value).replace(/^[^a-z0-9]*(the|a|an)\s+/, '').replace(/[^a-z0-9]/g, '');
  const words = value => fold(value).split(/[^a-z0-9]+/).filter(w => w && !ARTICLES.has(w));
  const keyCache = new WeakMap();
  function keysOf(answer) {
    let keys = keyCache.get(answer);
    if (!keys) { keys = [...new Set([answer.name, ...answer.aliases].map(normalize).filter(Boolean))]; keyCache.set(answer, keys); }
    return keys;
  }
  const IRREGULAR = { mice: 'mouse', geese: 'goose', oxen: 'ox', teeth: 'tooth', feet: 'foot', lice: 'louse', cacti: 'cactus', fungi: 'fungus', octopi: 'octopus', wolves: 'wolf', leaves: 'leaf', knives: 'knife', calves: 'calf', halves: 'half', loaves: 'loaf', thieves: 'thief' };
  function variants(n) {
    const out = [n];
    if (IRREGULAR[n]) out.push(IRREGULAR[n]);
    if (n.length > 4 && n.endsWith('ies')) out.push(n.slice(0, -3) + 'y');
    if (n.length > 4 && n.endsWith('es')) out.push(n.slice(0, -2));
    if (n.length > 3 && n.endsWith('s') && !n.endsWith('ss')) out.push(n.slice(0, -1));
    if (n.length > 2) out.push(n + 's');
    return out;
  }
  function lookup(question, value) {
    const n = normalize(value);
    if (!n) return null;
    for (const v of variants(n)) {
      const hit = question.answers.find(a => keysOf(a).includes(v));
      if (hit) return hit;
    }
    return null;
  }
  function distance(a, b) {
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const row = [i];
      for (let j = 1; j <= b.length; j++) row[j] = Math.min(row[j - 1] + 1, prev[j] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = row;
    }
    return prev[b.length];
  }
  function containsRun(hay, needle) {
    outer: for (let i = 0; i + needle.length <= hay.length; i++) {
      for (let j = 0; j < needle.length; j++) if (hay[i + j] !== needle[j]) continue outer;
      return true;
    }
    return false;
  }
  /* For an unrecognised entry: one likely answer ({ answer }), several that share
     the typed words ({ several }), or null. */
  function suggestion(question, value) {
    const n = normalize(value);
    if (n.length < 3 || n.length > 100) return null;
    const typed = words(value);
    if (typed.length && !(typed.length === 1 && STOP.has(typed[0]))) {
      const hits = question.answers.filter(a => [a.name, ...a.aliases].some(s => containsRun(words(s), typed)));
      if (hits.length === 1) return { answer: hits[0] };
      if (hits.length > 1) return { several: hits };
    }
    if (n.length < 4) return null;
    const limit = n.length >= 8 ? 2 : 1;
    let best = null, bestDistance = Infinity, tie = false;
    for (const a of question.answers) {
      for (const k of keysOf(a)) {
        if (Math.abs(k.length - n.length) > limit) continue;
        const d = distance(n, k);
        if (d > limit) continue;
        if (d < bestDistance) { best = a; bestDistance = d; tie = false; }
        else if (d === bestDistance && best !== a) tie = true;
      }
    }
    return best && !tie ? { answer: best } : null;
  }

  /* ---------- Decks and scoring ---------- */
  const hash = value => { let h = 2166136261; for (const c of String(value)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const random = seed => { let a = hash(seed); return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const pool = (questions, mode) => questions.filter(q => q.kind === MODES[mode]?.kind);
  function deck(seed, questions, mode) {
    const rng = random(mode + ':' + seed), cards = [...pool(questions, mode)];
    if (cards.length < ROUNDS) throw new Error('Not enough questions for ' + mode);
    for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
    return cards.slice(0, ROUNDS).map(q => q.id);
  }
  const yearCache = new WeakMap();
  function yearsOf(question) {
    let years = yearCache.get(question);
    if (!years) { years = [...new Set(question.answers.map(a => a.year))].sort((a, b) => a - b); yearCache.set(question, years); }
    return years;
  }
  const CROWD = { 10: 100, 30: 85, 60: 60, 85: 30, 100: 10 };
  /* Ranked questions store a rarity tier (10 = very common ... 100 = very rare).
     Timeline questions are scored by the rank of the answer's year among the
     distinct years in that question, so equal years always score equally. */
  function scoreAnswer(question, answer, mode) {
    const m = MODES[mode];
    if (!answer || !m || question.kind !== m.kind) return 0;
    if (mode === 'gem') return answer.points;
    if (mode === 'crowd') return CROWD[answer.points] ?? 0;
    const years = yearsOf(question);
    if (years.length === 1) return 100;
    const rank = years.indexOf(answer.year) / (years.length - 1);
    return Math.round(10 + 90 * (mode === 'throwback' ? 1 - rank : rank));
  }
  const bestAnswers = (question, mode) => question.answers.filter(a => scoreAnswer(question, a, mode) === 100);
  const levels = [
    { min: 0, name: 'Lost in the clouds', color: '#7f87a6' },
    { min: 10, name: 'A faint glimmer', color: '#9fb0d6' },
    { min: 30, name: 'A warm glow', color: '#7cc8ff' },
    { min: 60, name: 'A bright star', color: '#6fe7b8' },
    { min: 85, name: 'A brilliant star', color: '#c9a7ff' },
    { min: 100, name: 'Supernova!', color: '#ffd166' }
  ];
  const level = points => [...levels].reverse().find(l => points >= l.min) || levels[0];
  const total = game => game.results.reduce((sum, r) => sum + r.points, 0);
  const formatYear = year => year < 0 ? (-year).toLocaleString('en-GB') + ' BCE' : String(year);
  function highlight(game) {
    const m = MODES[game.mode];
    if (m.kind === 'timeline') {
      const dated = game.results.filter(r => r.year !== null);
      if (!dated.length) return { label: m.highlight, value: '—', note: 'NOTHING DATED YET' };
      const pick = dated.reduce((p, r) => (game.mode === 'throwback' ? r.year < p.year : r.year > p.year) ? r : p);
      return { label: m.highlight, value: formatYear(pick.year), note: pick.answer.toUpperCase() };
    }
    const top = game.results.filter(r => r.base >= 85).length;
    return { label: m.highlight, value: String(top), note: top === 1 ? 'TOP-TIER ANSWER' : 'TOP-TIER ANSWERS' };
  }

  /* ---------- Game state ---------- */
  const bankVersion = () => (root.GuessData?.version || 0) + '.' + (root.GuessTimeline?.version || 0);
  function newGame(seed, questions, options = {}) {
    const mode = MODES[options.mode] ? options.mode : 'crowd';
    return { schema: 3, bank: bankVersion(), id: String(seed), mode, challenge: options.challenge === 'daily' ? 'daily' : 'unlimited', timed: options.timed !== false, deck: deck(seed, questions, mode), round: 0, phase: 'question', results: [], remaining: MODES[mode].duration, hinted: false, draft: '', recorded: false };
  }
  function submit(game, question, value, reason = 'answer') {
    if (game.phase !== 'question' || question.id !== game.deck[game.round] || !['answer', 'skip', 'timeout'].includes(reason)) return false;
    const match = reason === 'answer' ? lookup(question, value) : null;
    if (reason === 'answer' && !match) return false;
    const base = match ? scoreAnswer(question, match, game.mode) : 0;
    game.results.push({ question: question.id, answer: match?.name || '', points: match ? Math.max(0, base - (game.hinted ? 10 : 0)) : 0, base, year: match && question.kind === 'timeline' ? match.year : null, hinted: game.hinted, reason });
    game.phase = 'result'; game.draft = '';
    return true;
  }
  function advance(game) {
    if (game.phase !== 'result') return false;
    if (game.round === ROUNDS - 1) game.phase = 'finished';
    else { game.round++; game.phase = 'question'; game.remaining = MODES[game.mode].duration; game.hinted = false; game.draft = ''; }
    return true;
  }
  function validGame(g, questions) {
    try {
      if (!g || g.schema !== 3 || g.bank !== bankVersion() || typeof g.id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(g.id) || !MODES[g.mode] || !['unlimited', 'daily'].includes(g.challenge) || typeof g.timed !== 'boolean') return false;
      if (!Array.isArray(g.deck) || g.deck.length !== ROUNDS || g.deck.join('|') !== deck(g.id, questions, g.mode).join('|')) return false;
      if (!Number.isInteger(g.round) || g.round < 0 || g.round >= ROUNDS || !['question', 'result', 'finished'].includes(g.phase) || !Array.isArray(g.results)) return false;
      const count = g.phase === 'question' ? g.round : g.round + 1;
      if (g.results.length !== count || (g.phase === 'finished' && count !== ROUNDS) || !Number.isFinite(g.remaining) || g.remaining < 0 || g.remaining > MODES[g.mode].duration || typeof g.hinted !== 'boolean' || typeof g.draft !== 'string' || g.draft.length > 100 || typeof g.recorded !== 'boolean') return false;
      return g.results.every((r, i) => {
        const q = questions.find(item => item.id === g.deck[i]);
        if (!q || !r || r.question !== q.id || typeof r.hinted !== 'boolean' || !['answer', 'skip', 'timeout'].includes(r.reason)) return false;
        const a = r.reason === 'answer' ? q.answers.find(item => item.name === r.answer) : null, base = a ? scoreAnswer(q, a, g.mode) : 0;
        return r.reason === 'answer'
          ? !!a && r.base === base && r.points === Math.max(0, base - (r.hinted ? 10 : 0)) && r.year === (q.kind === 'timeline' ? a.year : null)
          : r.answer === '' && r.points === 0 && r.base === 0 && r.year === null;
      });
    } catch { return false; }
  }

  root.GuessEngine = { ROUNDS, MODES, ORDER, normalize, words, hash, random, pool, deck, lookup, suggestion, scoreAnswer, bestAnswers, level, levels, total, formatYear, highlight, newGame, submit, advance, validGame };
  if (typeof module !== 'undefined') module.exports = root.GuessEngine;
})(typeof window !== 'undefined' ? window : globalThis);
