const C="mct-v98",A=["./","./index.html","./css/app.css?v=98","./js/core.js?v=98","./js/pages.js?v=98","./js/features.js?v=98","./js/app.js?v=98","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(self.clients.claim());});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.open(C).then(cache=>cache.match(e.request).then(cached=>{const fetched=fetch(e.request).then(res=>{if(res&&res.ok&&res.type==="basic"){const cp=res.clone();cache.put(e.request,cp);}return res;}).catch(()=>cached||cache.match("./index.html"));return cached||fetched;})));});
