const C="mct-v30",A=["./","./index.html","./css/app.css?v=30","./js/core.js?v=30","./js/pages.js?v=30","./js/features.js?v=30","./js/app.js?v=30","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(self.clients.claim());});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request).then(cached=>{const fetched=fetch(e.request).then(res=>{if(res&&res.ok&&res.type==="basic"){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp));}return res;}).catch(()=>cached||caches.match("./index.html"));return cached||fetched;}));});
