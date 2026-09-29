/* Crebit Service Worker — v1.8.0
   ⚠️ בכל עדכון גרסה של האפליקציה: עדכן את CACHE לאותו מספר גרסה.
   אסטרטגיה: index.html — קודם רשת (תמיד הגרסה העדכנית), ואם אין אינטרנט — מהמטמון.
   ספריות/פונטים — מהמטמון ומתעדכנים ברקע. נתוני GitHub (api.github.com) לעולם לא נשמרים כאן. */
const CACHE='crebit-v1.8.0';
const SHELL=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(SHELL.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.hostname==='api.github.com')return;
  const isPage=req.mode==='navigate'||url.pathname.endsWith('/index.html');
  if(isPage&&url.origin===location.origin){
    e.respondWith(fetch(url.pathname,{cache:'no-store'}).then(r=>{
      if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put('index.html',cp));}
      return r;
    }).catch(()=>caches.match('index.html').then(m=>m||caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>{
    const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));}return r;}).catch(()=>hit);
    return hit||net;
  }));
});
