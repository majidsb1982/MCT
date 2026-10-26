const C="mct-v100";
const A=["./","./index.html","./css/app.css?v=100","./js/core.js?v=100","./js/pages.js?v=100","./js/features.js?v=100","./js/app.js?v=100","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(C).then(cache=>cache.addAll(A)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith("mct-")&&key!==C).map(key=>caches.delete(key)));
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
      if(request.mode==="navigate"){
        return (await cache.match("./index.html"))||Response.error();
      }
      return Response.error();
    }
  })());
});
