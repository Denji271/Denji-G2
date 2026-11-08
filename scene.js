/* Animated night sky behind the page. Every finished round lights one star of
   the player's constellation; each mode has its own sky. Pure Canvas 2D, no
   images or network requests. Exposes window.Scene.set / celebrate / resize. */
(function () {
  'use strict';
  const canvas = document.getElementById('sky');
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  const E = window.GuessEngine;
  if (!ctx || !E) { window.Scene = { set() {}, celebrate() {}, resize() {} }; return; }

  const MODES = ['crowd', 'gem', 'throwback', 'fresh'];
  const PALETTE = {
    crowd: { top: [22, 15, 40], mid: [56, 28, 64], low: [122, 56, 60], glow: [255, 159, 104], star: [255, 232, 210] },
    gem: { top: [7, 7, 24], mid: [24, 17, 60], low: [46, 27, 94], glow: [182, 156, 255], star: [232, 224, 255] },
    throwback: { top: [20, 14, 9], mid: [43, 31, 18], low: [82, 58, 28], glow: [232, 194, 122], star: [255, 240, 210] },
    fresh: { top: [3, 16, 25], mid: [6, 42, 54], low: [9, 70, 72], glow: [78, 225, 193], star: [214, 255, 246] }
  };
  const KEYS = ['top', 'mid', 'low', 'glow', 'star'];
  const TAU = Math.PI * 2;
  const rgba = (c, a) => 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')';
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const hex = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const tierColor = points => hex(E.level(points).color);

  let width = 0, height = 0, ratio = 1, reduced = false, scheduled = 0, previous = 0, time = 0;
  let mode = 'crowd', view = 'home', seed = '', stars = [], active = -1, region = null;
  let layout = [], particles = [], shooting = null, nextShooting = 5000, geometry = null;
  const weight = { crowd: 1, gem: 0, throwback: 0, fresh: 0 };
  const colors = {};
  KEYS.forEach(k => { colors[k] = PALETTE.crowd[k].slice(); });

  const field = (() => {
    const rng = E.random('field');
    return Array.from({ length: 190 }, () => ({ x: rng(), y: Math.pow(rng(), 1.3) * .92, size: .45 + rng() * 1.15, alpha: .25 + rng() * .65, phase: rng() * TAU, speed: .0005 + rng() * .0017 }));
  })();

  function buildGeometry() {
    const rng = E.random('geometry:' + Math.round(width / 50));
    const H = Math.min(height, 1000);
    const edgeOf = x => Math.min(1, Math.abs(x / width - .5) * 2);
    const buildings = [];
    for (let x = -12; x < width + 12;) {
      const w = 26 + rng() * 52, h = H * (.045 + rng() * .06 + edgeOf(x + w / 2) * .11), windows = [];
      for (let wy = 9; wy < h - 6; wy += 9) for (let wx = 5; wx < w - 5; wx += 7) if (rng() < .42) windows.push({ x: wx, y: wy, phase: rng() * TAU, bright: rng(), on: rng() < .55 });
      buildings.push({ x, w, h, antenna: rng() < .22 ? 8 + rng() * 22 : 0, step: rng() < .3, windows });
      x += w + (rng() < .25 ? 3 + rng() * 9 : 0);
    }
    const crystals = [], count = Math.max(4, Math.ceil(width / 130));
    for (let i = 0; i < count; i++) {
      const cx = (i + .15 + rng() * .7) * (width / count), shards = [], n = 3 + Math.floor(rng() * 4);
      for (let k = 0; k < n; k++) shards.push({ dx: (rng() - .5) * 56, w: 9 + rng() * 17, h: H * (.035 + rng() * .06 + edgeOf(cx) * .1), tilt: (rng() - .5) * .55, glint: rng() * TAU });
      crystals.push({ x: cx, shards: shards.sort((a, b) => b.h - a.h) });
    }
    const towers = [];
    for (let x = -6; x < width + 6;) {
      const w = 12 + rng() * 28, h = H * (.05 + rng() * .08 + edgeOf(x + w / 2) * .13);
      towers.push({ x, w, h, antenna: rng() < .4 ? 10 + rng() * 26 : 0, phase: rng() * TAU, bands: rng() < .5 });
      x += w + 4 + rng() * 14;
    }
    geometry = {
      H, buildings, crystals, towers,
      nebula: [{ x: .18, y: .22, r: .42, c: [116, 78, 255], p: 0 }, { x: .82, y: .3, r: .38, c: [214, 88, 196], p: 2 }, { x: .55, y: .08, r: .3, c: [78, 118, 255], p: 4 }],
      aurora: [{ y: .13, amp: 26, f: .0042, s: .00024, p: 0, thick: 150, c: [78, 225, 193] }, { y: .22, amp: 20, f: .0061, s: -.00019, p: 2.1, thick: 115, c: [118, 140, 255] }, { y: .07, amp: 16, f: .0031, s: .00014, p: 4.2, thick: 95, c: [150, 255, 172] }]
    };
  }

  function resize() {
    width = Math.max(1, innerWidth); height = Math.max(1, innerHeight); ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    buildGeometry();
  }

  function computeLayout() {
    const rng = E.random('constellation:' + seed);
    layout = Array.from({ length: 7 }, (_, i) => ({ x: .08 + i * (.84 / 6) + (rng() - .5) * .07, y: .2 + rng() * .6 }));
  }

  function measure() {
    const selector = view === 'home' ? '.scene-space' : view === 'finished' ? '.final-constellation' : '.constellation-space';
    const el = document.querySelector(selector);
    if (!el || el.offsetParent === null) { region = null; return; }
    const r = el.getBoundingClientRect();
    region = r.height > 40 && r.width > 80 && r.bottom > 0 && r.top < height ? { left: r.left, top: r.top, width: r.width, height: r.height } : null;
  }
  const point = i => ({ x: region.left + layout[i].x * region.width, y: region.top + layout[i].y * region.height });

  /* ---------- Sky layers ---------- */
  function skyCrowd(a) {
    const r = Math.max(width, height) * .8, g = ctx.createRadialGradient(width / 2, height * 1.08, 10, width / 2, height * 1.08, r);
    g.addColorStop(0, rgba(PALETTE.crowd.glow, .42 * a)); g.addColorStop(.45, rgba([255, 120, 120], .12 * a)); g.addColorStop(1, rgba(PALETTE.crowd.glow, 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, width, height);
  }
  function skyGem(a, t) {
    for (const n of geometry.nebula) {
      const x = (n.x + Math.sin(t * .00003 + n.p) * .03) * width, y = (n.y + Math.cos(t * .00002 + n.p) * .02) * height, r = n.r * Math.max(width, height);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(n.c, .17 * a)); g.addColorStop(.5, rgba(n.c, .06 * a)); g.addColorStop(1, rgba(n.c, 0));
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }
  function skyThrowback(a, t) {
    const cx = width * .86, cy = height * .1, far = Math.hypot(width, height) * 1.05;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * .000012);
    ctx.strokeStyle = rgba(PALETTE.throwback.glow, .075 * a); ctx.lineWidth = 1;
    for (let r = 80; r < far; r += 80) { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); }
    for (let i = 0; i < 24; i++) { const ang = i * Math.PI / 12; ctx.beginPath(); ctx.moveTo(Math.cos(ang) * 40, Math.sin(ang) * 40); ctx.lineTo(Math.cos(ang) * far, Math.sin(ang) * far); ctx.stroke(); }
    ctx.strokeStyle = rgba(PALETTE.throwback.glow, .16 * a);
    for (let i = 0; i < 120; i++) { const ang = i * TAU / 120, r1 = 240, r2 = i % 5 ? 248 : 258; ctx.beginPath(); ctx.moveTo(Math.cos(ang) * r1, Math.sin(ang) * r1); ctx.lineTo(Math.cos(ang) * r2, Math.sin(ang) * r2); ctx.stroke(); }
    ctx.restore();
    ctx.save(); ctx.setLineDash([2, 7]); ctx.strokeStyle = rgba(PALETTE.throwback.glow, .14 * a); ctx.beginPath();
    for (let x = -10; x <= width + 10; x += 12) { const y = height * .34 - Math.sin(x / width * Math.PI) * height * .16; x < 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke(); ctx.restore();
  }
  function skyFresh(a, t) {
    for (const band of geometry.aurora) {
      const top = [], step = Math.max(14, width / 80);
      for (let x = -20; x <= width + 20; x += step) top.push([x, band.y * height + Math.sin(x * band.f + t * band.s + band.p) * band.amp + Math.sin(x * band.f * 2.3 - t * band.s * 1.7) * band.amp * .35]);
      const minY = band.y * height - band.amp * 1.4, g = ctx.createLinearGradient(0, minY, 0, minY + band.thick + band.amp * 2.8);
      g.addColorStop(0, rgba(band.c, 0)); g.addColorStop(.35, rgba(band.c, .2 * a)); g.addColorStop(1, rgba(band.c, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(top[0][0], top[0][1]);
      for (const p of top) ctx.lineTo(p[0], p[1]);
      for (let i = top.length - 1; i >= 0; i--) ctx.lineTo(top[i][0], top[i][1] + band.thick * (.75 + .25 * Math.sin(i * .7 + t * .0006)));
      ctx.closePath(); ctx.fill();
    }
    const sx = ((t * .012) % (width + 400)) - 200, sy = height * .18 + Math.sin(t * .0002) * 12;
    if (Math.sin(t * .006) > .2) { ctx.fillStyle = rgba([255, 255, 255], .75 * a); ctx.fillRect(sx, sy, 2, 2); }
    ctx.fillStyle = rgba([200, 255, 240], .25 * a); ctx.fillRect(sx - 4, sy + .5, 3, 1); ctx.fillRect(sx + 3, sy + .5, 3, 1);
  }

  /* ---------- Ground layers ---------- */
  function groundCrowd(a, t) {
    for (const b of geometry.buildings) {
      const top = height - b.h;
      ctx.fillStyle = 'rgba(15,9,25,' + (.95 * a).toFixed(3) + ')';
      ctx.fillRect(b.x, top, b.w, b.h + 2);
      if (b.step) ctx.fillRect(b.x + b.w * .2, top - 8, b.w * .6, 9);
      if (b.antenna) {
        ctx.fillRect(b.x + b.w / 2 - .75, top - b.antenna, 1.5, b.antenna);
        if (Math.sin(t * .003 + b.x) > 0) { ctx.fillStyle = rgba([255, 110, 90], .8 * a); ctx.fillRect(b.x + b.w / 2 - 1.5, top - b.antenna - 2, 3, 3); }
      }
      for (const w of b.windows) {
        const on = reduced ? w.on : Math.sin(t * .00035 + w.phase) > -.15;
        if (on) { ctx.fillStyle = rgba([255, 206, 140], (.28 + .42 * w.bright) * a); ctx.fillRect(b.x + w.x, top + w.y, 2, 3); }
      }
    }
  }
  function groundGem(a, t) {
    const base = height + 3;
    for (const c of geometry.crystals) {
      for (const s of c.shards) {
        const bx = c.x + s.dx, tipX = bx + s.tilt * s.h, shoulder = s.h * .8;
        ctx.beginPath(); ctx.moveTo(bx - s.w / 2, base); ctx.lineTo(bx - s.w / 2 + s.tilt * shoulder, base - shoulder); ctx.lineTo(tipX, base - s.h); ctx.lineTo(bx + s.w / 2 + s.tilt * shoulder, base - shoulder); ctx.lineTo(bx + s.w / 2, base); ctx.closePath();
        const g = ctx.createLinearGradient(0, base - s.h, 0, base);
        g.addColorStop(0, 'rgba(58,36,112,' + (.95 * a).toFixed(3) + ')'); g.addColorStop(1, 'rgba(10,6,26,' + (.98 * a).toFixed(3) + ')');
        ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = rgba(PALETTE.gem.glow, .28 * a); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tipX, base - s.h); ctx.lineTo(bx + s.tilt * shoulder * .3, base); ctx.stroke();
        const glint = reduced ? 0 : Math.max(0, Math.sin(t * .0011 + s.glint)) ** 12;
        if (glint > .02) {
          ctx.strokeStyle = rgba([255, 255, 255], glint * .9 * a); const L = 3 + glint * 6;
          ctx.beginPath(); ctx.moveTo(tipX - L, base - s.h); ctx.lineTo(tipX + L, base - s.h); ctx.moveTo(tipX, base - s.h - L); ctx.lineTo(tipX, base - s.h + L); ctx.stroke();
        }
      }
    }
  }
  function groundThrowback(a) {
    const H = geometry.H, ink = 'rgba(16,11,6,' + (.96 * a).toFixed(3) + ')';
    ctx.fillStyle = ink; ctx.fillRect(0, height - H * .035, width, H * .04);
    const tw = Math.min(width * .3, 320), th = H * .15, tx = width * .04, ty = height - H * .035;
    ctx.fillRect(tx, ty - th * .12, tw, th * .12);
    const cols = 6, cw = tw / (cols * 2 - 1);
    for (let i = 0; i < cols; i++) ctx.fillRect(tx + i * cw * 2, ty - th * .86, cw, th * .76);
    ctx.fillRect(tx - 6, ty - th * .94, tw + 12, th * .09);
    ctx.beginPath(); ctx.moveTo(tx - 10, ty - th * .94); ctx.lineTo(tx + tw / 2, ty - th * 1.24); ctx.lineTo(tx + tw + 10, ty - th * .94); ctx.closePath(); ctx.fill();
    const dr = Math.min(width * .065, 66), dx = width - dr * 2.6, dy = height - H * .035;
    ctx.fillRect(dx - dr * 1.05, dy - dr * 1.1, dr * 2.1, dr * 1.1);
    ctx.beginPath(); ctx.arc(dx, dy - dr * 1.1, dr, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = rgba(PALETTE.throwback.glow, .3 * a); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(dx + dr * .15, dy - dr * 1.1); ctx.lineTo(dx + dr * .5, dy - dr * 1.95); ctx.stroke();
    ctx.fillStyle = ink; ctx.save(); ctx.translate(dx + dr * .3, dy - dr * 1.55); ctx.rotate(-1.05); ctx.fillRect(-4, -dr * .55, 8, dr * 1.1); ctx.restore();
  }
  function groundFresh(a, t) {
    for (const tw of geometry.towers) {
      const top = height - tw.h;
      ctx.fillStyle = 'rgba(4,20,26,' + (.95 * a).toFixed(3) + ')'; ctx.fillRect(tw.x, top, tw.w, tw.h + 2);
      ctx.fillStyle = rgba(PALETTE.fresh.glow, .1 * a); ctx.fillRect(tw.x + 2, top + 4, 1, tw.h - 4);
      if (tw.bands) { ctx.fillStyle = rgba(PALETTE.fresh.glow, .16 * a); for (let y = top + 10; y < height - 6; y += 16) ctx.fillRect(tw.x + 3, y, tw.w - 6, 1); }
      if (tw.antenna) {
        ctx.fillStyle = 'rgba(4,20,26,' + (.95 * a).toFixed(3) + ')'; ctx.fillRect(tw.x + tw.w / 2 - .75, top - tw.antenna, 1.5, tw.antenna);
        if (reduced || Math.sin(t * .004 + tw.phase) > .3) { ctx.fillStyle = rgba([255, 255, 255], .85 * a); ctx.fillRect(tw.x + tw.w / 2 - 1.5, top - tw.antenna - 2, 3, 3); }
      }
    }
  }
  const SKY = { crowd: skyCrowd, gem: skyGem, throwback: skyThrowback, fresh: skyFresh };
  const GROUND = { crowd: groundCrowd, gem: groundGem, throwback: groundThrowback, fresh: groundFresh };

  /* ---------- Stars and constellation ---------- */
  function drawField(t) {
    const count = Math.min(field.length, Math.max(70, Math.round(width * height / 7000)));
    for (let i = 0; i < count; i++) {
      const s = field[i], twinkle = reduced ? .8 : .55 + .45 * Math.sin(t * s.speed + s.phase);
      ctx.fillStyle = rgba(colors.star, s.alpha * twinkle);
      ctx.beginPath(); ctx.arc(s.x * width, s.y * height, s.size, 0, TAU); ctx.fill();
    }
  }
  function drawShooting(dt) {
    if (reduced) return;
    nextShooting -= dt;
    if (!shooting && nextShooting <= 0) {
      shooting = { x: width * (.15 + Math.random() * .7), y: height * (.04 + Math.random() * .2), vx: (Math.random() < .5 ? -1 : 1) * (.55 + Math.random() * .35), vy: .22 + Math.random() * .16, life: 0 };
      nextShooting = 7000 + Math.random() * 9000;
    }
    if (!shooting) return;
    shooting.life += dt;
    const p = shooting.life / 900, x = shooting.x + shooting.vx * shooting.life, y = shooting.y + shooting.vy * shooting.life;
    const g = ctx.createLinearGradient(x, y, x - shooting.vx * 140, y - shooting.vy * 140);
    g.addColorStop(0, rgba(colors.star, .85 * (1 - p))); g.addColorStop(1, rgba(colors.star, 0));
    ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - shooting.vx * 140, y - shooting.vy * 140); ctx.stroke();
    if (p >= 1) shooting = null;
  }
  function drawStar(x, y, points, t, i) {
    const c = tierColor(points), r = 2.6 + points / 100 * 4.4, pulse = reduced ? 1 : 1 + .08 * Math.sin(t * .0022 + i * 1.7);
    const glow = r * (points >= 85 ? 7.5 : 5.5) * pulse, g = ctx.createRadialGradient(x, y, 0, x, y, glow);
    g.addColorStop(0, rgba(c, .6)); g.addColorStop(.3, rgba(c, .2)); g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g; ctx.fillRect(x - glow, y - glow, glow * 2, glow * 2);
    if (points >= 85) {
      const L = r * (points >= 100 ? 5.2 : 3.6) * pulse;
      ctx.strokeStyle = rgba(c, .75); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x - L, y); ctx.lineTo(x + L, y); ctx.moveTo(x, y - L); ctx.lineTo(x, y + L); ctx.stroke();
      if (points >= 100) { ctx.strokeStyle = rgba(c, .35); ctx.beginPath(); ctx.arc(x, y, r * 2.4 * pulse, 0, TAU); ctx.stroke(); }
    }
    ctx.fillStyle = rgba(mix(c, [255, 255, 255], .6), 1); ctx.beginPath(); ctx.arc(x, y, r * .62, 0, TAU); ctx.fill();
  }
  function drawConstellation(t) {
    if (!region || !layout.length) return;
    const pts = layout.map((_, i) => point(i));
    if (view !== 'home') {
      ctx.setLineDash([1.5, 7]); ctx.strokeStyle = rgba(colors.star, .16); ctx.lineWidth = 1;
      ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke();
    }
    ctx.lineWidth = 1.2;
    for (let i = 1; i < pts.length; i++) {
      const a = stars[i - 1], b = stars[i];
      if (a === null || a === undefined || b === null || b === undefined) continue;
      const faint = !a || !b;
      ctx.setLineDash(faint ? [3, 6] : []); ctx.strokeStyle = rgba(colors.glow, faint ? .2 : .5);
      ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke();
    }
    if (active > 0 && stars[active - 1] !== null && stars[active - 1] !== undefined) {
      ctx.setLineDash([2, 8]); ctx.strokeStyle = rgba(colors.glow, .22);
      ctx.beginPath(); ctx.moveTo(pts[active - 1].x, pts[active - 1].y); ctx.lineTo(pts[active].x, pts[active].y); ctx.stroke();
    }
    ctx.setLineDash([]);
    pts.forEach((p, i) => {
      const v = stars[i];
      if (v === null || v === undefined) {
        const on = i === active, pulse = reduced ? .5 : .5 + .5 * Math.sin(t * .004);
        ctx.strokeStyle = rgba(colors.star, on ? .55 + .4 * pulse : .38); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(p.x, p.y, on ? 4.5 : 3.2, 0, TAU); ctx.stroke();
        if (on) { ctx.strokeStyle = rgba(colors.glow, .35 * (1 - pulse)); ctx.beginPath(); ctx.arc(p.x, p.y, 7 + pulse * 9, 0, TAU); ctx.stroke(); }
      } else if (!v) {
        ctx.fillStyle = rgba([150, 155, 180], .45); ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, TAU); ctx.fill();
        ctx.strokeStyle = rgba([150, 155, 180], .3); ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, TAU); ctx.stroke();
      } else drawStar(p.x, p.y, v, t, i);
    });
  }
  function drawParticles(dt) {
    particles = particles.filter(p => (p.life += dt) < p.max);
    for (const p of particles) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.gravity * dt;
      ctx.fillStyle = rgba(p.c, 1 - p.life / p.max);
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
  }
  function burst(x, y, c, count, speed, gravity) {
    for (let k = 0; k < count; k++) {
      const ang = Math.random() * TAU, v = speed * (.35 + Math.random() * .65);
      particles.push({ x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, gravity, life: 0, max: 700 + Math.random() * 800, c, size: 1 + Math.random() * 1.8 });
    }
  }

  function draw(t, dt) {
    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, rgba(colors.top, 1)); g.addColorStop(.55, rgba(colors.mid, 1)); g.addColorStop(1, rgba(colors.low, 1));
    ctx.fillStyle = g; ctx.fillRect(0, 0, width, height);
    for (const m of MODES) if (weight[m] > .01) SKY[m](weight[m], t);
    drawField(t);
    drawShooting(dt);
    for (const m of MODES) if (weight[m] > .01) GROUND[m](weight[m], t);
    const v = ctx.createRadialGradient(width / 2, height * .45, Math.min(width, height) * .25, width / 2, height * .45, Math.max(width, height) * .8);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.42)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, width, height);
    drawConstellation(t);
    drawParticles(dt);
  }

  function snap() {
    MODES.forEach(m => { weight[m] = m === mode ? 1 : 0; });
    KEYS.forEach(k => { colors[k] = PALETTE[mode][k].slice(); });
  }
  function frame(now) {
    scheduled = 0;
    const dt = previous ? Math.min(now - previous, 64) : 16;
    previous = now;
    if (document.hidden) return;
    if (!reduced) time += dt;
    const k = reduced ? 1 : Math.min(dt / 420, 1);
    MODES.forEach(m => { weight[m] += ((m === mode ? 1 : 0) - weight[m]) * k; });
    KEYS.forEach(key => { colors[key] = mix(colors[key], PALETTE[mode][key], k); });
    measure();
    draw(time, reduced ? 0 : dt);
    if (!reduced) scheduled = requestAnimationFrame(frame);
  }
  function requestDraw() { if (!scheduled) scheduled = requestAnimationFrame(frame); }

  window.Scene = {
    set(next = {}) {
      if (typeof next.reduced === 'boolean') { reduced = next.reduced; if (reduced) particles = []; }
      if (next.mode && PALETTE[next.mode]) mode = next.mode;
      if (next.view) view = next.view;
      if (typeof next.seed === 'string' && next.seed !== seed) { seed = next.seed; computeLayout(); }
      if (Array.isArray(next.stars)) stars = next.stars.slice(0, 7);
      if (Number.isInteger(next.active)) active = next.active;
      if (reduced) snap();
      requestDraw();
    },
    celebrate(index, points) {
      if (reduced || !points) return;
      measure();
      if (region && layout[index]) {
        const p = point(index);
        burst(p.x, p.y, tierColor(points), 10 + Math.round(points / 100 * 26), .05 + points / 100 * .12, 0);
      }
      if (points >= 85) {
        const c = mode === 'crowd' ? [255, 190, 120] : PALETTE[mode].glow;
        for (let i = 0; i < (points >= 100 ? 3 : 1); i++) burst(width * (.2 + Math.random() * .6), height * (.12 + Math.random() * .2), mix(c, [255, 255, 255], Math.random() * .4), 34, .16, .00012);
      }
      requestDraw();
    },
    resize() { resize(); requestDraw(); }
  };
  addEventListener('resize', () => { resize(); requestDraw(); });
  addEventListener('scroll', () => { if (reduced) requestDraw(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { previous = 0; requestDraw(); } });
  resize(); computeLayout(); requestDraw();
})();
