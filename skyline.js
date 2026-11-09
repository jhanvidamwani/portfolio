/* Finale: an NYC skyline that starts as a pencil sketch (an idea) and fills into a data chart (some data).
   Self-contained; mounts after #contact once the page has hydrated. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var W = 1600, H = 520, G = 500;
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Real data points from the portfolio. kind: which building carries it.
  var FACTS = {
    wtc: { k: 'Education', n: '4.0 <i>GPA</i>', l: 'M.S. Financial Technology Analytics at Stevens, finishing May 2027.' },
    empire: { k: 'AlphaSense', n: '#1 <i>of 8</i>', l: 'Top analyst on my team. Accuracy from 80% to 92%+ across 3,000+ companies.' },
    chrysler: { k: 'Research', n: '10 → 20 <i>assets</i>', l: 'Research Assistant in Statistics at Stevens, extending a crypto Value-at-Risk study.' },
    f1: { k: 'Grace Hopper 2026', n: '1 <i>of 10</i>', l: 'Stevens women selected, the only fintech student in a computer science pool.' },
    f2: { k: 'Media Club', n: '50 <i>people</i>', l: 'Creative Head at H.R. College, Mumbai.' },
    f3: { k: 'G20 panel', n: '300+', l: 'Attendees at an RBI-participated panel I ran as committee president.' },
    f4: { k: 'Finance ops', n: '0 <i>exceptions</i>', l: '1,000+ invoices at JMD Packaging with zero audit exceptions.' },
    f5: { k: 'Admissions', n: '−30%', l: 'Response time after I redesigned the workflow at Stevens Admissions.' },
    f6: { k: 'Leadership', n: 'Treasurer', l: 'Stevens Graduate Financial Association.' },
    f7: { k: 'The route', n: 'Mumbai <i>→ JC</i>', l: 'Now writing this issue from Jersey City, NJ.' }
  };

  var seed = 11;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function r(a, b) { return a + (b - a) * rnd(); }
  function cl(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function sm(a, b, x) { var t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function f1(v) { return Math.round(v * 10) / 10; }

  function pencil(a, b, amp) {
    var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    var ox = dx / len * r(1, 4), oy = dy / len * r(1, 4);
    var sx = a[0] - ox, sy = a[1] - oy, ex = b[0] + ox, ey = b[1] + oy;
    return 'M' + f1(sx) + ' ' + f1(sy) + 'Q' + f1((sx + ex) / 2 + r(-amp, amp)) + ' ' + f1((sy + ey) / 2 + r(-amp, amp)) + ' ' + f1(ex) + ' ' + f1(ey);
  }

  // ---------- city ----------
  function buildCity() {
    var L = { chrysler: 600, empire: 712, wtc: 872 };
    var bs = [], x = -20, done = {};
    while (x < W + 20) {
      for (var k in L) {
        if (!done[k] && x <= L[k] && x + 60 > L[k]) {
          var w = k === 'wtc' ? 58 : k === 'empire' ? 66 : 50;
          var h = k === 'wtc' ? 330 : k === 'empire' ? 300 : 270;
          bs.push({ x: L[k], w: w, h: h, kind: k }); done[k] = 1; x = L[k] + w + r(2, 6);
        }
      }
      var bw = r(24, 58);
      var c = Math.abs(x - 800) / 800; // taller near the middle
      var bh = r(70, 210) * (1 - c * 0.45);
      bs.push({ x: x, w: bw, h: bh, kind: rnd() < 0.3 ? 'setback' : 'box' });
      x += bw + r(1, 6);
    }
    bs.sort(function (a, b) { return a.x - b.x; });
    // tag a spread of ordinary buildings with facts
    var cands = bs.filter(function (b) { return b.kind === 'box' || b.kind === 'setback'; }).filter(function (b) { return b.h > 120 && b.w > 34 && b.x > 120 && b.x < W - 120; });
    var tags = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7'];
    var step = cands.length / tags.length;
    tags.forEach(function (t, i) { var b = cands[Math.floor(i * step + step / 2)]; if (b) b.fact = t; });
    ['wtc', 'empire', 'chrysler'].forEach(function (k) { bs.forEach(function (b) { if (b.kind === k) b.fact = k; }); });
    return bs;
  }

  function poly(b) {
    var x = b.x, w = b.w, t = G - b.h, p = [];
    if (b.kind === 'empire') return [[x, G], [x, t + 110], [x + 10, t + 110], [x + 10, t + 62], [x + 19, t + 62], [x + 19, t + 28], [x + 26, t + 28], [x + 26, t + 6], [x + w - 26, t + 6], [x + w - 26, t + 28], [x + w - 19, t + 28], [x + w - 19, t + 62], [x + w - 10, t + 62], [x + w - 10, t + 110], [x + w, t + 110], [x + w, G]];
    if (b.kind === 'chrysler') {
      p = [[x, G], [x, t + 90], [x + 7, t + 90], [x + 7, t + 58]];
      for (var i = 0; i < 4; i++) { var yy = t + 58 - i * 13, ins = 7 + i * 5; p.push([x + ins, yy], [x + ins + 3, yy - 13]); }
      p.push([x + w / 2, t - 10]);
      for (var j = 3; j >= 0; j--) { var y2 = t + 58 - j * 13, in2 = 7 + j * 5; p.push([x + w - in2 - 3, y2 - 13], [x + w - in2, y2]); }
      p.push([x + w - 7, t + 58], [x + w - 7, t + 90], [x + w, t + 90], [x + w, G]);
      return p;
    }
    if (b.kind === 'wtc') return [[x, G], [x + 3, t + 22], [x + 15, t], [x + w - 15, t], [x + w - 3, t + 22], [x + w, G]];
    if (b.kind === 'setback') { var s = w * 0.2; return [[x, G], [x, t + 28], [x + s, t + 28], [x + s, t], [x + w - s, t], [x + w - s, t + 28], [x + w, t + 28], [x + w, G]]; }
    return [[x, G], [x, t], [x + w, t], [x + w, G]];
  }
  function spireH(b) { return b.kind === 'empire' ? 70 : b.kind === 'chrysler' ? 50 : b.kind === 'wtc' ? 86 : (rnd() < 0.22 ? r(10, 28) : 0); }
  function roofY(b) { return G - b.h - (b.kind === 'chrysler' ? 10 : 0); }

  function mount() {
    var anchor = document.getElementById('work');
    if (!anchor || document.getElementById('skyline')) return;

    var sec = document.createElement('section');
    sec.id = 'skyline'; sec.className = 'sky'; sec.setAttribute('aria-label', 'Somewhere between an idea and some data');
    sec.innerHTML =
      '<div class="sky-stage">' +
      '<div class="sky-copy">' +
      '<div class="sky-kick">Jhanvi · Issue 01<b>/</b>Before the features</div>' +
      '<h2 class="sky-h"><span class="w">Somewhere</span> <span class="w">between</span>' +
      '<em><span class="w">an idea</span> <span class="w">&amp; some</span> <span class="w d">data.</span></em></h2>' +
      '</div>' +
      '<div class="sky-tip" role="status"></div>' +
      '</div>';
    anchor.parentNode.insertBefore(sec, anchor);

    var stage = sec.querySelector('.sky-stage');
    var svg = el('svg', { 'class': 'sky-svg', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'xMidYMax slice', 'aria-hidden': 'true' });
    stage.insertBefore(svg, sec.querySelector('.sky-copy'));
    var defs = el('defs', {}, svg);
    defs.innerHTML =
      '<linearGradient id="skyBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3a5e"/><stop offset=".5" stop-color="#1d2745"/><stop offset="1" stop-color="#0f1424"/></linearGradient>' +
      '<linearGradient id="skyRefl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a23b2a" stop-opacity=".25"/><stop offset="1" stop-color="#a23b2a" stop-opacity="0"/></linearGradient>' +
      '<filter id="skyGlow" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>';

    var bs = buildCity();

    // stars/snow
    var gs = el('g', {}, svg);
    for (var i = 0; i < 30; i++) el('circle', { cx: f1(r(0, W)), cy: f1(r(0, G - 40)), r: f1(r(.6, 1.6)), fill: '#f5f2ec', opacity: f1(r(.08, .3)) }, gs);

    // sketched moon
    var sk = el('g', { 'class': 'sky-sk' }, svg);
    var moon = { x: 300, y: 120, r: 38 }, md = '';
    for (var pass = 0; pass < 2; pass++) { var a0 = r(0, 6.28); for (var q = 0; q <= 44; q++) { var a = a0 + q / 44 * 6.6, rr = moon.r + r(-1, 1); md += (q ? 'L' : 'M') + f1(moon.x + Math.cos(a) * rr) + ' ' + f1(moon.y + Math.sin(a) * rr); } }
    md += pencil([moon.x - moon.r - 20, moon.y], [moon.x + moon.r + 20, moon.y], .3) + pencil([moon.x, moon.y - moon.r - 20], [moon.x, moon.y + moon.r + 20], .3);
    var sketchPaths = [];
    var moonP = el('path', { d: md, pathLength: 1, opacity: .55 }, sk);
    sketchPaths.push({ el: moonP, x: 0.12 });

    var gData = el('g', {}, svg);
    var items = [];
    bs.forEach(function (b, idx) {
      var pts = poly(b), top = roofY(b), cx = b.x + b.w / 2, sp = spireH(b);
      var xn = cl(cx / W);
      // sketch outline
      var d = '';
      for (var pp = 0; pp < 2; pp++) for (var k = 0; k < pts.length - 1; k++) d += pencil(pts[k], pts[k + 1], 1);
      if (sp) d += pencil([cx, top], [cx, top - sp], .5);
      if (rnd() < 0.3) { var n = Math.floor(b.w / 10); for (var hh = 0; hh < n; hh++) { var hx = b.x + 4 + hh * 7, y0 = top + r(20, 60); d += pencil([hx, y0], [hx + 10, y0 + r(20, 60)], .4); } }
      var sp_el = el('path', { d: d, pathLength: 1, opacity: .72 }, sk);
      sketchPaths.push({ el: sp_el, x: xn });

      // data body, revealed by a rising clip
      var g = el('g', { 'class': 'sky-b' + (b.fact ? ' has' : '') }, gData);
      var clip = el('clipPath', { id: 'skyc' + idx }, defs);
      var cr = el('rect', { x: b.x - 2, y: G, width: b.w + 4, height: 0 }, clip);
      var inner = el('g', { 'clip-path': 'url(#skyc' + idx + ')' }, g);
      var lvl = 0.35 + 0.65 * cl((b.h - 60) / 270);
      var ptsS = pts.map(function (p) { return f1(p[0]) + ',' + f1(p[1]); }).join(' ');
      el('polygon', { points: ptsS, fill: 'url(#skyBar)', 'fill-opacity': f1(0.55 + 0.35 * lvl), 'class': 'sky-body' }, inner);
      el('polygon', { points: ptsS, fill: 'none', stroke: '#e8c48d', 'stroke-opacity': .5, 'stroke-width': .8 }, inner);
      var ins = b.kind === 'empire' ? 12 : b.kind === 'chrysler' ? 9 : b.kind === 'wtc' ? 10 : 6;
      for (var wy = top + 34; wy < G - 8; wy += 11) for (var wx = b.x + ins; wx < b.x + b.w - ins - 3; wx += 8)
        if (rnd() < (innerWidth < 700 ? 0.1 : 0.16)) el('rect', { x: f1(wx), y: f1(wy), width: 3, height: 4, fill: rnd() < .7 ? '#ffd88a' : '#f5f2ec', opacity: f1(.5 + .45 * rnd()) }, inner);
      var spEl = null;
      if (sp) { spEl = el('g', { opacity: 0 }, g); el('line', { x1: cx, y1: top, x2: cx, y2: f1(top - sp), stroke: '#ecd3a8', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, spEl); el('line', { x1: cx - 5, y1: f1(top - sp), x2: cx + 5, y2: f1(top - sp), stroke: '#ecd3a8', 'stroke-width': 1.4 }, spEl); }
      var scan = el('line', { x1: b.x, x2: b.x + b.w, y1: G, y2: G, stroke: '#ffd88a', 'stroke-width': 1.6, opacity: 0 }, g);
      var pin = null;
      if (b.fact) {
        var py = top - (sp ? sp : 0) - 12;
        pin = el('g', { opacity: 0 }, g);
        el('circle', { cx: cx, cy: f1(py), r: 4, fill: '#ffd88a', 'class': 'sky-pin' }, pin);
        el('circle', { cx: cx, cy: f1(py), r: 2.6, fill: '#ffd88a' }, pin);
        // generous invisible hit area
        el('rect', { x: b.x - 3, y: f1(py - 14), width: b.w + 6, height: f1(G - py + 14), fill: 'transparent' }, g);
        g.dataset.fact = b.fact; g.dataset.cx = cx; g.dataset.top = f1(py);
      }
      items.push({ b: b, x: xn, cr: cr, top: top, sp: spEl, scan: scan, pin: pin, sketch: sp_el, cx: cx });
    });

    // ground + months axis
    el('line', { x1: 0, y1: G, x2: W, y2: G, stroke: '#f5f2ec', 'stroke-opacity': .25, 'stroke-width': .8 }, svg);
    el('rect', { x: 0, y: G, width: W, height: H - G, fill: 'url(#skyRefl)' }, svg);

    // trend line through binned peaks
    var bins = {};
    items.forEach(function (it) { var key = Math.floor(it.cx / 120); if (!bins[key] || it.top < bins[key].top) bins[key] = it; });
    var peaks = Object.keys(bins).map(function (k) { return bins[k]; }).sort(function (a, b) { return a.cx - b.cx; }).filter(function (it) { return it.cx > 20 && it.cx < W - 20; });
    var lp = peaks.map(function (it) { return [it.cx, it.top - 30 - (it.sp ? 0 : 0)]; });
    var ld = 'M' + f1(lp[0][0]) + ' ' + f1(lp[0][1]);
    for (var ci = 1; ci < lp.length; ci++) { var p0 = lp[Math.max(0, ci - 2)], p1 = lp[ci - 1], p2 = lp[ci], p3 = lp[Math.min(lp.length - 1, ci + 1)];
      ld += ' C' + f1(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f1(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f1(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f1(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f1(p2[0]) + ' ' + f1(p2[1]); }
    var line = el('path', { d: ld, fill: 'none', stroke: '#e8c48d', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, svg);
    var dots = peaks.map(function (it) { return { it: it, el: el('circle', { cx: f1(it.cx), cy: f1(it.top - 30), r: 3.2, fill: '#0d1018', stroke: '#f5f2ec', 'stroke-width': 1.4, opacity: 0 }, svg) }; });

    // handwritten notes
    var noteIdea = el('text', { x: 420, y: 230, 'class': 'sky-note', 'font-size': 34, opacity: 0, transform: 'rotate(-6 420 230)' }, svg); noteIdea.textContent = 'an idea…';
    var arrow = el('path', { d: 'M510 222 q 40 4 64 34 M572 256 l 2 -12 M572 256 l -11 -4', fill: 'none', stroke: '#f5f2ec', 'stroke-width': 1.6, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1, opacity: .8 }, svg);
    var wtcIt = items.filter(function (it) { return it.b.kind === 'wtc'; })[0];
    var noteData = el('text', { x: f1(wtcIt.cx + 48), y: f1(wtcIt.top + 40), 'class': 'sky-note', 'font-size': 32, fill: '#ffd88a', opacity: 0 }, svg); noteData.textContent = '…some data ↗';
    noteData.setAttribute('style', 'fill:#ffd88a');

    // move pencil paths to dash mode
    sketchPaths.forEach(function (s) { s.el.setAttribute('stroke-dasharray', '1'); s.el.setAttribute('stroke-dashoffset', '1'); });

    var words = sec.querySelectorAll('.sky-h .w');
    var tip = sec.querySelector('.sky-tip');

    // ---------- scroll-driven render ----------
    var target = RM ? 1 : 0, cur = target, visible = false, raf = 0, last = 0, lastDrawn = -1;
    function progress() {
      var rect = sec.getBoundingClientRect(), span = rect.height - innerHeight;
      return span > 0 ? cl(-rect.top / span) : 1;
    }
    function render(p) {
      var draw = sm(0.02, 0.36, p), fill = sm(0.34, 0.78, p), read = sm(0.74, 0.9, p);
      sketchPaths.forEach(function (s) {
        var lp = cl(draw * 1.7 - s.x * 0.7);
        s.el.setAttribute('stroke-dashoffset', f1((1 - lp) * 1000) / 1000);
      });
      noteIdea.setAttribute('opacity', f1(sm(0.22, 0.32, p) * (1 - sm(0.6, 0.72, p)) * 10) / 10);
      arrow.setAttribute('stroke-dashoffset', 1 - sm(0.26, 0.36, p));
      arrow.setAttribute('opacity', f1(0.8 * (1 - sm(0.6, 0.72, p)) * 10) / 10);
      items.forEach(function (it) {
        var fp = cl(fill * 1.6 - it.x * 0.6);
        var hh = (it.b.h + 14) * fp;
        it.cr.setAttribute('y', f1(G - hh)); it.cr.setAttribute('height', f1(hh));
        var edge = fp > 0.001 && fp < 0.999;
        it.scan.setAttribute('y1', f1(G - hh)); it.scan.setAttribute('y2', f1(G - hh));
        it.scan.setAttribute('opacity', edge ? .95 : 0);
        it.sketch.setAttribute('opacity', f1(0.72 - 0.5 * fp));
        if (it.sp) it.sp.setAttribute('opacity', sm(0.9, 1, fp));
        if (it.pin) it.pin.setAttribute('opacity', fp >= 0.999 ? read : 0);
      });
      var lp2 = sm(0.5, 0.86, p);
      line.setAttribute('stroke-dashoffset', 1 - lp2);
      dots.forEach(function (d) { d.el.setAttribute('opacity', lp2 * (W) > d.it.cx - 10 ? 1 : 0); });
      noteData.setAttribute('opacity', sm(0.8, 0.9, p));
      // copy
      var thr = [0.0, 0.04, 0.2, 0.55, 0.68];
      for (var i = 0; i < words.length; i++) words[i].classList.toggle('on', p >= thr[i] || RM);
      sec.classList.toggle('sky-done', p > 0.85);
    }
    function tick(t) {
      raf = 0;
      var dt = Math.min(64, t - (last || t)); last = t;
      target = RM ? 1 : progress();
      cur += (target - cur) * (1 - Math.exp(-dt / 110));
      if (Math.abs(target - cur) < 0.0005) cur = target;
      if (Math.abs(cur - lastDrawn) > 0.0002) { render(cur); lastDrawn = cur; }
      if (visible && cur !== target) raf = requestAnimationFrame(tick);
    }
    var io = new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !raf) { last = 0; raf = requestAnimationFrame(tick); }
      if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
    });
    io.observe(sec);
    addEventListener('scroll', function () { if (visible && !raf) { last = 0; raf = requestAnimationFrame(tick); } }, { passive: true });
    render(cur);

    // ---------- tooltips ----------
    var active = null;
    function showTip(g) {
      var f = FACTS[g.dataset.fact]; if (!f) return;
      var m = svg.getScreenCTM(); if (!m) return;
      var pt = svg.createSVGPoint(); pt.x = +g.dataset.cx; pt.y = +g.dataset.top;
      var s = pt.matrixTransform(m), sr = stage.getBoundingClientRect();
      var x = Math.max(120, Math.min(sr.width - 120, s.x - sr.left));
      tip.innerHTML = '<div class="k">' + f.k + '</div><div class="n">' + f.n + '</div><div class="l">' + f.l + '</div>';
      tip.style.left = x + 'px'; tip.style.top = Math.max(150, s.y - sr.top) + 'px';
      tip.classList.add('on');
      if (active && active !== g) active.classList.remove('act');
      active = g; g.classList.add('act');
    }
    function hideTip() { tip.classList.remove('on'); if (active) active.classList.remove('act'); active = null; }
    svg.addEventListener('pointerover', function (e) { var g = e.target.closest && e.target.closest('.sky-b.has'); if (g && cur > 0.8) showTip(g); });
    svg.addEventListener('pointerout', function (e) { var g = e.target.closest && e.target.closest('.sky-b.has'); if (g && !g.contains(e.relatedTarget)) hideTip(); });
    svg.addEventListener('click', function (e) { var g = e.target.closest && e.target.closest('.sky-b.has'); if (g && cur > 0.8) { if (active === g) hideTip(); else showTip(g); } });

  }

  function guard() {
    new MutationObserver(function () { if (!document.getElementById('skyline') && document.getElementById('work')) mount(); })
      .observe(document.body, { childList: true, subtree: true });
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
  function start() { whenHydrated(function () { mount(); guard(); }); }
  if (document.readyState === 'complete') start(); else addEventListener('load', start);
})();
