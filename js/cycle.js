/* ============================================================
   WOW.ZNAHIDKA — CARD IMAGE CYCLING
   Cards with multiple photos auto-cycle when visible.
   IntersectionObserver → zero CPU when offscreen.
   ============================================================ */
(function () {
  'use strict';

  const INTERVAL  = 2800;  // ms between photo changes
  const FADE      = 260;   // ms crossfade

  const active = new Map(); // wrap el → timer id

  function getSrcs(wrap) {
    return (wrap.dataset.cycle || '').split('|').filter(Boolean);
  }

  function addDots(wrap, count) {
    if (wrap.querySelector('.cc-dots')) return;
    const bar = document.createElement('div');
    bar.className = 'cc-dots';
    const n = Math.min(count, 6);
    for (let i = 0; i < n; i++) {
      const d = document.createElement('span');
      d.className = 'cc-dot' + (i === 0 ? ' on' : '');
      bar.appendChild(d);
    }
    wrap.appendChild(bar);
  }

  function updateDots(wrap, idx) {
    wrap.querySelectorAll('.cc-dot').forEach((d, i) => d.classList.toggle('on', i === idx));
  }

  function startCycle(wrap) {
    if (active.has(wrap)) return;
    const srcs = getSrcs(wrap);
    if (srcs.length < 2) return;
    const img = wrap.querySelector('.card-img');
    if (!img) return;

    // preload images 1-4
    srcs.forEach((s, i) => { if (i > 0) { const p = new Image(); p.src = s; } });
    addDots(wrap, srcs.length);

    let idx = 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % srcs.length;
      img.style.transition = `opacity ${FADE}ms ease`;
      img.style.opacity = '0';
      setTimeout(() => {
        img.src = srcs[idx];
        img.onload = () => { img.style.opacity = '1'; };
        updateDots(wrap, idx);
      }, FADE);
    }, INTERVAL);

    active.set(wrap, timer);
  }

  function stopCycle(wrap) {
    const timer = active.get(wrap);
    if (!timer) return;
    clearInterval(timer);
    active.delete(wrap);
    const srcs = getSrcs(wrap);
    const img  = wrap.querySelector('.card-img');
    if (img && srcs[0]) {
      img.style.transition = `opacity ${FADE}ms ease`;
      img.style.opacity = '0';
      setTimeout(() => { img.src = srcs[0]; img.style.opacity = '1'; }, FADE);
    }
    updateDots(wrap, 0);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.target.dataset.cycle) return;
      if (e.isIntersecting) startCycle(e.target);
      else stopCycle(e.target);
    });
  }, { threshold: 0.6 });

  function observeAll() {
    document.querySelectorAll('.card-img-wrap[data-cycle]').forEach(w => {
      if (!active.has(w)) obs.observe(w);
    });
  }

  // Watch for dynamically rendered cards
  new MutationObserver(observeAll).observe(
    document.getElementById('app-root') || document.body,
    { childList: true, subtree: true }
  );

  observeAll();
  window._cardCycleObserve = observeAll;
})();
