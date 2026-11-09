/* 1) Editor's pen: hand-drawn marks + margin notes that draw themselves on each magazine spread.
   2) Building the city: a mini skyline that gets one building per chapter as you read. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------- 1. editor's pen ----------------
  // keyed by the page's running head (prefix match, lower case)
  var MARKS = [
    ['editor', [{ sel: '.mz-h em', k: 'under' }, { sel: '.mt-hook', k: 'bracket' }]],
    ['contents', [{ sel: '.mz-stats > div:nth-child(2)', k: 'circle', note: 'proudest one', pos: 'above' }, { sel: '.mz-toc li:nth-child(2) .t', k: 'under', note: '← start here', pos: 'right' }]],
    ['chapter 01', [{ sel: '.mt-big-q em', k: 'under' }]],
    ['what i do', [{ sel: '.mt-five li:nth-child(3) b', k: 'circle', note: 'my favourite ♥', pos: 'right' }]],
    ['chapter 02', [{ sel: '.mj-title em', k: 'under' }]],
    ['features', [{ text: 'Sentinel', k: 'star', note: 'start here', pos: 'right' }]],
    ['chapter 03', [{ sel: '.mj-title em', k: 'under' }]],
    ['how i think', [{ sel: '.mt-tease', k: 'circle', note: 'try them inside →', pos: 'below' }]],
    ['chapter 04', [{ sel: '.mj-title em', k: 'under' }]],
    ['the toolkit', [{ sel: '.mt-num', k: 'circle', note: 'and counting', pos: 'right' }]],
    ['chapter 05', [{ textStart: '#1', k: 'circle', note: 'top of the team', pos: 'right' }]],
    ['career', [{ text: 'Research on crypto risk', k: 'under', note: '← right now', pos: 'right' }]],
    ['chapter 06', [{ sel: '.mj-photo-cap', k: 'under', note: 'hi, that’s me ↓', pos: 'above' }]],
    ['the person', [{ textStart: '“Is pressure', k: 'circle', note: 'go read it ↗', pos: 'right' }]],
    ['chapter 07', [{ sel: '.mj-title em', k: 'under' }]],
    ['back cover', [{ sel: '.mt-mail', k: 'under', note: 'I reply, promise', pos: 'below' }]]
  ];
  var seed = 3;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function r(a, b) { return a + (b - a) * rnd(); }
  function f1(v) { return Math.round(v * 10) / 10; }

  function runOf(page) { var s = page.querySelector('.mz-run span'); return s ? s.textContent.trim().toLowerCase() : ''; }
  function specFor(key) { for (var i = 0; i < MARKS.length; i++) if (key.indexOf(MARKS[i][0]) === 0) return MARKS[i][1]; return null; }
  function find(page, m) {
    if (m.sel) return page.querySelector(m.sel);
    var all = page.querySelectorAll('span,b,i,dd,small,p,a,li');
    for (var i = 0; i < all.length; i++) {
      var t = all[i].textContent.trim();
      if ((m.text && t === m.text) || (m.textStart && t.indexOf(m.textStart) === 0)) return all[i];
    }
    return null;
  }
  function rel(el, page) {
    var a = el.getBoundingClientRect();
    try { var rg = document.createRange(); rg.selectNodeContents(el); var ra = rg.getBoundingClientRect(); if (ra.width > 1 && ra.width < a.width + 1) a = ra; } catch (e) {}
    var p = page.getBoundingClientRect(), s = p.width / (page.offsetWidth || 1);
    if (!s || !isFinite(s)) return null;
    return { x: (a.left - p.left) / s, y: (a.top - p.top) / s, w: a.width / s, h: a.height / s, pw: page.offsetWidth, ph: page.offsetHeight };
  }
  function circlePath(b) {
    var cx = b.x + b.w / 2, cy = b.y + b.h / 2, rx = b.w / 2 + 12, ry = b.h / 2 + 9, d = '', a0 = r(-2.6, -2.2), n = 36;
    for (var i = 0; i <= n; i++) {
      var a = a0 + (i / n) * Math.PI * 2.18, k = 1 + 0.05 * Math.sin(i * 0.9) + i / n * 0.06;
      d += (i ? 'L' : 'M') + f1(cx + Math.cos(a) * rx * k) + ' ' + f1(cy + Math.sin(a) * ry * k);
    }
    return d;
  }
  function underPath(b) {
    var y = b.y + b.h + 3, x0 = b.x - 4, x1 = b.x + b.w + 6;
    return 'M' + f1(x0) + ' ' + f1(y + 1) + ' C' + f1(x0 + (x1 - x0) * .3) + ' ' + f1(y - 3) + ' ' + f1(x0 + (x1 - x0) * .7) + ' ' + f1(y + 4) + ' ' + f1(x1) + ' ' + f1(y - 1) +
      ' M' + f1(x0 + 10) + ' ' + f1(y + 6) + ' C' + f1(x0 + (x1 - x0) * .4) + ' ' + f1(y + 3) + ' ' + f1(x0 + (x1 - x0) * .75) + ' ' + f1(y + 8) + ' ' + f1(x1 - 8) + ' ' + f1(y + 4);
  }
  function bracketPath(b) { var x = b.x - 14; return 'M' + f1(x + 6) + ' ' + f1(b.y - 2) + ' Q' + f1(x - 2) + ' ' + f1(b.y + b.h / 2) + ' ' + f1(x + 6) + ' ' + f1(b.y + b.h + 2); }
  function starPath(b) {
    var cx = b.x - 18, cy = b.y + b.h / 2, R = 9, d = '';
    for (var i = 0; i <= 5; i++) { var a = -Math.PI / 2 + i * Math.PI * 4 / 5; d += (i ? 'L' : 'M') + f1(cx + Math.cos(a) * R) + ' ' + f1(cy + Math.sin(a) * R); }
    return d;
  }

  function annotate(page) {
    var key = runOf(page);
    if (page.__annKey === key) return;
    if (!page.offsetWidth) return;
    var old = page.querySelector(':scope > .ann'); if (old) old.remove();
    page.__annKey = key;
    var spec = specFor(key); if (!spec) return;
    var dark = !!page.querySelector('.mj-open, .mj-photo');
    var ink = dark ? '#ffd88a' : '#5b45e0';
    var box = document.createElement('div'); box.className = 'ann';
    var svg = document.createElementNS(NS, 'svg'); box.appendChild(svg);
    var delay = 0;
    spec.forEach(function (m) {
      var el = find(page, m); if (!el) return;
      var b = rel(el, page); if (!b || b.w < 2) return;
      var d = m.k === 'circle' ? circlePath(b) : m.k === 'star' ? starPath(b) : m.k === 'bracket' ? bracketPath(b) : underPath(b);
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d); p.setAttribute('pathLength', '1'); p.setAttribute('stroke', ink);
      p.setAttribute('stroke-width', m.k === 'star' ? '1.8' : '2.2'); p.setAttribute('opacity', dark ? '.95' : '.85');
      p.style.transitionDelay = delay + 's'; svg.appendChild(p); delay += 0.55;
      if (m.note) {
        var n = document.createElement('div'); n.className = 'ann-note'; n.textContent = m.note; n.style.color = ink;
        var x, y;
        if (m.pos === 'right') { x = b.x + b.w + 18; y = b.y + b.h / 2 - 16; }
        else if (m.pos === 'above') { x = b.x + 4; y = b.y - 40; }
        else { x = b.x + 6; y = b.y + b.h + 12; }
        n.style.left = f1(Math.max(4, x)) + 'px'; n.style.top = f1(y) + 'px';
        n.style.transitionDelay = (delay - 0.15) + 's'; box.appendChild(n); delay += 0.35;
      }
    });
    page.appendChild(box);
    // fit notes that would spill off the page
    box.querySelectorAll('.ann-note').forEach(function (n) {
      var over = n.offsetLeft + n.offsetWidth - (page.offsetWidth - 8);
      if (over > 0) n.style.left = Math.max(4, n.offsetLeft - over) + 'px';
    });
    if (RM) box.classList.add('on');
    else requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add('on'); }); });
  }

  function clearAnn(page) { var a = page.querySelector(':scope > .ann'); if (a) a.remove(); page.__annKey = runOf(page) + '#pending'; }
  function cloneAnn(from, to) {
    var a = from.querySelector(':scope > .ann'), old = to.querySelector(':scope > .ann'); if (old) old.remove();
    to.__annKey = from.__annKey; if (!a) return;
    var c = a.cloneNode(true); c.querySelectorAll('path,.ann-note').forEach(function (e) { e.style.transition = 'none'; });
    c.classList.add('on'); to.appendChild(c);
  }
  function leafAngle(leaf) { var m = /rotateY\(([-\d.]+)deg\)/.exec(leaf.style.transform || ''); return m ? Math.abs(+m[1]) : 0; }
  function scanMagazine() {
    var segs = document.querySelectorAll('section.mj');
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i], rc = s.getBoundingClientRect();
      if (rc.bottom < 0 || rc.top > innerHeight) continue;
      var stage = s.querySelector('.mj-stage'); if (!stage) continue;
      var cover = s.querySelector('.mj-cover');
      if (cover && getComputedStyle(cover).visibility === 'visible' && leafAngle(cover) < 170) continue; // cover still closed
      var leaf = s.querySelector('.mj-leaf:not(.mj-cover)');
      var leafOn = leaf && getComputedStyle(leaf).visibility === 'visible';
      var L = s.querySelector('.mj-l'), Rr = s.querySelector('.mj-r'), F = leaf && leaf.querySelector('.mj-front');
      if (leafOn && leafAngle(leaf) > 0.5) {
        // mid-turn: never show ink from a page's old content
        if (L && runOf(L) !== L.__annKey) clearAnn(L);
        if (F && runOf(F) !== F.__annKey) { if (Rr && Rr.__annKey === runOf(F)) cloneAnn(Rr, F); else clearAnn(F); }
        continue;
      }
      if (L) annotate(L);
      if (leafOn) { if (F) { if (F.__annKey !== runOf(F) && Rr && Rr.__annKey === runOf(F)) cloneAnn(Rr, F); else annotate(F); } }
      else if (Rr) annotate(Rr);
    }
  }

  // ---------------- 2. building the city ----------------
  var CH = [
    { id: 'issue', t: 'What I do' }, { id: 'work', t: 'Six features' }, { id: 'think', t: 'How I think' },
    { id: 'stack', t: 'The toolkit' }, { id: 'experience', t: 'Career' }, { id: 'about', t: 'Behind it' }, { id: 'contact', t: 'Say hello' }
  ];
  // little landmark silhouettes: [w, h, shape]
  var SH = [[16, 22, 'box'], [18, 30, 'step'], [16, 26, 'spire'], [22, 34, 'empire'], [16, 24, 'box'], [20, 40, 'wtc'], [18, 28, 'step']];
  var GY = 42, city, svg, txtK, txtT, bld = [], hover = -1;
  function shape(x, w, h, s) {
    var t = GY - h;
    if (s === 'step') return [[x, GY], [x, t + 6], [x + 3, t + 6], [x + 3, t], [x + w - 3, t], [x + w - 3, t + 6], [x + w, t + 6], [x + w, GY]];
    if (s === 'spire') return [[x, GY], [x, t + 10], [x + w / 2, t], [x + w, t + 10], [x + w, GY]];
    if (s === 'empire') return [[x, GY], [x, t + 14], [x + 4, t + 14], [x + 4, t + 6], [x + 8, t + 6], [x + 8, t], [x + w - 8, t], [x + w - 8, t + 6], [x + w - 4, t + 6], [x + w - 4, t + 14], [x + w, t + 14], [x + w, GY]];
    if (s === 'wtc') return [[x, GY], [x + 1, t + 5], [x + 5, t], [x + w - 5, t], [x + w - 1, t + 5], [x + w, GY]];
    return [[x, GY], [x, t], [x + w, t], [x + w, GY]];
  }
  function mk(tag, a, p) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function buildStrip() {
    city = document.createElement('nav'); city.className = 'city'; city.setAttribute('aria-label', 'Chapters');
    city.innerHTML = '<div class="city-txt"><span class="city-k">Building the city</span><span class="city-t"></span></div>';
    svg = mk('svg', { viewBox: '0 0 176 44', 'aria-hidden': 'false' });
    city.insertBefore(svg, city.firstChild);
    txtK = city.querySelector('.city-k'); txtT = city.querySelector('.city-t');
    var defs = mk('defs', {}, svg);
    var x = 4;
    SH.forEach(function (sh, i) {
      var pts = shape(x, sh[0], sh[1], sh[2]), ps = pts.map(function (p) { return p.join(','); }).join(' ');
      var g = mk('g', { 'class': 'cb', tabindex: '0', role: 'link', 'aria-label': (i + 1) + '. ' + CH[i].t }, svg);
      var clip = mk('clipPath', { id: 'cityc' + i }, defs), cr = mk('rect', { x: x - 1, y: GY, width: sh[0] + 2, height: 0 }, clip);
      mk('polygon', { points: ps, fill: 'none', stroke: '#f4f1ea', 'stroke-opacity': .45, 'stroke-width': .9, 'stroke-dasharray': '2 1.6' }, g);
      var fg = mk('g', { 'clip-path': 'url(#cityc' + i + ')' }, g);
      mk('polygon', { points: ps, 'class': 'fillr', fill: '#7a66f0' }, fg);
      for (var wy = GY - sh[1] + 8; wy < GY - 3; wy += 5) for (var wx = x + 3; wx < x + sh[0] - 3; wx += 4) if (((wx * 7 + wy * 3) % 5) < 2) mk('rect', { x: wx, y: wy, width: 1.6, height: 2, fill: '#ffd88a' }, fg);
      var scan = mk('line', { x1: x, x2: x + sh[0], y1: GY, y2: GY, stroke: '#ffd88a', 'stroke-width': 1.2, opacity: 0 }, g);
      var pin = mk('circle', { cx: x + sh[0] / 2, cy: GY - sh[1] - 5, r: 2.2, fill: '#ffd88a', 'class': 'city-pin', opacity: 0 }, g);
      mk('rect', { 'class': 'hit', x: x - 2, y: 0, width: sh[0] + 4, height: 44 }, g);
      bld.push({ cr: cr, scan: scan, pin: pin, h: sh[1] });
      g.addEventListener('mouseenter', function () { hover = i; label(); });
      g.addEventListener('mouseleave', function () { hover = -1; label(); });
      g.addEventListener('click', function () { go(i); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(i); } });
      x += sh[0] + 6;
    });
    mk('line', { x1: 0, x2: 176, y1: GY + .5, y2: GY + .5, stroke: '#f4f1ea', 'stroke-opacity': .3, 'stroke-width': .8 }, svg);
    document.body.appendChild(city);
  }
  function go(i) {
    var el = document.getElementById(CH[i].id); if (!el) return;
    var target = el;
    if (i > 0) { var prev = el.previousElementSibling; if (prev && prev.classList.contains('mj')) target = prev; } // land at the page turn into it
    if (window.__lenis) window.__lenis.scrollTo(target, { duration: 1.6 }); else target.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  }
  var cur = 0, fills = [];
  function label() {
    var i = hover >= 0 ? hover : cur, done = fills.filter(function (f) { return f >= 0.999; }).length;
    txtK.textContent = hover >= 0 ? 'Jump to chapter' : (done >= CH.length ? 'City built ✓' : 'Building the city · ' + done + '/' + CH.length);
    txtT.innerHTML = '<em>0' + (i + 1) + '</em>' + CH[i].t;
  }
  function tops() {
    return CH.map(function (c, i) {
      var el = document.getElementById(c.id); if (!el) return null;
      var t = el; if (i > 0 && el.previousElementSibling && el.previousElementSibling.classList.contains('mj')) t = el.previousElementSibling;
      return t.getBoundingClientRect().top + scrollY;
    });
  }
  function updateStrip() {
    if (!city) return;
    var T = tops(); if (T.some(function (t) { return t == null; })) return;
    var end = document.documentElement.scrollHeight - innerHeight * 0.4;
    var mid = scrollY + innerHeight * 0.6;
    fills = T.map(function (t, i) { var n = i < T.length - 1 ? T[i + 1] : end; return Math.max(0, Math.min(1, (mid - t) / (n - t))); });
    // the big skyline section covers chapter 01 → 02; skip ahead
    var sky = document.getElementById('skyline');
    var skyOn = sky && sky.getBoundingClientRect().top < innerHeight * 0.5 && sky.getBoundingClientRect().bottom > innerHeight * 0.5;
    var work = document.getElementById('work');
    var show = work && scrollY > (T[1] - innerHeight * 1.2) && !skyOn;
    city.classList.toggle('on', !!show);
    cur = 0; fills.forEach(function (f, i) { if (f > 0) cur = i; });
    bld.forEach(function (b, i) {
      var hh = (b.h + 2) * fills[i];
      b.cr.setAttribute('y', (GY - hh).toFixed(1)); b.cr.setAttribute('height', hh.toFixed(1));
      var edge = fills[i] > 0.01 && fills[i] < 0.99;
      b.scan.setAttribute('y1', (GY - hh).toFixed(1)); b.scan.setAttribute('y2', (GY - hh).toFixed(1)); b.scan.setAttribute('opacity', edge ? 1 : 0);
      b.pin.setAttribute('opacity', i === cur ? 1 : 0);
    });
    label();
  }

  // ---------------- loop ----------------
  var raf = 0, lastScan = 0;
  function frame(t) {
    raf = 0;
    scanMagazine();
    updateStrip();
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  function start() {
    buildStrip();
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', function () { document.querySelectorAll('.ann').forEach(function (a) { a.parentNode.__annKey = null; a.remove(); }); kick(); });
    // keep sampling briefly after scroll stops so marks appear once a page settles
    setInterval(function () { scanMagazine(); }, 400);
    kick();
  }
  if (document.readyState === 'complete') setTimeout(start, 80); else addEventListener('load', function () { setTimeout(start, 80); });
})();
