const C = 'wow-v7';
const SHELL = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks =>
      Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function _networkFirst(e, timeout) {
  return new Promise(resolve => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) { settled = true; caches.match(e.request).then(resolve); }
    }, timeout);
    fetch(e.request).then(res => {
      clearTimeout(timer);
      if (!settled) {
        settled = true;
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(C).then(c => c.put(e.request, clone));
        }
        resolve(res);
      }
    }).catch(() => {
      clearTimeout(timer);
      if (!settled) { settled = true; caches.match(e.request).then(resolve); }
    });
  });
}

function _staleWhileRevalidate(e) {
  return caches.open(C).then(cache =>
    cache.match(e.request).then(cached => {
      const fresh = fetch(e.request).then(res => {
        if (res && res.ok) cache.put(e.request, res.clone());
        return res;
      }).catch(() => null);
      return cached || fresh;
    })
  );
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;

  // Navigation or GAS API → network-first with 2.5s timeout
  if (e.request.mode === 'navigate' || url.includes('script.google.com')) {
    e.respondWith(_networkFirst(e, 2500));
    return;
  }

  // Static assets (CSS / JS / images) → stale-while-revalidate
  if (/\.(css|js|png|jpg|jpeg|webp|svg|ico|woff2?)(\?|$)/.test(url)) {
    e.respondWith(_staleWhileRevalidate(e));
    return;
  }

  // Everything else → network-first
  e.respondWith(_networkFirst(e, 2500));
});
