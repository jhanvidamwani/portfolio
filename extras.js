/* 1) Editor's pen: hand-drawn marks + margin notes that draw themselves on each magazine spread.
   2) Building the city: a mini skyline that gets one building per chapter as you read. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      mk('polygon', { points: ps, 'class': 'fillr', fill: '#c9874a' }, fg);
      for (var wy = GY - sh[1] + 8; wy < GY - 3; wy += 5) for (var wx = x + 3; wx < x + sh[0] - 3; wx += 4) if (((wx * 7 + wy * 3) % 5) < 2) mk('rect', { x: wx, y: wy, width: 1.6, height: 2, fill: '#ffd88a' }, fg);
      var scan = mk('line', { x1: x, x2: x + sh[0], y1: GY, y2: GY, stroke: '#ffd88a', 'stroke-width': 1.2, opacity: 0 }, g);
      var pin = mk('circle', { cx: x + sh[0] / 2, cy: GY - sh[1] - 5, r: 2.2, fill: '#ffd88a', opacity: 0 }, g);
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
  var T = null, SK = null, lastKey = '';
  function updateStrip() {
    if (!city) return;
    if (!T) { T = tops(); if (T.some(function (t) { return t == null; })) { T = null; return; }
      var skEl = document.getElementById('skyline'); SK = skEl ? [skEl.getBoundingClientRect().top + scrollY, skEl.getBoundingClientRect().bottom + scrollY] : null; }
    var end = document.documentElement.scrollHeight - innerHeight * 0.4;
    var mid = scrollY + innerHeight * 0.6;
    fills = T.map(function (t, i) { var n = i < T.length - 1 ? T[i + 1] : end; return Math.max(0, Math.min(1, (mid - t) / (n - t))); });
    // the big skyline section covers chapter 01 → 02; skip ahead
    var skyOn = !!(SK && scrollY + innerHeight * 0.5 > SK[0] && scrollY + innerHeight * 0.5 < SK[1]);
    var show = scrollY > (T[1] - innerHeight * 1.2) && !skyOn;
    city.classList.toggle('on', !!show);
    cur = 0; fills.forEach(function (f, i) { if (f > 0) cur = i; });
    var key = fills.map(function (f) { return Math.round(f * 60); }).join() + '|' + cur + '|' + hover + '|' + show;
    if (key === lastKey) return; lastKey = key;
    bld.forEach(function (b, i) {
      var hh = (b.h + 2) * fills[i];
      b.cr.setAttribute('y', (GY - hh).toFixed(1)); b.cr.setAttribute('height', hh.toFixed(1));
      var edge = fills[i] > 0.01 && fills[i] < 0.99;
      b.scan.setAttribute('y1', (GY - hh).toFixed(1)); b.scan.setAttribute('y2', (GY - hh).toFixed(1)); b.scan.setAttribute('opacity', edge ? 1 : 0);
      b.pin.setAttribute('opacity', i === cur ? 1 : 0);
    });
    label();
  }


  // ---------------- toolkit as a grouped list ----------------
  function toolkit() {
    var box = document.querySelector('.balls-box'); if (!box || box.querySelector('.tk')) return;
    var G = [['Data & statistics', ['Python', 'SQL', 'Regression', 'Monte Carlo', 'DCC-GARCH', 'Bloomberg']],
      ['Machine learning', ['PyTorch', 'FinBERT', 'RAG', 'pgvector']],
      ['AI tools', ['Claude API', 'GPT-4o', 'Gemini', 'Prompts', 'Clay']],
      ['Building', ['Next.js', 'Supabase', 'Streamlit', 'GitHub Actions']]];
    var d = document.createElement('div'); d.className = 'tk';
    d.innerHTML = G.map(function (g) { return '<div><h3>' + g[0] + '</h3><ul>' + g[1].map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div>'; }).join('');
    box.appendChild(d);
  }
  // ---------------- loop ----------------
  var raf = 0;
  function frame() { raf = 0; updateStrip(); }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  function start() {
    toolkit();
    buildStrip();
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', function () { T = null; kick(); });
    setInterval(function () { T = null; }, 2000); // layout can shift as images load
    kick();
  }
  function whenHydrated(cb) {
    var n = 0;
    (function check() {
      var el = document.getElementById('contact');
      var ok = el && Object.keys(el).some(function (k) { return k.indexOf('__reactFiber') === 0; });
      if (ok || ++n > 150) { (window.requestIdleCallback || function (f) { setTimeout(f, 200); })(cb, { timeout: 1500 }); }
      else setTimeout(check, 100);
    })();
  }
  if (document.readyState === 'complete') whenHydrated(start); else addEventListener('load', function () { whenHydrated(start); });
})();
