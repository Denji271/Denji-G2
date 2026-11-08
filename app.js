/* Page logic: home screen, rounds, timer, saving, dialogs and sharing. */
(function () {
  'use strict';
  const E = window.GuessEngine, D = window.GuessData, T = window.GuessTimeline, Scene = window.Scene;
  const questions = [...D.questions, ...T.questions];
  const byId = new Map(questions.map(q => [q.id, q]));
  const answerCount = questions.reduce((sum, q) => sum + q.answers.length, 0);
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => new Intl.NumberFormat('en-GB').format(n);
  const KEYS = { game: 'guessgame.v3.game', stats: 'guessgame.v3.stats', settings: 'guessgame.v3.settings' };
  const svg = body => '<svg viewBox="0 0 24 24" aria-hidden="true">' + body + '</svg>';
  const ICONS = {
    crowd: svg('<circle cx="12" cy="8" r="3.2"/><path d="M5.6 20c.6-3.6 3.1-5.6 6.4-5.6s5.8 2 6.4 5.6"/><circle cx="4.9" cy="10.4" r="2"/><circle cx="19.1" cy="10.4" r="2"/><path d="M1.9 17.6c.4-2 1.5-3.2 3.2-3.6M22.1 17.6c-.4-2-1.5-3.2-3.2-3.6"/>'),
    gem: svg('<path d="M6.5 4h11l4 5.5L12 21 2.5 9.5Z"/><path d="M2.5 9.5h19M9 4 7.8 9.5 12 21l4.2-11.5L15 4"/>'),
    throwback: svg('<path d="M3.6 12a8.4 8.4 0 1 0 2.5-6"/><path d="M3 3.8v4.5h4.5"/><path d="M12 7.6V12l3 2"/>'),
    fresh: svg('<path d="M11 2.5c.7 4.5 2.4 6.2 6.9 6.9-4.5.7-6.2 2.4-6.9 6.9-.7-4.5-2.4-6.2-6.9-6.9 4.5-.7 6.2-2.4 6.9-6.9Z"/><path d="M18.5 14.8c.3 1.8 1 2.5 2.8 2.8-1.8.3-2.5 1-2.8 2.8-.3-1.8-1-2.5-2.8-2.8 1.8-.3 2.5-1 2.8-2.8Z"/>')
  };
  const SOUND_ON = svg('<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>');
  const SOUND_OFF = svg('<path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6m0-6-5 6"/>');
  const ARROW = svg('<path d="M5 12h14M13 6l6 6-6 6"/>');
  const CAPTIONS = { crowd: 'GREAT MINDS THINK ALIKE.', gem: 'THE BEST ANSWERS HIDE IN PLAIN SIGHT.', throwback: 'EVERY ANSWER HAS A BIRTHDAY.', fresh: 'WHAT ARRIVED MOST RECENTLY?' };
  const PERFECT = { crowd: 'One of the answers almost everyone gives. Great minds think alike!', gem: 'One of the rarest answers in this collection. A true hidden gem.', throwback: 'As old as it gets in this collection. Impressive!', fresh: 'As recent as it gets in this collection. Bang up to date!' };
  const RULE = { crowd: 'The more people who would say it, the more it is worth.', gem: 'The fewer people who would think of it, the more it is worth.', throwback: 'The older the answer, the more it is worth.', fresh: 'The newer the answer, the more it is worth.' };
  const NAMES = ['The Paper Kite', 'The Sleepy Owl', 'The Little Ferry', 'The Wandering Fox', 'The Open Book', 'The Teacup', 'The Lantern', 'The Hare', 'The Fiddle', 'The Acorn', 'The Kettle', 'The Swing', 'The Tin Robot', 'The Paper Boat', 'The Hourglass', 'The Umbrella', 'The Snail', 'The Bicycle', 'The Moth', 'The Hedgehog', 'The Windmill', 'The Accordion', 'The Night Train', 'The Pocket Watch', 'The Heron', 'The Whale’s Tail', 'The Garden Gate', 'The Comet Cat'];
  const TITLES = [[600, 'A dazzling night sky!'], [450, 'Shining bright.'], [300, 'A lovely constellation.'], [150, 'A few bright stars.'], [0, 'A cloudy night. Another go?']];
  const CODES = { crowd: 'CROWD', gem: 'GEM', throwback: 'BACK', fresh: 'FRESH' };
  const DEMO = [60, 85, 30, 100, 60, 10, 85];

  /* ---------- Storage ---------- */
  let storageFailed = false;
  function read(key, fallback) { try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); } catch { return fallback; } }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { if (!storageFailed) { storageFailed = true; toast('This browser is not saving progress, but you can still finish the game.'); } }
  }
  const stored = read(KEYS.settings, {}) || {};
  const settings = { timed: stored.timed !== false, sound: stored.sound === true, reduced: typeof stored.reduced === 'boolean' ? stored.reduced : matchMedia('(prefers-reduced-motion: reduce)').matches };
  let records = read(KEYS.stats, []);
  if (!Array.isArray(records)) records = [];
  records = records.filter(r => r && typeof r.key === 'string' && E.MODES[r.mode] && Number.isFinite(r.score) && r.score >= 0 && r.score <= 700 && Number.isFinite(r.date)).slice(0, 200);
  let saved = read(KEYS.game, null);
  if (!E.validGame(saved, questions)) saved = null;

  /* ---------- State ---------- */
  let game = null, view = 'home', mode = saved ? saved.mode : 'crowd', challenge = 'unlimited', paused = false;
  let deadline = 0, timer = 0, toastTimer = 0, audio = null, bankQuestion = null;
  const params = new URLSearchParams(location.search), codeParam = params.get('game');
  let sharedSeed = codeParam && /^[a-zA-Z0-9_-]{1,64}$/.test(codeParam) ? codeParam : null;
  let sharedTimed = sharedSeed && ['0', '1'].includes(params.get('timed')) ? params.get('timed') === '1' : null;
  if (E.MODES[params.get('mode')]) mode = params.get('mode');
  if (sharedSeed && sharedSeed.startsWith('daily-')) challenge = 'daily';
  const ownGame = saved && sharedSeed === saved.id && mode === saved.mode;
  if (ownGame && saved.phase === 'finished') { sharedSeed = null; sharedTimed = null; }

  const dailyId = () => { const d = new Date(); return 'daily-' + d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  function newSeed() {
    try { const a = new Uint32Array(2); crypto.getRandomValues(a); return a[0].toString(36) + a[1].toString(36).slice(0, 3); }
    catch { return Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); }
  }
  function challengeURL(g) { const url = new URL(location.href); url.search = ''; url.hash = ''; url.searchParams.set('game', g.id); url.searchParams.set('mode', g.mode); url.searchParams.set('timed', g.timed ? '1' : '0'); return url; }
  function updateUrl(g) { try { window.history.replaceState(null, '', g ? challengeURL(g) : location.pathname); } catch { /* some browsers block this on file:// pages */ } }
  const codeFor = g => CODES[g.mode] + '-' + g.id + (g.timed ? '' : '-R');
  function parseCode(text) {
    const m = /^\s*(CROWD|GEM|BACK|FRESH)-([a-z0-9_-]{1,64}?)(-R)?\s*$/i.exec(text);
    if (!m) return null;
    const id = Object.keys(CODES).find(k => CODES[k] === m[1].toUpperCase());
    return { mode: id, seed: m[2].toLowerCase(), timed: !m[3] };
  }
  function toast(text) { clearTimeout(toastTimer); $('toast').textContent = text; $('toast').hidden = false; toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4500); }
  function captureTime() { if (game && game.phase === 'question' && game.timed && deadline && !paused) game.remaining = Math.max(0, Math.min(E.MODES[game.mode].duration, deadline - performance.now())); }
  function save() { if (game) { captureTime(); write(KEYS.game, game); saved = game; } }
  function stopTimer() { captureTime(); clearInterval(timer); timer = 0; deadline = 0; }
  const canHover = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

  function sound(kind) {
    if (!settings.sound) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      audio.resume().catch(() => {});
      const notes = kind === 'perfect' ? [523.25, 659.25, 783.99, 1046.5] : kind === 'good' ? [440, 554.37, 659.25] : kind === 'start' ? [329.63, 493.88] : [196, 164.81];
      notes.forEach((f, i) => {
        const osc = audio.createOscillator(), gain = audio.createGain(), t = audio.currentTime + i * .1;
        osc.type = 'triangle'; osc.frequency.value = f;
        gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(.05, t + .02); gain.gain.exponentialRampToValueAtTime(.001, t + .45);
        osc.connect(gain); gain.connect(audio.destination); osc.start(t); osc.stop(t + .5);
      });
    } catch { /* sound is optional */ }
  }

  function applySettings() {
    document.body.classList.toggle('reduced-motion', settings.reduced);
    const b = $('sound-button');
    b.setAttribute('aria-pressed', String(settings.sound)); b.setAttribute('aria-label', settings.sound ? 'Turn sound off' : 'Turn sound on');
    b.innerHTML = settings.sound ? SOUND_ON : SOUND_OFF;
    Scene.set({ reduced: settings.reduced });
  }

  /* ---------- Home ---------- */
  function updateHome() {
    const m = E.MODES[mode], timed = sharedSeed && sharedTimed !== null ? sharedTimed : settings.timed;
    document.body.dataset.mode = mode;
    document.querySelectorAll('.mode-option').forEach(button => {
      const id = button.dataset.mode, selected = id === mode;
      const done = challenge === 'daily' && records.some(r => r.id === dailyId() && r.mode === id && r.timed === settings.timed);
      button.setAttribute('aria-checked', String(selected)); button.tabIndex = selected ? 0 : -1;
      const state = button.querySelector('.mode-state'); state.textContent = done ? '✓' : ''; state.classList.toggle('done', done);
      button.setAttribute('aria-label', E.MODES[id].name + (done ? ', played today' : ''));
    });
    $('challenge-unlimited').classList.toggle('selected', challenge === 'unlimited'); $('challenge-unlimited').setAttribute('aria-pressed', String(challenge === 'unlimited'));
    $('challenge-daily').classList.toggle('selected', challenge === 'daily'); $('challenge-daily').setAttribute('aria-pressed', String(challenge === 'daily'));
    $('time-detail').textContent = timed ? m.duration / 1000 : '∞';
    $('time-unit').textContent = timed ? 'sec per round' : 'no time limit';
    const label = sharedSeed ? 'Play this challenge' : challenge === 'daily' ? 'Play today’s ' + m.name : 'Play ' + m.name;
    $('start-button').innerHTML = '<span>' + escape(label) + '</span><span class="button-icon">' + ICONS[mode] + '</span>';
    $('tier-rule').textContent = m.rule;
    $('scene-caption').textContent = CAPTIONS[mode];
    $('mode-description').innerHTML = sharedSeed
      ? 'Challenge <b>' + escape(sharedSeed) + '</b>: the same seven questions your friend played. <button type="button" class="text-button" id="clear-challenge">Play something else</button>'
      : (challenge === 'daily' ? 'One shared challenge per mode, new every day at midnight.' : 'A fresh set of seven questions every time.') + ' <button type="button" class="text-button" id="code-button">Got a challenge code?</button>';
    $('clear-challenge')?.addEventListener('click', () => { sharedSeed = null; sharedTimed = null; challenge = 'unlimited'; updateUrl(null); updateHome(); });
    $('code-button')?.addEventListener('click', showCodeEntry);
    const resume = saved && saved.phase !== 'finished' && !sharedSeed;
    $('resume-button').hidden = !resume;
    if (resume) $('resume-button').textContent = 'Continue ' + E.MODES[saved.mode].name + ' · round ' + (saved.round + 1) + ' of 7 →';
    Scene.set({ mode, view: 'home', seed: 'demo:' + mode, stars: DEMO, active: -1 });
  }
  function showHome() {
    stopTimer(); if (game) save();
    view = 'home'; paused = false;
    $('home-view').hidden = false; $('game-view').hidden = true;
    if (!sharedSeed) updateUrl(null);
    updateHome(); scrollTo(0, 0);
  }

  /* ---------- Game flow ---------- */
  const currentQuestion = () => byId.get(game.deck[game.round]);
  const starsOf = g => Array.from({ length: E.ROUNDS }, (_, i) => g.results[i] ? g.results[i].points : null);
  function begin(forceNew = false) {
    stopTimer();
    const useShared = !forceNew && !!sharedSeed;
    const id = useShared ? sharedSeed : challenge === 'daily' ? dailyId() : newSeed();
    const timed = useShared && sharedTimed !== null ? sharedTimed : settings.timed;
    const type = useShared ? (sharedSeed.startsWith('daily-') ? 'daily' : 'unlimited') : challenge;
    sharedSeed = null; sharedTimed = null;
    game = E.newGame(id, questions, { mode, challenge: type, timed });
    view = 'game'; paused = false;
    updateUrl(game); sound('start'); render(); startTimer(); save(); scrollTo(0, 0);
  }
  function resumeSaved() {
    if (!saved) return;
    stopTimer(); game = saved; mode = game.mode; view = 'game'; paused = false; sharedSeed = null; sharedTimed = null;
    updateUrl(game); render(); startTimer(); scrollTo(0, 0);
  }
  function confirmNewGame() {
    if (saved && saved.phase !== 'finished') {
      showModal('<h2 id="modal-title">Start a new game?</h2><p>You have an unfinished ' + escape(E.MODES[saved.mode].name) + ' game. Starting a new one replaces it.</p><button id="confirm-start" class="primary modal-action">Start a new game</button><button id="continue-existing" class="secondary modal-action">Continue the unfinished game</button>');
      $('confirm-start').addEventListener('click', () => { closeModal(); begin(); });
      $('continue-existing').addEventListener('click', () => { closeModal(); resumeSaved(); });
    } else begin();
  }

  function render() {
    const q = currentQuestion(), m = E.MODES[game.mode];
    const isQuestion = game.phase === 'question', isResult = game.phase === 'result', isFinished = game.phase === 'finished';
    document.body.dataset.mode = game.mode;
    $('home-view').hidden = true; $('game-view').hidden = false;
    $('question-panel').hidden = !isQuestion; $('answer-controls').hidden = !isQuestion;
    $('answer-feedback').hidden = !isResult; $('result-controls').hidden = !isResult; $('finish-panel').hidden = !isFinished;
    document.querySelector('.constellation-space').hidden = isFinished;
    renderHUD();
    if (isQuestion) renderQuestion(q, m);
    if (isResult) renderResult(q, m);
    if (isFinished) renderFinish();
    Scene.set({ mode: game.mode, view: isFinished ? 'finished' : 'game', seed: game.mode + ':' + game.id, stars: starsOf(game), active: isQuestion ? game.round : -1 });
  }
  function renderHUD() {
    const h = E.highlight(game), m = E.MODES[game.mode], score = E.total(game);
    $('highlight-label').textContent = h.label; $('highlight-value').textContent = h.value;
    $('highlight-note').textContent = h.note; $('highlight-note').title = h.note;
    $('score-value').textContent = score;
    $('mode-chip').innerHTML = ICONS[game.mode] + escape(m.name);
    $('round-label').textContent = game.phase === 'finished' ? 'COMPLETE' : 'ROUND ' + (game.round + 1) + ' / ' + E.ROUNDS;
    $('round-dots').innerHTML = game.deck.map((_, i) => {
      const r = game.results[i], cls = r ? (r.points ? 'lit' : 'dark') : i === game.round && game.phase === 'question' ? 'active' : '';
      return '<span class="' + cls + '"' + (r && r.points ? ' style="--c:' + E.level(r.points).color + '"' : '') + '></span>';
    }).join('');
    $('round-dots').setAttribute('aria-label', 'Round ' + Math.min(game.round + 1, E.ROUNDS) + ' of ' + E.ROUNDS + ', ' + score + ' points so far');
  }
  function renderQuestion(q, m) {
    $('category-label').textContent = q.category; $('question-title').textContent = q.title;
    $('question-note').textContent = q.note; $('question-rule').textContent = m.rule;
    const input = $('answer-input');
    input.value = game.draft; input.removeAttribute('aria-invalid');
    $('submit-button').disabled = !game.draft.trim(); $('input-message').textContent = '';
    $('hint-area').hidden = !game.hinted; $('hint-button').disabled = game.hinted;
    if (game.hinted) renderHint();
    renderTimer();
    requestAnimationFrame(() => { if (!paused && !$('modal').open && canHover()) input.focus({ preventScroll: true }); });
  }
  /* "A, B and C" for a complete list, "A, B, C and 4 more" for a sample. */
  function nameList(answers) {
    const names = answers.slice(0, 3).map(a => '<b>' + escape(a.name) + '</b>'), rest = answers.length - names.length;
    if (rest > 0) return names.join(', ') + ' and ' + rest + ' more';
    return names.length < 2 ? names.join('') : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
  }
  function bestLine(q) {
    if (q.kind === 'timeline') {
      const years = q.answers.map(a => a.year), target = game.mode === 'throwback' ? Math.min(...years) : Math.max(...years);
      return (game.mode === 'throwback' ? 'Oldest' : 'Newest') + ' in this collection: ' + nameList(q.answers.filter(a => a.year === target)) + ' (' + escape(E.formatYear(target)) + ').';
    }
    const top = [...E.bestAnswers(q, game.mode)], rng = E.random(game.id + ':' + q.id);
    for (let i = top.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [top[i], top[j]] = [top[j], top[i]]; }
    return 'Worth 100 points here: ' + nameList(top) + '.';
  }
  function renderResult(q, m) {
    const r = game.results[game.results.length - 1], tier = E.level(r.points), box = $('answer-feedback');
    box.style.setProperty('--result-color', tier.color);
    const answer = r.answer ? '“' + escape(r.answer) + '”' : r.reason === 'timeout' ? 'Time’s up' : 'Skipped';
    const heading = !r.points && r.answer ? 'So close' : tier.name;
    const text = !r.points ? (r.answer ? 'That answer counts, but the hint used up its points.' : 'No star this round. The next question is a fresh start.') : r.base === 100 ? PERFECT[game.mode] : 'A valid answer. ' + RULE[game.mode];
    box.innerHTML = '<div class="result-star" aria-hidden="true">' + (r.points >= 85 ? '✦' : r.points ? '✧' : '·') + '</div>'
      + '<p class="eyebrow">' + escape(m.name) + ' · round ' + (game.round + 1) + '</p>'
      + '<h2>' + escape(heading) + '</h2>'
      + '<p class="result-answer">' + answer + '</p>'
      + (r.year !== null ? '<span class="year-badge">' + escape(E.formatYear(r.year)) + '</span>' : '')
      + '<p class="result-score">+' + r.points + ' POINTS' + (r.hinted && r.answer ? ' · HINT −10' : '') + '</p>'
      + '<p class="result-description">' + escape(text) + '</p>'
      + (r.base === 100 ? '' : '<p class="result-best">' + bestLine(q) + '</p>');
    $('next-button').innerHTML = (game.round === E.ROUNDS - 1 ? 'See your constellation' : 'Next question') + ' <span class="button-icon">' + ARROW + '</span>';
  }
  function renderTimer() {
    const secs = Math.max(0, Math.ceil(game.remaining / 1000));
    $('timer-value').textContent = game.timed ? secs : '∞';
    $('timer').classList.toggle('urgent', game.timed && secs <= 8);
    $('timer').setAttribute('aria-label', game.timed ? secs + ' seconds left' : 'No time limit');
    $('timer').querySelector('small').textContent = game.timed ? 'SEC' : 'TIME';
  }
  function startTimer() {
    if (!game || game.phase !== 'question' || view !== 'game' || paused) return;
    clearInterval(timer); timer = 0;
    if (!game.timed) { renderTimer(); return; }
    deadline = performance.now() + game.remaining;
    timer = setInterval(() => {
      if (paused || view !== 'game' || game.phase !== 'question') return;
      captureTime(); renderTimer();
      if (game.remaining <= 0) finishAnswer('', 'timeout');
    }, 100);
  }
  function finishAnswer(value, reason = 'answer') {
    if (!game || game.phase !== 'question' || paused) return;
    captureTime();
    if (game.timed && game.remaining <= 0) reason = 'timeout';
    const q = currentQuestion();
    if (!E.submit(game, q, value, reason)) { explainMiss(q, value); return; }
    stopTimer();
    const r = game.results[game.results.length - 1];
    sound(r.points >= 85 ? 'perfect' : r.points ? 'good' : 'miss');
    save(); render();
    Scene.celebrate(game.round, r.points);
    $('next-button').focus({ preventScroll: true });
  }
  function explainMiss(q, value) {
    const input = $('answer-input'), box = $('input-message'), text = value.trim();
    input.setAttribute('aria-invalid', 'true');
    if (q.kind === 'timeline' && /^-?\d{1,4}$/.test(text)) { box.textContent = 'Type a name rather than a year. The game knows the dates.'; return; }
    const s = E.suggestion(q, value);
    if (s && s.answer) box.innerHTML = 'Did you mean <button type="button" class="choice">' + escape(s.answer.name) + '</button>?';
    else if (s && s.several && s.several.length <= 4) box.innerHTML = '“' + escape(text) + '” fits more than one answer: ' + s.several.map(a => '<button type="button" class="choice">' + escape(a.name) + '</button>').join(' ');
    else if (s && s.several) box.textContent = '“' + text + '” fits several answers. Add a little more detail.';
    else box.textContent = 'That one isn’t on our list. Try another answer.';
    box.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => { input.value = b.textContent; if (game) game.draft = b.textContent; finishAnswer(b.textContent); }));
  }
  function hintAnswer() {
    const q = currentQuestion();
    const pool = q.answers.filter(a => { const s = E.scoreAnswer(q, a, game.mode); return s >= 60 && s <= 85; });
    const list = pool.length ? pool : q.answers;
    return list[E.hash(game.id + q.id + game.mode) % list.length];
  }
  function renderHint() {
    const q = currentQuestion(), a = hintAnswer(), score = E.scoreAnswer(q, a, game.mode);
    const masked = a.name.split(/\s+/).map(w => { const chars = [...w]; return chars[0] + chars.slice(1).map(c => /[\p{L}\p{N}]/u.test(c) ? '·' : c).join(''); }).join(' ');
    const letters = [...a.name.replace(/[^\p{L}\p{N}]/gu, '')].length;
    $('hint-area').textContent = 'A ' + score + '-point answer: ' + masked + ' (' + letters + ' letters' + (q.kind === 'timeline' ? ', ' + E.formatYear(a.year) : '') + '). This round now costs 10 points.';
  }

  /* ---------- Finish and sharing ---------- */
  function recordGame() {
    const key = game.mode + ':' + game.id + ':' + (game.timed ? 'timed' : 'relaxed'), score = E.total(game);
    const others = records.filter(r => r.mode === game.mode && r.timed === game.timed && r.key !== key);
    const previousBest = Math.max(0, ...others.map(r => r.score)), existing = records.find(r => r.key === key);
    if (!existing || score > existing.score) {
      records = [{ key, id: game.id, mode: game.mode, score, date: Date.now(), challenge: game.challenge, timed: game.timed, points: game.results.map(r => r.points) }, ...records.filter(r => r.key !== key)].slice(0, 200);
      write(KEYS.stats, records);
    }
    const best = !game.recorded && others.length > 0 && score > previousBest;
    if (!game.recorded) { game.recorded = true; save(); }
    return best;
  }
  function renderFinish() {
    const best = recordGame(), score = E.total(game), m = E.MODES[game.mode], h = E.highlight(game);
    const name = NAMES[E.hash(game.mode + ':' + game.id) % NAMES.length], title = TITLES.find(([min]) => score >= min)[1];
    const extra = m.kind === 'timeline' ? h.label + ' ' + h.value : h.value + ' ' + h.label;
    $('finish-panel').innerHTML = '<p class="eyebrow">' + escape(m.name) + ' · ' + (game.challenge === 'daily' ? 'daily challenge' : 'game complete') + '</p>'
      + '<h2 id="finish-title">' + escape(title) + '</h2>'
      + '<p class="finish-sub">Your seven answers drew <b>' + escape(name) + '</b>.</p>'
      + '<div class="final-constellation" aria-hidden="true"></div>'
      + '<div class="final-score">' + score + '<small> / 700</small></div>'
      + '<p class="final-meta">' + (game.timed ? 'TIMED' : 'RELAXED') + ' · ' + escape(extra) + '</p>'
      + (best ? '<div class="personal-best">✦ NEW PERSONAL BEST IN ' + escape(m.name.toUpperCase()) + '</div>' : '')
      + '<ol class="result-list">' + game.results.map((r, i) => {
        const q = byId.get(r.question), tier = E.level(r.points);
        const shown = r.answer ? escape(r.answer) : r.reason === 'skip' ? 'Skipped' : 'Time’s up';
        return '<li><span class="round-number">0' + (i + 1) + '</span><div class="result-text"><small>' + escape(q.title) + '</small><b>' + shown
          + (r.year !== null ? ' <span class="inline-year">· ' + escape(E.formatYear(r.year)) + '</span>' : '') + (r.hinted ? ' <span title="Hint used">✧</span>' : '')
          + '</b></div><button type="button" data-bank="' + escape(q.id) + '" style="color:' + tier.color + '" aria-label="Round ' + (i + 1) + ', ' + r.points + ' points. See all answers">+' + r.points + ' ↗</button></li>';
      }).join('') + '</ol>'
      + '<div class="finish-actions"><button id="play-again" class="primary">Play ' + escape(m.name) + ' again <span class="button-icon">' + ICONS[game.mode] + '</span></button><button id="share-button" class="secondary">Challenge a friend</button></div>'
      + '<button id="finish-home" class="text-button finish-back">Choose another mode</button>';
    $('play-again').addEventListener('click', () => { challenge = 'unlimited'; mode = game.mode; begin(true); });
    $('share-button').addEventListener('click', shareGame);
    $('finish-home').addEventListener('click', () => { sharedSeed = null; showHome(); });
    $('finish-panel').querySelectorAll('[data-bank]').forEach(b => b.addEventListener('click', () => showAnswers(byId.get(b.dataset.bank))));
  }
  /* Plain http:// on a home network is not a "secure context", so the modern
     clipboard API is missing there; fall back to the older copy command. */
  function legacyCopy(text) {
    const area = document.createElement('textarea');
    area.value = text; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0';
    $('modal').appendChild(area); area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    area.remove();
    return ok;
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).catch(() => { if (!legacyCopy(text)) throw new Error('copy failed'); });
    return legacyCopy(text) ? Promise.resolve() : Promise.reject(new Error('copy failed'));
  }
  function shareGame() {
    const m = E.MODES[game.mode], local = location.protocol === 'file:', code = codeFor(game);
    const link = local ? 'Challenge code: ' + code : challengeURL(game).href;
    const marks = game.results.map(r => r.points >= 100 ? '🌟' : r.points >= 85 ? '⭐' : r.points >= 60 ? '✨' : r.points ? '🔹' : '▪️').join('');
    const text = 'GuessGame ' + m.symbol + ' ' + m.name + ' · ' + E.total(game) + '/700\n' + marks + '\n' + link;
    showModal('<h2 id="modal-title">Same questions, different answers.</h2>'
      + '<p>' + (local ? 'Open the game through your web server to get a link. Until then, a friend can type this code on the home screen:' : 'Send this link to anyone on your network. They get the same mode, questions and timer. The code works too.') + '</p>'
      + '<label class="sr-only" for="share-value">Challenge link</label><input readonly id="share-value" class="share-input" value="' + escape(local ? code : challengeURL(game).href) + '">'
      + '<pre class="share-preview">' + escape(text) + '</pre>'
      + '<button id="copy-share" class="primary modal-action">Copy result and link</button>'
      + '<p id="share-status" class="fine-print" role="status">Code: ' + escape(code) + ' · everyone plays on their own device and scores are not synced.</p>');
    $('share-value').addEventListener('focus', e => e.target.select());
    $('copy-share').addEventListener('click', () => copyText(text)
      .then(() => { $('share-status').textContent = 'Copied! Paste it into a message.'; })
      .catch(() => { $('share-value').select(); $('share-status').textContent = 'Copying is blocked here. Select the link above and copy it by hand.'; }));
  }
  function showCodeEntry() {
    showModal('<h2 id="modal-title">Play a friend’s challenge</h2><p>Type the code from the end of their game, for example <strong>GEM-k3x9q2a</strong>.</p>'
      + '<label class="sr-only" for="code-value">Challenge code</label><input id="code-value" class="share-input" placeholder="CODE-…" autocomplete="off" spellcheck="false" autocapitalize="characters">'
      + '<p id="code-status" class="fine-print" role="status"></p><button id="code-play" class="primary modal-action">Play this challenge</button>');
    const input = $('code-value');
    const go = () => {
      const parsed = parseCode(input.value);
      if (!parsed) { $('code-status').textContent = 'That doesn’t look like a challenge code. It starts with CROWD, GEM, BACK or FRESH.'; return; }
      closeModal(); mode = parsed.mode; sharedSeed = parsed.seed; sharedTimed = parsed.timed;
      challenge = parsed.seed.startsWith('daily-') ? 'daily' : 'unlimited';
      updateHome(); confirmNewGame();
    };
    $('code-play').addEventListener('click', go);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    setTimeout(() => input.focus(), 50);
  }

  /* ---------- Dialogs ---------- */
  function showModal(content) {
    if (view === 'game' && game && game.phase === 'question' && !paused) { stopTimer(); paused = true; save(); }
    $('modal-content').innerHTML = content;
    if (!$('modal').open) $('modal').showModal();
  }
  function closeModal() { if ($('modal').open) $('modal').close(); }
  function onModalClosed() {
    if (paused && view === 'game') {
      paused = false; startTimer();
      if (game.phase === 'question' && canHover()) $('answer-input').focus({ preventScroll: true });
    }
  }
  function showHelp() {
    showModal('<h2 id="modal-title">How to play</h2>'
      + '<div class="help-modes">' + E.ORDER.map(id => '<div><b style="color:' + E.MODES[id].color + '">' + ICONS[id] + escape(E.MODES[id].name) + '</b><span>' + escape(E.MODES[id].objective) + '.</span></div>').join('') + '</div>'
      + '<ol><li>Every game has <strong>seven questions</strong>. Type one answer for each.</li>'
      + '<li>You get <strong>30 seconds</strong> a round in Crowd Pleaser and <strong>40 seconds</strong> in the other modes. If an answer isn’t recognised, try again until time runs out. You can switch the clock off in Settings.</li>'
      + '<li>Every accepted answer is worth <strong>10 to 100 points</strong>, up to 700 a game. Crowd Pleaser rewards the answers most people give; Hidden Gem rewards the ones hardly anyone gives.</li>'
      + '<li>In Throwback and Fresh Pick, <strong>type a name, not a year</strong>. Answers are ranked by date within each question, and equal years score the same.</li>'
      + '<li>A hint shows part of an answer and costs <strong>10 points</strong>. Skipping or running out of time scores zero.</li></ol>'
      + '<p>Capitals, accents and punctuation don’t matter, and plurals are fine. After a small typo the game offers the answer it thinks you meant.</p>'
      + '<p class="fine-print">' + D.questions.length + ' categories for Crowd Pleaser and Hidden Gem, ' + T.questions.length + ' for Throwback and Fresh Pick, ' + fmt(answerCount) + ' answers in all. The lists are big but not complete, and the popularity tiers are hand-made estimates rather than survey results.</p>'
      + '<button id="help-close" class="primary modal-action">Got it</button>');
    $('help-close').addEventListener('click', closeModal);
  }
  function showSettings() {
    showModal('<h2 id="modal-title">Settings</h2>'
      + '<label class="settings-row"><span>Play against the clock<small>30 or 40 seconds a round. Applies to new games.</small></span><input id="setting-timed" type="checkbox"' + (settings.timed ? ' checked' : '') + '></label>'
      + '<label class="settings-row"><span>Sound effects<small>Soft chimes when a star lights up.</small></span><input id="setting-sound" type="checkbox"' + (settings.sound ? ' checked' : '') + '></label>'
      + '<label class="settings-row"><span>Reduce motion<small>A still sky with no animation.</small></span><input id="setting-reduced" type="checkbox"' + (settings.reduced ? ' checked' : '') + '></label>'
      + '<p class="fine-print">Settings, progress and scores are saved in this browser only. The game pauses while a window like this is open or the tab is hidden.</p>'
      + '<button id="settings-done" class="primary modal-action">Done</button>');
    ['timed', 'sound', 'reduced'].forEach(key => $('setting-' + key).addEventListener('change', e => {
      settings[key] = e.target.checked; write(KEYS.settings, settings); applySettings();
      if (view === 'home') updateHome();
      if (key === 'sound' && settings.sound) sound('good');
    }));
    $('settings-done').addEventListener('click', closeModal);
  }
  function showStats() {
    const count = records.length, average = count ? Math.round(records.reduce((s, r) => s + r.score, 0) / count) : 0;
    showModal('<h2 id="modal-title">Your stats</h2><p>' + count + ' finished ' + (count === 1 ? 'game' : 'games') + ' · ' + average + ' points on average</p>'
      + '<div class="stats-grid">' + E.ORDER.map(id => {
        const list = records.filter(r => r.mode === id);
        return '<div><span class="stat-mode" style="color:' + E.MODES[id].color + '">' + ICONS[id] + escape(E.MODES[id].name) + '</span><b>' + Math.max(0, ...list.map(r => r.score)) + '<small> / 700</small></b><span class="stat-note">BEST · ' + list.length + (list.length === 1 ? ' GAME' : ' GAMES') + '</span></div>';
      }).join('') + '</div>'
      + (count ? '<p>Recent games</p><ul class="history-list">' + records.slice(0, 8).map(r => '<li><span>' + escape(new Date(r.date).toLocaleDateString('en-GB')) + ' · ' + escape(E.MODES[r.mode].name) + ' · ' + (r.challenge === 'daily' ? 'daily' : 'unlimited') + (r.timed ? '' : ' · relaxed') + '</span><b>' + r.score + '</b></li>').join('') + '</ul>' : '<p>No finished games yet. Your first constellation is waiting.</p>')
      + '<p class="fine-print">The last 200 different games are kept on this device. Replaying a challenge keeps your best score.</p>');
  }
  function showAnswers(question) {
    bankQuestion = question;
    const source = /^https:\/\//.test(question.source || '') ? ' <a href="' + escape(question.source) + '" target="_blank" rel="noopener noreferrer">Source ↗</a>' : '';
    showModal('<h2 id="modal-title">' + escape(question.title) + '</h2>'
      + '<p class="modal-question fine-print">' + question.answers.length + ' accepted answers, sorted by points in ' + escape(E.MODES[game.mode].name) + '</p>'
      + '<label class="sr-only" for="answer-search">Search the answers</label><input id="answer-search" class="answer-search" placeholder="Search the answers…" autocomplete="off">'
      + '<div id="answer-bank" class="answer-bank"></div>'
      + '<p class="fine-print">' + escape(question.note) + source + '</p>');
    renderBank('');
    $('answer-search').addEventListener('input', e => renderBank(e.target.value));
  }
  function renderBank(filter) {
    const q = bankQuestion, term = E.normalize(filter), mine = (game.results.find(r => r.question === q.id) || {}).answer;
    const items = q.answers
      .filter(a => !term || [a.name, ...a.aliases].some(v => E.normalize(v).includes(term)))
      .map(a => ({ a, s: E.scoreAnswer(q, a, game.mode) }))
      .sort((x, y) => y.s - x.s || (q.kind === 'timeline' ? (game.mode === 'throwback' ? x.a.year - y.a.year : y.a.year - x.a.year) : 0) || x.a.name.localeCompare(y.a.name, 'en'));
    $('answer-bank').innerHTML = items.length
      ? items.map(({ a, s }) => '<div' + (a.name === mine ? ' class="mine"' : '') + '><span>' + escape(a.name) + (q.kind === 'timeline' ? '<small>' + escape(E.formatYear(a.year)) + '</small>' : '') + '</span><b style="color:' + E.level(s).color + '">' + s + '</b></div>').join('')
      : '<p class="empty-search">No answer matches that search.</p>';
  }
  function showPause() {
    showModal('<h2 id="modal-title">Paused</h2><p>The clock has stopped. Take your time.</p><button id="resume-modal" class="primary modal-action">Keep playing</button><button id="pause-home" class="secondary modal-action">Back to the home screen</button>');
    $('resume-modal').addEventListener('click', closeModal);
    $('pause-home').addEventListener('click', () => { closeModal(); showHome(); });
  }

  /* ---------- Wiring ---------- */
  document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = ICONS[el.dataset.icon]; });
  $('tier-dots').innerHTML = [10, 30, 60, 85, 100].map((p, i) => '<i style="--c:' + E.level(p).color + ';--s:' + (5 + i * 1.5) + 'px"></i>').join('');
  const options = [...document.querySelectorAll('.mode-option')];
  options.forEach(button => button.addEventListener('click', () => { mode = button.dataset.mode; sharedSeed = null; sharedTimed = null; updateHome(); }));
  document.querySelector('.mode-list').addEventListener('keydown', e => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = options[(options.findIndex(b => b.dataset.mode === mode) + step + options.length) % options.length];
    mode = next.dataset.mode; sharedSeed = null; sharedTimed = null; updateHome(); next.focus();
  });
  $('challenge-unlimited').addEventListener('click', () => { sharedSeed = null; sharedTimed = null; challenge = 'unlimited'; updateHome(); });
  $('challenge-daily').addEventListener('click', () => { sharedSeed = null; sharedTimed = null; challenge = 'daily'; updateHome(); });
  $('start-button').addEventListener('click', confirmNewGame);
  $('resume-button').addEventListener('click', resumeSaved);
  $('home-button').addEventListener('click', () => { sharedSeed = null; sharedTimed = null; showHome(); });
  $('help-button').addEventListener('click', showHelp);
  $('footer-help').addEventListener('click', showHelp);
  $('settings-button').addEventListener('click', showSettings);
  $('stats-button').addEventListener('click', showStats);
  $('sound-button').addEventListener('click', () => { settings.sound = !settings.sound; write(KEYS.settings, settings); applySettings(); if (settings.sound) sound('good'); });
  $('close-modal').addEventListener('click', closeModal);
  $('modal').addEventListener('close', onModalClosed);
  $('modal').addEventListener('click', e => {
    if (e.target !== $('modal')) return;
    const r = $('modal').getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeModal();
  });
  $('pause-button').addEventListener('click', showPause);
  $('answer-form').addEventListener('submit', e => { e.preventDefault(); if ($('answer-input').value.trim()) finishAnswer($('answer-input').value); });
  $('answer-input').addEventListener('input', e => {
    $('submit-button').disabled = !e.target.value.trim();
    if (e.target.getAttribute('aria-invalid')) { e.target.removeAttribute('aria-invalid'); $('input-message').textContent = ''; }
    if (game && game.phase === 'question') { game.draft = e.target.value.slice(0, 100); save(); }
  });
  $('skip-button').addEventListener('click', () => finishAnswer('', 'skip'));
  $('hint-button').addEventListener('click', () => {
    if (!game || game.phase !== 'question' || game.hinted || paused) return;
    captureTime();
    if (game.timed && game.remaining <= 0) { finishAnswer('', 'timeout'); return; }
    game.hinted = true; renderHint(); $('hint-area').hidden = false; $('hint-button').disabled = true; save();
  });
  $('answers-button').addEventListener('click', () => showAnswers(currentQuestion()));
  $('next-button').addEventListener('click', () => {
    if (!game || !E.advance(game)) return;
    save(); render(); startTimer();
    if (game.phase === 'finished') scrollTo(0, 0);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game && game.phase === 'question' && view === 'game' && !paused) {
      stopTimer(); paused = true; save();
      showModal('<h2 id="modal-title">Welcome back</h2><p>The clock stopped while you were away.</p><button id="resume-return" class="primary modal-action">Keep playing</button>');
      $('resume-return').addEventListener('click', closeModal);
    }
  });
  addEventListener('pagehide', save);

  applySettings();
  if (ownGame && saved.phase !== 'finished') resumeSaved();
  else showHome();
})();
