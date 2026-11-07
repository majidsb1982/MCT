const C="mct-v122";
const A=["./","./index.html","./css/fonts.css?v=122","./fonts/Vazirmatn-var.woff2","./css/app.css?v=122","./js/vendor/qrcode.js?v=122","./js/core.js?v=122","./js/pages.js?v=122","./js/features.js?v=122","./js/app.js?v=122","./manifest.webmanifest","./icon.svg","./icon-192.svg","./icon-512.svg","./icons/maskable-512.png"];
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
/* ============ PWA 2026: اعلان و یادآوری کلاس از مسیر Service Worker ============ */
/* پیام‌ها از صفحه: اسنپ‌شات یادآوری (برای periodicSync وقتی اپ بسته است) و درخواست اعلان فوری */
self.addEventListener("message",event=>{
  const m=event.data||{};
  if(m&&m.type==="mct-reminder-snapshot"){
    event.waitUntil(caches.open("mct-reminder").then(c=>c.put("./__reminder.json",new Response(JSON.stringify(m),{headers:{"Content-Type":"application/json"}}))).catch(()=>{}));
  }else if(m&&m.type==="mct-show-reminder"&&m.title){
    event.waitUntil(self.registration.showNotification(m.title,{body:m.body||"",icon:"icon-192.svg",badge:"icon-192.svg",lang:"fa",dir:"rtl",tag:m.tag||"mct-class"}).catch(()=>{}));
  }
});
/* periodicSync — فقط روی اپ نصب‌شده کروم فعال می‌شود؛ در صورت فرارسیدن ساعت کلاس اعلان می‌دهد */
self.addEventListener("periodicsync",event=>{
  if(event.tag!=="mct-reminder")return;
  event.waitUntil((async()=>{
    try{
      const c=await caches.open("mct-reminder");
      const r=await c.match("./__reminder.json");
      if(!r)return;
      const s=await r.json();
      const due=new Date(s.dueISO).getTime(),win=new Date(s.windowISO).getTime(),now=Date.now();
      if(now>=due&&now<=win){
        await self.registration.showNotification(s.title||"کلاس",{body:s.body||"",icon:"icon-192.svg",badge:"icon-192.svg",lang:"fa",dir:"rtl",tag:s.tag||"mct-class"});
      }
    }catch(e){}
  })());
});
/* کلیک روی اعلان → فوکوس یا باز شدن اپ */
self.addEventListener("notificationclick",event=>{
  event.notification.close();
  event.waitUntil((async()=>{
    const cs=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    for(const c of cs){if("focus" in c){try{await c.focus();}catch(e){}return;}}
    return self.clients.openWindow("./");
  })());
});
