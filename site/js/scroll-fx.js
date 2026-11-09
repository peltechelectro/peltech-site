// PELTECH — animații la scroll pe homepage
(function () {
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // 1) Apariție eșalonată: galerie proiecte + carduri blog
  function stagger(sel, cls) {
    var els = document.querySelectorAll(sel);
    if (!els.length || reduced) return;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('sfx-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el, i) {
      el.classList.add(cls);
      var dl = (i % 4) * 0.09 + 's';
      if (cls === 'sfx-wipe' && el.querySelector('img')) el.querySelector('img').style.transitionDelay = dl + ',0s';
      else el.style.transitionDelay = dl;
      io.observe(el);
    });
  }
  stagger('.gallery-item', 'sfx-wipe');
  stagger('.blog-card', 'sfx-rise');
  stagger('.despre-grid > *', 'sfx-rise');

  // 2) Prețuri care cresc: „de la 1.500 lei"
  document.querySelectorAll('#pachete .service-card div').forEach(function (d) {
    if (d.children.length > 1) return;
    var m = d.firstChild && d.firstChild.nodeType === 3 && d.firstChild.textContent.match(/de la ([\d.]+) lei/);
    if (!m) return;
    var to = parseInt(m[1].replace(/\./g, ''), 10);
    var span = document.createElement('span');
    span.className = 'sfx-num'; span.textContent = reduced ? m[1] : '0';
    d.firstChild.textContent = d.firstChild.textContent.replace(m[0], 'de la ');
    d.insertBefore(span, d.firstChild.nextSibling);
    d.insertBefore(document.createTextNode(' lei '), span.nextSibling);
    if (reduced) return;
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; io.disconnect();
      var t0 = performance.now(), dur = 1400;
      (function tick(t) {
        var k = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 3)) / 10) * 10;
        span.textContent = v.toLocaleString('ro-RO');
        if (k < 1) requestAnimationFrame(tick); else span.textContent = to.toLocaleString('ro-RO');
      })(t0);
    }, { threshold: 0.6 });
    io.observe(d);
  });

  // 3) Carduri care se înclină după mouse + spot de lumină
  if (fine && !reduced) {
    document.querySelectorAll('.service-card, .blog-card').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty('--ry', ((x - 0.5) * 7).toFixed(2) + 'deg');
        c.style.setProperty('--rx', ((0.5 - y) * 6).toFixed(2) + 'deg');
        c.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        c.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        c.classList.add('sfx-tilt');
      });
      c.addEventListener('mouseleave', function () { c.classList.remove('sfx-tilt'); });
    });
  }

  // 4) „Cablul" portocaliu care se încarcă pe măsură ce derulezi
  var ids = [['acasa', 'Acasă'], ['servicii', 'Servicii'], ['pachete', 'Prețuri'], ['proiecte', 'Proiecte'], ['despre', 'Despre'], ['contact', 'Contact']];
  var secs = ids.map(function (p) { return { el: document.getElementById(p[0]), label: p[1] }; }).filter(function (s) { return s.el; });
  if (secs.length < 3) return;
  var cable = document.createElement('div');
  cable.className = 'sfx-cable'; cable.setAttribute('aria-hidden', 'true');
  cable.innerHTML = '<div class="sfx-track"></div><div class="sfx-fill"></div><div class="sfx-spark"></div>';
  secs.forEach(function (s) {
    var n = document.createElement('a');
    n.className = 'sfx-node'; n.href = '#' + s.el.id; n.tabIndex = -1;
    n.innerHTML = '<i></i><span>' + s.label + '</span>';
    cable.appendChild(n); s.node = n;
  });
  document.body.appendChild(cable);
  var fill = cable.querySelector('.sfx-fill'), spark = cable.querySelector('.sfx-spark');

  function layout() {
    var max = document.documentElement.scrollHeight - innerHeight;
    var len = cable.clientHeight;
    secs.forEach(function (s) {
      var top = s.el.getBoundingClientRect().top + scrollY;
      s.at = Math.min(1, Math.max(0, (top - innerHeight * 0.35) / max));
      s.node.style.top = (s.at * len) + 'px';
    });
    update();
  }
  var pend = false;
  function update() {
    pend = false;
    var max = document.documentElement.scrollHeight - innerHeight;
    var p = max > 0 ? Math.min(1, scrollY / max) : 0;
    var len = cable.clientHeight;
    fill.style.height = (p * len) + 'px';
    spark.style.top = (p * len) + 'px';
    secs.forEach(function (s) { s.node.classList.toggle('on', p >= s.at - 0.002); });
  }
  addEventListener('scroll', function () { if (!pend) { pend = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', layout);
  addEventListener('load', layout);
  layout();
})();
