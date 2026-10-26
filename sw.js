const C="mct-v106";
const A=["./","./index.html","./css/app.css?v=106","./js/core.js?v=106","./js/pages.js?v=106","./js/features.js?v=106","./js/app.js?v=106","./manifest.webmanifest","./icon.svg","./icon-192.svg","./icon-512.svg"];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(C).then(cache=>cache.addAll(A)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(name=>name.startsWith("mct-v")&&name!==C).map(name=>caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET"||new URL(request.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(C);
    const cached=await cache.match(request);
    if(cached)return cached;
    try{
      const response=await fetch(request);
      if(response&&response.ok&&response.type==="basic"){
        try{await cache.put(request,response.clone());}catch(e){}
      }
      return response;
    }catch(error){
      if(request.mode==="navigate")return (await cache.match("./index.html"))||Response.error();
      return Response.error();
    }
  })());
});
