/* sw.js — Service Worker de "Nuestra Historia". Colócalo junto a index.html (misma carpeta). */
const VERSION='nh-v2';
const CORE=['./','./index.html','./sw.js','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSION).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  if(r.mode==='navigate'){ // navegación: red primero, caché si no hay internet
    e.respondWith(fetch(r).then(n=>{const k=n.clone();caches.open(VERSION).then(c=>c.put('./index.html',k));return n})
      .catch(()=>caches.match('./index.html').then(m=>m||caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(n=>{
    if(n&&n.ok&&new URL(r.url).origin===location.origin){const k=n.clone();caches.open(VERSION).then(c=>c.put(r,k))}
    return n}).catch(()=>m)));
});
