"use strict";
/**
 * MCT Core — تاریخ، ذخیره، UI پایه
 * Core globals — بارگذاری قبل از app.js
 */
"use strict";

/* ============ تقویم شمسی (jalaali) ============ */
const Jalali=(()=>{const br=[-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178];
const div=(a,b)=>~~(a/b),mod=(a,b)=>a-~~(a/b)*b;
function cal(jy){let gy=jy+621,lJ=-14,jp=br[0],jm,jump=0,n,i;
for(i=1;i<br.length;i++){jm=br[i];jump=jm-jp;if(jy<jm)break;lJ+=div(jump,33)*8+div(mod(jump,33),4);jp=jm;}
n=jy-jp;lJ+=div(n,33)*8+div(mod(n,33)+3,4);
if(mod(jump,33)===4&&jump-n===4)lJ++;
const lG=div(gy,4)-div((div(gy,100)+1)*3,4)-150,march=20+lJ-lG;
if(jump-n<6)n=n-jump+div(jump+4,33)*33;
let leap=mod(mod(n+1,33)-1,4);if(leap===-1)leap=4;
return{leap,gy,march};}
const g2d=(gy,gm,gd)=>{let d=div((gy+div(gm-8,6)+100100)*1461,4)+div(153*mod(gm+9,12)+2,5)+gd-34840408;return d-div(div(gy+100100+div(gm-8,6),100)*3,4)+752;};
const d2g=j=>{let jj=4*j+139361631;jj=jj+div(div(4*j+183187720,146097)*3,4)*4-3908;const i=div(mod(jj,1461),4)*5+308;return{gd:div(mod(i,153),5)+1,gm:mod(div(i,153),12)+1,gy:div(jj,1461)-100100+div(8-(mod(div(i,153),12)+1),6)};};
function d2j(jdn){const gy=d2g(jdn).gy;let jy=gy-621;const r=cal(jy),j1=g2d(gy,3,r.march);let k=jdn-j1;
if(k>=0){if(k<=185)return{jy,jm:1+div(k,31),jd:mod(k,31)+1};k-=186;}
else{jy--;k+=179;if(r.leap===1)k++;}
return{jy,jm:7+div(k,30),jd:mod(k,30)+1};}
const toG=(jy,jm,jd)=>{const r=cal(jy);return d2g(g2d(r.gy,3,r.march)+(jm-1)*31-div(jm,7)*(jm-7)+jd-1);};
const mLen=(jy,jm)=>jm<=6?31:jm<=11?30:(cal(jy).leap===0?30:29);
const MN=["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const DN=["شنبه","یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه"];
const toFa=s=>String(s).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d]);
const fmt=j=>toFa(j.jy+"/"+String(j.jm).padStart(2,"0")+"/"+String(j.jd).padStart(2,"0"));
const today=()=>{const d=new Date();return toJ(d.getFullYear(),d.getMonth()+1,d.getDate());};
const toKey=j=>j.jy+"-"+String(j.jm).padStart(2,"0")+"-"+String(j.jd).padStart(2,"0");
const fromKey=k=>{const p=k.split("-");return{jy:+p[0],jm:+p[1],jd:+p[2]};};
const dow=j=>{const g=toG(j.jy,j.jm,j.jd);return(new Date(g.gy,g.gm-1,g.gd).getDay()+1)%7;};
const toJ=(gy,gm,gd)=>d2j(g2d(gy,gm,gd));
return{toJ,toG,mLen,today,fmt,toFa,toKey,fromKey,dow,MN,DN};})();

/* ============ لایه داده (نسخه ۱۹) ============ */
const Store=(()=>{const KEY="mct:data";
const DEF={v:21,members:[],classes:[{dow:3,start:"19:00",end:"21:00"}],extra:[],sessions:{},fees:{},homework:[],
groups:["عمومی"],
users:[{id:"u-admin",name:"مدیر",pin:"0000",role:"admin"}],
currentUserId:null,
period:{title:"دوره جاری",attendIds:[],feeIds:[],hwIds:[],note:""},
doorChecks:{},
activityLog:[],
assignments:{attend:{},fee:{}},
pinned:[],
sessionNotes:{},
undoStack:[],
settings:{theme:null,fs:"m",color:"blue",alarmTimes:[15,8,5,3],sound:false,className:"کلاس من",maxSessions:40,privacyMode:false,hidePrivateInReports:true,requireLogin:false,quickConfirm:true,feeDeadlineDays:1},timer:null};
let data;
function load(){try{data=JSON.parse(localStorage.getItem(KEY))||null;}catch(e){data=null;}
if(!data){data=JSON.parse(JSON.stringify(DEF));return;}
if(data.v<4){
(data.members||[]).forEach(m=>{if(m.phone&&!m.phones)m.phones=[m.phone];if(!m.phones)m.phones=[];});
data.extra=data.extra||[];data.v=4;}
if(data.v<5){
data.groups=data.groups||["عمومی"];
(data.members||[]).forEach(m=>{if(!m.group)m.group="عمومی";});
data.v=5;}
if(data.v<7){
(data.members||[]).forEach(m=>{
  if(m.privateNote==null)m.privateNote="";
  if(m.supporterId==null)m.supporterId=null;
  if(m.needs==null)m.needs=[];
  if(m.consentContact==null)m.consentContact=true;
  if(m.consentPhoto==null)m.consentPhoto=true;
  if(m.careFlag==null)m.careFlag=false;
});
data.v=7;}
if(data.v<8){
data.users=data.users&&data.users.length?data.users:[{id:"u-admin",name:"مدیر",pin:"0000",role:"admin"}];
if(!data.currentUserId)data.currentUserId=null;
data.v=8;}
if(data.v<9){
data.period=data.period||{title:"دوره جاری",attendIds:[],feeIds:[],hwIds:[],note:""};
data.doorChecks=data.doorChecks||{};
if(data.settings&&data.settings.feeDeadlineDays==null)data.settings.feeDeadlineDays=1;
data.v=9;}
if(data.v<11){
data.users=data.users&&data.users.length?data.users:[{id:"u-admin",name:"مدیر",pin:"0000",role:"admin"}];
data.period=data.period||{title:"دوره جاری",attendIds:[],feeIds:[],hwIds:[],note:""};
data.doorChecks=data.doorChecks||{};
(data.members||[]).forEach(m=>{
  if(!Array.isArray(m.phones))m.phones=m.phone?[m.phone]:[];
  if(!m.roles)m.roles=[];
  if(m.consentContact==null)m.consentContact=true;
  if(m.consentPhoto==null)m.consentPhoto=true;
});
data.v=11;}
if(data.v<12){
data.activityLog=data.activityLog||[];
if(data.settings&&data.settings.lastBackupAt===undefined)data.settings.lastBackupAt=null;
if(data.settings&&data.settings.autoTheme==null)data.settings.autoTheme=false;
data.v=12;}
if(data.v<13){
if(data.settings){if(data.settings.a11y==null)data.settings.a11y=false;if(data.settings.focusMode==null)data.settings.focusMode=false;}
(data.members||[]).forEach(m=>{if(m.streak==null)m.streak=0;});
data.v=13;}
if(data.v<14){
data.assignments=data.assignments||{attend:{},fee:{}};
if(!data.assignments.attend)data.assignments.attend={};
if(!data.assignments.fee)data.assignments.fee={};
if(data.settings&&data.settings.onlyMine==null)data.settings.onlyMine=false;
data.v=14;}
if(data.v<15){
data.pinned=data.pinned||[];
data.sessionNotes=data.sessionNotes||{};
if(data.settings){if(data.settings.oled==null)data.settings.oled=false;if(data.settings.smartSort==null)data.settings.smartSort=true;}
data.v=15;}
if(data.v<16){
data.undoStack=data.undoStack||[];
data.v=16;}
if(data.v<17){
data.v=17;}
if(data.v<18){
data.activityLog=data.activityLog||[];
data.assignments=data.assignments||{attend:{},fee:{}};
data.pinned=data.pinned||[];
data.sessionNotes=data.sessionNotes||{};
data.undoStack=data.undoStack||[];
data.v=18;}
if(data.v<19){data.v=19;}
if(data.v<20){data.v=20;}
if(data.v<21){data.v=21;}
data.settings=Object.assign({},DEF.settings,data.settings||{});
data.groups=data.groups||["عمومی"];}
const save=()=>{
try{
  const raw=JSON.stringify(data);
  localStorage.setItem(KEY,raw);
}catch(e){
  console.warn(e);
  try{toast("⚠️ فضای ذخیره پر است — پشتیبان بگیرید و جلسات قدیمی را پاک کنید");}catch(_){}
}
};
load();
return{get:()=>data,save,reset(){data=JSON.parse(JSON.stringify(DEF));save();},
importObj(o){if(!o||typeof o!=="object"||!Array.isArray(o.members))throw 0;
o.members.forEach(m=>{if(m.phone&&!m.phones)m.phones=[m.phone];if(!m.phones)m.phones=[];});
o.extra=o.extra||[];o.groups=o.groups||["عمومی"];(o.members||[]).forEach(m=>{if(!m.group)m.group="عمومی";});o.v=20;o.assignments=o.assignments||{attend:{},fee:{}};o.period=o.period||{title:"دوره جاری",attendIds:[],feeIds:[],hwIds:[],note:""};o.doorChecks=o.doorChecks||{};o.users=o.users&&o.users.length?o.users:[{id:"u-admin",name:"مدیر",pin:"0000",role:"admin"}];(o.members||[]).forEach(m=>{if(m.privateNote==null)m.privateNote="";if(!m.needs)m.needs=[];if(m.consentContact==null)m.consentContact=true;if(m.consentPhoto==null)m.consentPhoto=true;});data=o;save();},
uid:()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6)};})();


function storageInfo(){
  try{
    const raw=localStorage.getItem("mct:data")||"";
    const bytes=new Blob([raw]).size;
    const kb=Math.round(bytes/1024);
    const mb=(bytes/1048576).toFixed(2);
    // typical quota ~5MB
    const pct=Math.min(100,Math.round(bytes/5e6*100));
    return{bytes,kb,mb,pct,sessions:Object.keys(Store.get().sessions||{}).length,members:(Store.get().members||[]).length};
  }catch(e){return{bytes:0,kb:0,mb:"0",pct:0,sessions:0,members:0};}
}
function pruneSessions(keep){
  const d=Store.get();
  const keys=Object.keys(d.sessions||{}).sort().reverse();
  const max=keep|| (d.settings.maxSessions||40);
  let n=0;
  for(let i=max;i<keys.length;i++){delete d.sessions[keys[i]];n++;}
  // also prune fees for deleted session keys older than keep
  const feeKeys=Object.keys(d.fees||{}).sort().reverse();
  for(let i=max;i<feeKeys.length;i++){delete d.fees[feeKeys[i]];}
  Store.save();
  return n;
}

/* ============ ابزارها ============ */
const $=(s,el=document)=>el.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ICONS={
home:'<svg viewBox="0 0 24 24"><path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z"/></svg>',
check:'<svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>',
coin:'<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-1H9v-2h4v-1h-3a1 1 0 01-1-1V9a1 1 0 011-1h2V7h2v1h2v2h-4v1h3a1 1 0 011 1v3a1 1 0 01-1 1h-2z"/></svg>',
book:'<svg viewBox="0 0 24 24"><path d="M18 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2zm-1 9H7V9h10zm0-4H7V5h10z"/></svg>',
users:'<svg viewBox="0 0 24 24"><path d="M16 11a3 3 0 10-3-3 3 3 0 003 3zm-8 0a3 3 0 10-3-3 3 3 0 003 3zm0 2c-2.3 0-7 1.2-7 3.5V19h9v-2.5c0-.4.2-.8.5-1.2A13 13 0 008 13zm8 0c-.3 0-.6 0-1 .1 1.2.9 2 2 2 3.4V19h6v-2.5c0-2.3-4.7-3.5-7-3.5z"/></svg>',
gear:'<svg viewBox="0 0 24 24"><path d="M19.4 13a7.9 7.9 0 000-2l2.1-1.6a.5.5 0 00.1-.7l-2-3.4a.5.5 0 00-.6-.2l-2.5 1a7.7 7.7 0 00-1.7-1L14.4 2.4a.5.5 0 00-.5-.4h-4a.5.5 0 00-.5.4l-.4 2.7a7.7 7.7 0 00-1.7 1l-2.5-1a.5.5 0 00-.6.2l-2 3.4a.5.5 0 00.1.7L4.6 11a7.9 7.9 0 000 2l-2.1 1.6a.5.5 0 00-.1.7l2 3.4c.1.2.4.3.6.2l2.5-1a7.7 7.7 0 001.7 1l.4 2.7c0 .2.2.4.5.4h4c.2 0 .4-.2.5-.4l.4-2.7a7.7 7.7 0 001.7-1l2.5 1c.2.1.5 0 .6-.2l2-3.4a.5.5 0 00-.1-.7zM12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"/></svg>',
phone:'<svg viewBox="0 0 24 24" style="width:15px;height:15px;fill:currentColor"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.2 11 11 0 003.6.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11 11 0 00.6 3.6 1 1 0 01-.3 1z"/></svg>',
wa:'<svg viewBox="0 0 24 24" style="width:15px;height:15px;fill:currentColor"><path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1112 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.6.1a6.7 6.7 0 01-3.3-2.9c-.2-.4.2-.4.6-1.2.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7 1.9 2.9 4.6 4a15 15 0 001.5.6 3.7 3.7 0 001.7.1c.5-.1 1.5-.6 1.7-1.2s.2-1.1.2-1.2-.2-.2-.5-.3z"/></svg>'};

function toast(m){const t=$("#toast");t.className="toast";t.innerHTML=esc(m);t.classList.add("show");clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove("show"),2400);}
function celebrate(m){const t=$("#toast");t.className="toast celebrate";t.innerHTML=m;t.classList.add("show");
if(navigator.vibrate)navigator.vibrate([200,100,200,100,400]);
clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove("show"),3200);}
function toastUndo(m,fn){const t=$("#toast");t.className="toast";t.innerHTML=esc(m)+' <button id="undoBtn">↩️ بازگشت</button>';t.classList.add("show");
clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove("show"),6000);
document.getElementById("undoBtn").onclick=()=>{fn();t.classList.remove("show");};}
function copyTxt(t){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>toast("✅ کپی شد")).catch(()=>_cp(t));else _cp(t);}
function _cp(t){const a=document.createElement("textarea");a.value=t;document.body.appendChild(a);a.select();try{document.execCommand("copy");toast("✅ کپی شد");}catch(e){toast("کپی ناموفق");}a.remove();}
function shareTxt(t){if(navigator.share)navigator.share({text:t}).catch(()=>{});else copyTxt(t);}
function modal(h){const o=document.createElement("div");o.className="overlay";o.innerHTML='<div class="modal">'+h+"</div>";o.addEventListener("click",e=>{if(e.target===o)o.remove();});document.body.appendChild(o);return o;}
function confirm2(m,cb){const o=modal('<h3 style="font-weight:800">'+esc(m)+'</h3><div class="row" style="margin-top:14px"><button class="btn d" style="flex:1" id="cy">بله</button><button class="btn ghost" style="flex:1" id="cn">انصراف</button></div>');$("#cy",o).onclick=()=>{o.remove();cb();};$("#cn",o).onclick=()=>o.remove();}
const avatar=m=>{
  const showPhoto=m.photo&&m.consentPhoto!==false&&!(privacyOn()&&!m.consentPhoto);
  if(showPhoto&&m.photo&&!(privacyOn()))return'<img class="avatar" src="'+m.photo+'" alt="">';
  if(showPhoto&&m.photo&&privacyOn())return'<img class="avatar" src="'+m.photo+'" alt="" style="filter:blur(5px)">';
  return'<div class="avatar">'+esc((m.name||"؟").trim().charAt(0))+"</div>";
};
function waLink(p){if(!p)return"#";
let d=String(p).replace(/[۰-۹]/g,x=>"۰۱۲۳۴۵۶۷۸۹".indexOf(x)).replace(/\D/g,"");
if(d.startsWith("0"))d="98"+d.slice(1);else if(!d.startsWith("98"))d="98"+d;
return"https://wa.me/"+d;}

/* ============ ضبط و پخش صدا ============ */
let _au=null;
function playAud(src){try{if(!src)return;if(_au){_au.pause();}_au=new Audio(src);_au.play();}catch(e){toast("پخش ناموفق");}}
const AUD={};let _ai=0;
function audBtn(src,label){if(!src)return"";const k="a"+(++_ai);AUD[k]=src;
return'<button class="btn sm ghost" data-aud="'+k+'" aria-label="'+(label||"پخش صدا")+'">▶️</button>';}
function recordVoice(cb,cur){
const o=modal('<h3 style="font-weight:800">🎙 ضبط صدا</h3><div style="text-align:center;padding:8px"><div class="rec-time" id="recT">۰:۰۰</div>'+
'<div class="row" style="justify-content:center;margin-top:10px"><button class="btn d" id="recGo" style="min-width:130px">● شروع ضبط</button>'+
(cur?'<button class="btn ghost" id="recPlay">▶️ پخش قبلی</button><button class="btn ghost" id="recDel">🗑 حذف</button>':"")+"</div>"+
'<p class="stat-line" style="margin-top:8px">حداکثر ۶۰ ثانیه — برای صرفه‌جویی در حافظه دستگاه</p></div>'+
'<div class="row" style="margin-top:10px"><button class="btn p" style="flex:1" id="recOk">تأیید</button><button class="btn ghost" id="recCl">انصراف</button></div>');
let result=cur||null,mr=null,chunks=[],t0=null,iv=null;
const tm=$("#recT",o);
 $("#recCl",o).onclick=()=>{if(mr&&mr.state==="recording")mr.stop();if(iv)clearInterval(iv);o.remove();};
 $("#recOk",o).onclick=()=>{const wasRec=mr&&mr.state==="recording";
if(wasRec)mr.stop();if(iv)clearInterval(iv);
o.remove();
if(wasRec)setTimeout(()=>cb(result),450);else cb(result);};
if(cur){$("#recPlay",o).onclick=()=>playAud(cur);
 $("#recDel",o).onclick=()=>{result=null;$("#recPlay",o).remove();$("#recDel",o).remove();toast("حذف شد");};}
 $("#recGo",o).onclick=async()=>{
if(mr&&mr.state==="recording"){mr.stop();return;}
try{
const st=await navigator.mediaDevices.getUserMedia({audio:true});
mr=new MediaRecorder(st);chunks=[];
mr.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
mr.onstop=()=>{st.getTracks().forEach(t=>t.stop());
if(!chunks.length)return;
const b=new Blob(chunks,{type:mr.mimeType||"audio/webm"});
const r=new FileReader();r.onload=()=>{if(r.result&&r.result.length>350000){toast("⚠️ صدا خیلی طولانی است (حداکثر حدود ۳۰ ثانیه)");result=null;return;}result=r.result;
const go=$("#recGo",o);if(go){go.textContent="● شروع مجدد";go.className="btn d";}};
r.readAsDataURL(b);};
mr.start();t0=Date.now();
const go=$("#recGo",o);go.textContent="■ توقف";go.className="btn ghost";
iv=setInterval(()=>{const s=~~((Date.now()-t0)/1000);
tm.textContent=~~(s/60)+":"+String(s%60).padStart(2,"0");
if(s>=60&&mr&&mr.state==="recording"){mr.stop();toast("⏱ حداکثر زمان ضبط");}},250);
}catch(e){toast("⚠️ دسترسی به میکروفون داده نشد");}};
}

/* ============ تمام‌صفحه ============ */
function toggleFS(){try{
if(document.fullscreenElement||document.webkitFullscreenElement){(document.exitFullscreen||document.webkitExitFullscreen).call(document);}
else{const e=document.documentElement;
if(e.requestFullscreen)e.requestFullscreen().catch(()=>{});
else if(e.webkitRequestFullscreen)e.webkitRequestFullscreen();}}catch(err){}}
function fsOn(){try{const e=document.documentElement;
if(e.requestFullscreen)e.requestFullscreen().catch(()=>{});
else if(e.webkitRequestFullscreen)e.webkitRequestFullscreen();}catch(err){}}
function fsOff(){try{if(document.fullscreenElement||document.webkitFullscreenElement)(document.exitFullscreen||document.webkitExitFullscreen).call(document);}catch(err){}}

/* ============ انتخابگر تاریخ شمسی (سال + ماه) ============ */
function datePick(cur,cb){let j=cur||Jalali.today(),m=j.jm,y=j.jy,sel=cur;
const o=modal('<div id="dp"></div>');
const years=()=>{let h="";for(let yy=1310;yy<=1470;yy++)h+='<option value="'+yy+'"'+(yy===y?" selected":"")+">"+Jalali.toFa(yy)+"</option>";return h;};
const draw=()=>{const L=Jalali.mLen(y,m),first=Jalali.dow({jy:y,jm:m,jd:1}),t=Jalali.today();
let h='<div class="row" style="gap:8px;margin-bottom:12px"><select id="py" style="flex:1;font-weight:700" aria-label="انتخاب سال">'+years()+'</select><select id="pm2" style="flex:1.4;font-weight:700" aria-label="انتخاب ماه">'+Jalali.MN.map((n,i)=>'<option value="'+(i+1)+'"'+(i+1===m?" selected":"")+">"+n+"</option>").join("")+"</select></div>"+'<div class="cal-grid">';
for(const d of Jalali.DN)h+='<div class="hd">'+d.slice(0,3)+"</div>";
for(let i=0;i<first;i++)h+="<div></div>";
for(let d=1;d<=L;d++){const cl=(sel&&sel.jy===y&&sel.jm===m&&sel.jd===d)?"sel":((t.jy===y&&t.jm===m&&t.jd===d)?"today":"");h+='<button class="'+cl+'" data-d="'+d+'">'+Jalali.toFa(d)+"</button>";}
h+='</div><div class="row" style="margin-top:14px"><button class="btn p" style="flex:1" id="ok">تأیید</button><button class="btn ghost" id="cl">انصراف</button></div>';
 $("#dp",o).innerHTML=h;
 $("#py",o).onchange=e=>{y=+e.target.value;draw();};$("#pm2",o).onchange=e=>{m=+e.target.value;draw();};
 $("#cl",o).onclick=()=>o.remove();$("#ok",o).onclick=()=>{o.remove();if(sel)cb(sel);};
o.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{sel={jy:y,jm:m,jd:+b.dataset.d};draw();});};draw();}

/* ============ جلسات: هفتگی + خاص ============ */
function nextClass(){const d=Store.get();if(!d.classes.length&&!(d.extra||[]).length)return null;
const now=new Date();let best=null;
for(let i=0;i<8;i++){const dt=new Date(now);dt.setDate(now.getDate()+i);const dw=(dt.getDay()+1)%7;
for(const c of d.classes){if(c.dow!==dw)continue;
const[h,mi]=c.start.split(":").map(Number);
const t=new Date(dt);t.setHours(h,mi,0,0);
if(t>now-2*3600e3&&(!best||t<best.t))best={t,c,date:Jalali.toJ(dt.getFullYear(),dt.getMonth()+1,dt.getDate())};}}
for(const ex of d.extra||[]){const j=Jalali.fromKey(ex.key);const g=Jalali.toG(j.jy,j.jm,j.jd);
const[h,mi]=(ex.start||"19:00").split(":").map(Number);
const t=new Date(g.gy,g.gm-1,g.gd,h,mi,0,0);
if(t>now-2*3600e3&&(!best||t<best.t))best={t,c:{dow:Jalali.dow(j),start:ex.start,end:ex.end,date:j,extra:true},date:j};}
return best;}
function curKey(){const nc=nextClass();return nc?Jalali.toKey(nc.date):null;}
const STK=["present","delay","absent","problem"],STL=["حاضر","تأخیر","غایب","مشکل"];
const ST={lbl:{present:"حاضر",delay:"تأخیر",absent:"غایب",problem:"مشکل",none:"ثبت‌نشده"},cls:{present:"b-ok",delay:"b-warn",absent:"b-bad",problem:"b-prob",none:"b-m"}};
const ROLES=[["attend","پیگیری حضور"],["fee","شهریه"],["hw","تکالیف"],["support","حامی (عضو قدیمی)"]];
function sessionSel(){const d=Store.get();return d._lastSession||curKey();}
function curFeeKey(){return curKey()||(Store.get()._lastFee||Jalali.toKey(Jalali.today()));}
const needsCall=st=>st!=="present";
function absCount(id){const s=Store.get().sessions;let a=0;
for(const k in s){const st=(s[k][id]||{}).p2||(s[k][id]||{}).p1;if(st==="absent")a++;}return a;}

/* ============ وضعیت UI ============ */


