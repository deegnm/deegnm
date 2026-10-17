/* GnM U16 Manager — offline cache */
const CACHE='gnm-feile-v1';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  e.respondWith(
    caches.match(e.request).then(hit=> hit ||
      fetch(e.request).then(res=>{
        /* runtime-cache fonts and anything else that loads, so it works offline next time */
        if(res.ok && (e.request.url.startsWith(self.location.origin) || e.request.url.includes('fonts.'))){
          const clone=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request, clone));
        }
        return res;
      }).catch(()=>caches.match('./index.html'))
    )
  );
});
