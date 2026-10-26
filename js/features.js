/**
 * MCT Features — گزارش، روز کلاس، ابزارها
 */
"use strict";

function isPinned(id){
  const d=Store.get();
  const pins=d.pinnedMembers||d.pinned||[];
  return pins.indexOf(id)>=0;
}
function togglePinMember(id){
  const d=Store.get();
  const hadMembers=Object.prototype.hasOwnProperty.call(d,"pinnedMembers");
  const hadPinned=Object.prototype.hasOwnProperty.call(d,"pinned");
  const oldMembers=Array.isArray(d.pinnedMembers)?d.pinnedMembers.slice():d.pinnedMembers;
  const oldPinned=Array.isArray(d.pinned)?d.pinned.slice():d.pinned;
  d.pinnedMembers=Array.isArray(d.pinnedMembers)?d.pinnedMembers:[];
  d.pinned=Array.isArray(d.pinned)?d.pinned:[];
  const i=d.pinnedMembers.indexOf(id),adding=i<0;
  if(!adding){
    d.pinnedMembers.splice(i,1);
    const j=d.pinned.indexOf(id);if(j>=0)d.pinned.splice(j,1);
  }else{
    d.pinnedMembers.push(id);
    if(d.pinned.indexOf(id)<0)d.pinned.push(id);
  }
  let saved=false;try{saved=Store.save()!==false;}catch(e){saved=false;}
  if(!saved){
    if(hadMembers)d.pinnedMembers=oldMembers;else delete d.pinnedMembers;
    if(hadPinned)d.pinned=oldPinned;else delete d.pinned;
    toast("⚠️ تغییر سنجاق ذخیره نشد؛ وضعیت قبلی حفظ شد");
  }else toast(adding?"سنجاق شد 📌":"سنجاق برداشته شد");
  if(typeof route!=="undefined"&&route==="members"&&typeof renderMembers==="function")
    renderMembers((document.getElementById("mSearch")||{}).value||"");
}




/**
 * MCT App — روتینگ، دسترسی، قابلیت‌ها، bootstrap (v21)
 * بارگذاری آخر
 */
"use strict";


/* ============ نوار وضعیت + سنجاق اعضا ============ */
function statusStripHTML(){
  try{
    const d=Store.get();const key=typeof sessionSel==="function"?(sessionSel()||(typeof curKey==="function"?curKey():null)):(typeof curKey==="function"?curKey():null);
    if(!key||!d.members.length)return"";
    const s=d.sessions[key]||{},f=d.fees[key]||{};
    const tot=d.members.length;
    const p1=d.members.filter(m=>(s[m.id]||{}).p1).length;
    const p2=d.members.filter(m=>(s[m.id]||{}).p2).length;
    const paid=d.members.filter(m=>f[m.id]&&f[m.id].paid).length;
    return '<div class="status-strip noprint" role="status">'+
      '<span title="تعداد ثبت‌های تماس نوبت ۱">📞 تماس '+Jalali.toFa(p1)+'/'+Jalali.toFa(tot)+'</span>'+
      '<span title="تعداد ثبت‌های ورود نوبت ۲">🚪 ورود '+Jalali.toFa(p2)+'/'+Jalali.toFa(tot)+'</span>'+
      '<span title="تعداد پرداخت‌شده شهریه">💰 پرداخت '+Jalali.toFa(paid)+'/'+Jalali.toFa(tot)+'</span>'+
      '</div>';
  }catch(e){return"";}
}



function go(r){
if(r==="login"){route=r;resetUI();window._t&&clearInterval(window._t);window._tick=null;render();return;}
if(Store.get().settings.requireLogin&&!currentUser()){route="login";render();return;}
const map={home:"home",attend:"attend",fees:"fees",members:"members",homework:"homework",settings:"settings",help:"help",more:"more",reports:"reports"};
if(map[r]&&!can(map[r])){toast("⛔ به این بخش دسترسی ندارید");return;}
route=r;resetUI();window._t&&clearInterval(window._t);window._tick=null;
render();pushState();}
window.go=go;

/* ============ رویدادهای مشترک ============ */
document.getElementById("app").addEventListener("click",e=>{
const ap=e.target.closest("[data-aud]");if(ap){playAud(AUD[ap.dataset.aud]);return;}
const mi=e.target.closest("[data-mic]");
if(mi){const key=mi.dataset.key,mid=mi.dataset.mid,ph=mi.dataset.ph;
const d=Store.get();const cur=(d.sessions[key]||{})[mid]||{};
const af=ph==="p1"?"a1":"a2";
recordVoice(res=>{
const hadBucket=Object.prototype.hasOwnProperty.call(d.sessions,key),hadRecord=hadBucket&&Object.prototype.hasOwnProperty.call(d.sessions[key],mid),previous=hadRecord?JSON.parse(JSON.stringify(d.sessions[key][mid])):null;
d.sessions[key]=d.sessions[key]||{};
const c=d.sessions[key][mid]=d.sessions[key][mid]||{};
if(res)c[af]=res;else delete c[af];
let saved=false;try{saved=Store.save()!==false;}catch(err){saved=false;}
if(!saved){if(hadRecord)d.sessions[key][mid]=previous;else delete d.sessions[key][mid];if(!hadBucket)delete d.sessions[key];toast("⚠️ یادداشت صوتی ذخیره نشد؛ اطلاعات قبلی حفظ شد");render();return;}
render();
},cur[af]);return;}
const rf=e.target.closest("[data-restorefee]");
if(rf){restoreFee(rf.dataset.key,rf.dataset.mid);return;}
const fs=e.target.closest("[data-fst]");
if(fs){feeStatus(fs.dataset.key,fs.dataset.mid,fs.dataset.s);return;}
const rb=e.target.closest("[data-restore]");
if(rb){restoreAtt(rb.dataset.key,rb.dataset.mid,rb.dataset.ph);return;}
const b=e.target.closest(".st-btn");if(b){setAtt(b.dataset.key,b.dataset.mid,b.dataset.ph,b.dataset.s);return;}
const pr=e.target.closest(".payrow");
if(pr&&!e.target.closest("input")&&!e.target.closest("button")&&!e.target.closest("a")){togglePay(pr.dataset.key,pr.dataset.mid);return;}});
document.getElementById("app").addEventListener("change",e=>{
const t=e.target;
if(t.id==="alarmIn"){const d=Store.get(),raw=t.value.split(",").map(x=>x.trim());
const valid=raw.length>0&&raw.every(x=>/^\d+$/.test(x)&&Number(x)>=1&&Number(x)<=59);
if(!valid){toast("⚠️ همه مقادیر باید عدد صحیح بین ۱ تا ۵۹ باشند؛ نمونه: 15,8,5,3");t.value=(d.settings.alarmTimes||[]).join(",");return;}
const times=[...new Set(raw.map(Number))].sort((a,b)=>b-a),had=Object.prototype.hasOwnProperty.call(d.settings,"alarmTimes"),previous=had?JSON.parse(JSON.stringify(d.settings.alarmTimes)):undefined;
d.settings.alarmTimes=times;
let saved=false;try{saved=Store.save()!==false;}catch(err){saved=false;}
if(!saved){if(had)d.settings.alarmTimes=previous;else delete d.settings.alarmTimes;t.value=(d.settings.alarmTimes||[]).join(",");toast("⚠️ یادآوری‌ها ذخیره نشد؛ تنظیم قبلی حفظ شد");}
else{t.value=times.join(",");toast("لحظه‌های یادآوری ذخیره شد: "+times.join("، "));}return;}
if(t.classList.contains("ex-input")){const d=Store.get(),key=t.dataset.key,mid=t.dataset.mid,field=t.dataset.f;
const hadBucket=Object.prototype.hasOwnProperty.call(d.sessions,key),hadRecord=hadBucket&&Object.prototype.hasOwnProperty.call(d.sessions[key],mid),previous=hadRecord?JSON.parse(JSON.stringify(d.sessions[key][mid])):null,previousLast=d._lastSession;
d.sessions[key]=d.sessions[key]||{};
const cur=d.sessions[key][mid]=d.sessions[key][mid]||{};
cur[field]=t.value;d._lastSession=key;
let saved=false;try{saved=Store.save()!==false;}catch(err){saved=false;}
if(!saved){if(hadRecord)d.sessions[key][mid]=previous;else delete d.sessions[key][mid];if(!hadBucket)delete d.sessions[key];if(previousLast===undefined)delete d._lastSession;else d._lastSession=previousLast;t.value=hadRecord&&previous[field]!=null?previous[field]:"";toast("⚠️ تغییر ذخیره نشد؛ مقدار قبلی حفظ شد");}
return;}
if(t.classList.contains("fee-note")){feeNote(t.dataset.key,t.dataset.mid,t.value);return;}});



/* ============ v6: بینش هوشمند ============ */

/* ============ v7: حریم خصوصی و نگاه انسانی ============ */
const NEEDS=[["follow","پیگیری ویژه"],["sensitive","حساس"],["encourage","نیاز به تشویق"],["family","هماهنگی خانواده"]];
/* ============ v8: کاربران و سطح دسترسی ============ */
