const C="mct-v93",A=["./","./index.html","./css/app.css?v=93","./js/core.js?v=93","./js/pages.js?v=93","./js/features.js?v=93","./js/app.js?v=93","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(self.clients.claim());});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.open(C).then(cache=>cache.match(e.request).then(cached=>{const fetched=fetch(e.request).then(res=>{if(res&&res.ok&&res.type==="basic"){const cp=res.clone();cache.put(e.request,cp);}return res;}).catch(()=>cached||cache.match("./index.html"));return cached||fetched;})));});
