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
  d.pinnedMembers=d.pinnedMembers||[];
  d.pinned=d.pinned||[];
  const i=d.pinnedMembers.indexOf(id);
  if(i>=0){
    d.pinnedMembers.splice(i,1);
    const j=d.pinned.indexOf(id);if(j>=0)d.pinned.splice(j,1);
    toast("سنجاق برداشته شد");
  }else{
    d.pinnedMembers.push(id);
    if(d.pinned.indexOf(id)<0)d.pinned.push(id);
    toast("سنجاق شد 📌");
  }
  Store.save();
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
if(t.id==="alarmIn"){const d=Store.get();
const times=t.value.split(",").map(x=>parseInt(x.trim(),10)).filter(x=>x>0&&x<=59).sort((a,b)=>b-a);
if(times.length){d.settings.alarmTimes=times;Store.save();toast("✅ لحظه‌های یادآوری: "+times.join("، "));}
else{toast("⚠️ عدد معتبر وارد کنید (مثلاً 15,8,5,3)");t.value=d.settings.alarmTimes.join(",");}return;}
if(t.classList.contains("ex-input")){const d=Store.get();
d.sessions[t.dataset.key]=d.sessions[t.dataset.key]||{};
const cur=d.sessions[t.dataset.key][t.dataset.mid]=d.sessions[t.dataset.key][t.dataset.mid]||{};
cur[t.dataset.f]=t.value;d._lastSession=t.dataset.key;Store.save();return;}
if(t.classList.contains("fee-note")){feeNote(t.dataset.key,t.dataset.mid,t.value);return;}});



/* ============ v6: بینش هوشمند ============ */

/* ============ v7: حریم خصوصی و نگاه انسانی ============ */
const NEEDS=[["follow","پیگیری ویژه"],["sensitive","حساس"],["encourage","نیاز به تشویق"],["family","هماهنگی خانواده"]];
/* ============ v8: کاربران و سطح دسترسی ============ */
