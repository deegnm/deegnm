/* GnM U16 Manager — offline cache
   The app page itself is network-first (so an updated index.html reaches
   installed phones as soon as they're online), falling back to the cache
   when there's no signal at the pitch. Icons and fonts are cache-first.
   Bump CACHE when the core file list changes. */
const CACHE='gnm-feile-v2';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
const cacheable=req=> req.url.startsWith(self.location.origin) || req.url.includes('fonts.');
function fromNetwork(req){
  return fetch(req).then(res=>{
    if(res.ok && cacheable(req)){
      const clone=res.clone();
      caches.open(CACHE).then(c=>c.put(req, clone));
    }
    return res;
  });
}
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  const isPage= req.mode==='navigate' || /\/(index\.html)?$/.test(new URL(req.url).pathname);
  if(isPage){
    e.respondWith(fromNetwork(req).catch(()=>caches.match(req).then(hit=>hit||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit=> hit || fromNetwork(req)));
});
