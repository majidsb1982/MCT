/**
 * MCT Pages — صفحات و UI بخش‌ها (v21)
 * بارگذاری بعد از core.js و قبل از app.js
 */
"use strict";

/**
 * MCT App — صفحات، روتینگ، قابلیت‌ها (v20)
 * App — بعد از core.js
 */
"use strict";
const Pages={};let route="home";
const UI={callOnly:false,doneTab:false,filter:"",repFull:false,feeTab:0};
function resetUI(){UI.callOnly=false;UI.doneTab=false;UI.filter="";UI.feeTab=0;window._hwA=null;}

function filterBar(placeholder){
return'<div class="row" style="margin-bottom:8px"><input name="list-filter" aria-label="'+placeholder+'" placeholder="🔍 '+placeholder+'" value="'+esc(UI.filter)+'" oninput="listFilter(this.value)" style="flex:1"></div>';}
function listFilter(v){UI.filter=v;
document.querySelectorAll(".mblk").forEach(b=>{
const n=b.querySelector("b");
b.style.display=(!v||(n&&n.textContent.includes(v)))?"":"none";});}
window.listFilter=listFilter;

/* ---- خانه ---- */


function navBadges(){
  try{
    const c=myPendingCount();
    return {attend:c.attend||0,fees:c.fee||0};
  }catch(e){return {attend:0,fees:0};}
}
function pageTitleFor(r){
  const map={home:"خانه",attend:"حضور",fees:"شهریه",members:"اعضا",homework:"تکالیف",settings:"تنظیمات",help:"راهنما",more:"بخش‌ها",reports:"گزارش‌ها",login:"ورود",entry:"نوبت ۲"};
  return map[r]||"MCT";
}
function buildNavHTML(){
  const badges=navBadges();
  return NAV.filter(n=>can(n[0])).map(n=>{
    let badge="";
    if(n[0]==="attend"&&badges.attend>0)badge='<i class="nav-badge">'+Jalali.toFa(badges.attend)+'</i>';
    if(n[0]==="fees"&&badges.fees>0)badge='<i class="nav-badge">'+Jalali.toFa(badges.fees)+'</i>';
    return '<button type="button" class="'+(route===n[0]?"on":"")+'" onclick="go(\''+n[0]+'\')" aria-label="'+n[1]+'" aria-current="'+(route===n[0]?"page":"false")+'">'+n[2]+badge+"<span>"+n[1]+"</span></button>";
  }).join("");
}

Pages.more=function(el){
  let h='<div class="card hero"><h3>☰ بخش‌ها</h3><p style="opacity:.9;font-size:.9em;margin:0">هر بخش پنجره و مسیر خودش را دارد — بدون جست‌وجوی طولانی.</p></div><div class="more-list">';
  const rows=[
    ["📋","تکالیف","اعلام و پیگیری تکلیف","go(\'homework\')"],
    ["📡","گزارش و ارتباطات","حامی، واتساپ، استوری، همگام","go(\'reports\')"],
    ["👥","اعضا","فهرست و ویرایش اعضا","go(\'members\')"],
    ["⚙️","تنظیمات","کلاس، کاربر، ظاهر، پشتیبان","go(\'settings\')"],
    ["📖","راهنما","آموزش کامل","go(\'help\')"],
    ["⌘","دستورات سریع","جستجوی همه کارها","openCommandPalette()"],
    ["💾","پشتیبان داده","دانلود JSON","backup()"],
    ["🔗","همگام فشرده","کد برای همکار","compactSyncExport()"],
    ["📦","تحویل شیفت","متن باقی‌مانده‌ها","handoffPackage()"]
  ];
  rows.forEach(r=>{
    h+='<button type="button" class="more-item" onclick="'+r[3]+'"><span class="mi-ico">'+r[0]+'</span><span class="mi-txt"><b>'+r[1]+'</b><span>'+r[2]+'</span></span><span class="mi-go">←</span></button>';
  });
  h+='</div>';
  el.innerHTML=h;
};
Pages.reports=function(el){
  let h='<div class="card hero"><h3>📡 گزارش و ارتباطات</h3><p style="opacity:.9;font-size:.9em;margin:0">همه کانال‌های گزارش — با حفظ حریم خصوصی اعضا.</p></div>';
  h+='<div class="sec-label">ارسال به حامی‌ها</div><div class="hub-grid">';
  [
    ["📤","نوبت ۱","گزارش تماس قبلی","reportRoundToHami(1)"],
    ["📤","نوبت ۲","گزارش پشت در","reportRoundToHami(2)"],
    ["💰","شهریه","گزارش پرداخت‌ها","reportFeesToHami()"],
    ["🤝","خلاصه انسانی","لحن حمایتگر","humanHamiSummary()"],
    ["📊","هفتگی","چند جلسه اخیر","weeklyDigest()"],
    ["📸","استوری","کارت تصویری","shareStoryCard()"]
  ].forEach(t=>{
    h+='<button type="button" class="hub-tile" onclick="'+t[3]+'"><span class="ht-ico">'+t[0]+'</span><span class="ht-title">'+t[1]+'</span><span class="ht-sub">'+t[2]+'</span></button>';
  });
  h+='</div><div class="sec-label">هماهنگی بین مسئولان</div><div class="hub-grid">';
  [
    ["📦","تحویل شیفت","باقی‌مانده‌های من","handoffPackage()"],
    ["🔗","همگام فشرده","کد جلسه و تقسیم","compactSyncExport()"],
    ["💬","یادآوری حضور","واتساپ اعضا","attendRemindWA()"],
    ["💚","یادآوری شهریه","واتساپ بدهکاران","remindUnpaidWA()"]
  ].forEach(t=>{
    h+='<button type="button" class="hub-tile" onclick="'+t[3]+'"><span class="ht-ico">'+t[0]+'</span><span class="ht-title">'+t[1]+'</span><span class="ht-sub">'+t[2]+'</span></button>';
  });
  h+='</div>';
  el.innerHTML=h;
};
function hubTilesHTML(){
  const d=Store.get();
  let c={attend:0,fee:0};
  try{c=myPendingCount();}catch(e){}
  return '<div class="sec-label">دسترسی سریع</div><div class="hub-grid">'+
    '<button type="button" class="hub-tile accent" onclick="go(\'attend\')"><span class="ht-ico">📞</span><span class="ht-title">حضور</span><span class="ht-sub">نوبت ۱ · باز: '+Jalali.toFa(c.attend)+'</span></button>'+
    '<button type="button" class="hub-tile" onclick="openEntry()"><span class="ht-ico">🚪</span><span class="ht-title">نوبت ۲</span><span class="ht-sub">پشت در + یادآور درمانگر</span></button>'+
    '<button type="button" class="hub-tile" onclick="go(\'fees\')"><span class="ht-ico">💰</span><span class="ht-title">شهریه</span><span class="ht-sub">واریز · باز: '+Jalali.toFa(c.fee)+'</span></button>'+
    '<button type="button" class="hub-tile" onclick="go(\'reports\')"><span class="ht-ico">📡</span><span class="ht-title">گزارش‌ها</span><span class="ht-sub">حامی و شبکه‌ها</span></button>'+
    '<button type="button" class="hub-tile" onclick="go(\'members\')"><span class="ht-ico">👥</span><span class="ht-title">اعضا</span><span class="ht-sub">'+Jalali.toFa(d.members.length)+' نفر</span></button>'+
    '<button type="button" class="hub-tile" onclick="go(\'more\')"><span class="ht-ico">☰</span><span class="ht-title">همه بخش‌ها</span><span class="ht-sub">تکالیف، تنظیمات، راهنما</span></button>'+
    '</div>';
}

Pages.home=function(el){const d=Store.get(),nc=nextClass(),key=curKey();const ins=computeInsights();
let cd="";
if(nc){const diff=nc.t-Date.now();
if(diff>0){const dd=~~(diff/864e5),hh=~~(diff%864e5/36e5),mm=~~(diff%36e5/6e5);
cd=(dd?Jalali.toFa(dd)+" روز و ":"")+Jalali.toFa(hh)+" ساعت و "+Jalali.toFa(mm)+" دقیقه";}
else cd="🎬 کلاس در جریان است";}
const s=key?(d.sessions[key]||{}):{},f=key?(d.fees[key]||{}):{};
const unC=d.members.filter(m=>!(s[m.id]||{}).p1).length;
const unE=d.members.filter(m=>!(s[m.id]||{}).p2).length;
const unP=d.members.filter(m=>!(f[m.id]&&f[m.id].paid)).length;
let bdToday="";
for(const mm of d.members){if(!mm.birth)continue;
for(let a=0;a<=1;a++){const dt=new Date();dt.setDate(dt.getDate()+a);
const tj=Jalali.toJ(dt.getFullYear(),dt.getMonth()+1,dt.getDate());
if(tj.jm===mm.birth.jm&&tj.jd===mm.birth.jd)bdToday+=esc(mm.name)+" ("+(a===0?"امروز 🎉":"فردا")+") ";}}
let tasks="";
if(unC)tasks+='<div class="task-row" onclick="go(\'attend\')"><div class="stat-ico">📞</div><div><div class="t-title">تماس‌های قبلی</div><div class="t-sub">'+Jalali.toFa(unC)+" نفر ثبت‌نشده</div></div><span class='t-go'>‹</span></div>";
if(unE)tasks+='<div class="task-row" onclick="openEntry()"><div class="stat-ico">✅</div><div><div class="t-title">ثبت ورود</div><div class="t-sub">'+Jalali.toFa(unE)+" نفر ثبت‌نشده</div></div><span class='t-go'>‹</span></div>";
if(unP)tasks+='<div class="task-row" onclick="go(\'fees\')"><div class="stat-ico">💰</div><div><div class="t-title">شهریه</div><div class="t-sub">'+Jalali.toFa(unP)+" نفر پرداخت‌نشده</div></div><span class='t-go'>‹</span></div>";
if(bdToday)tasks+='<div class="task-row" onclick="go(\'members\')"><div class="stat-ico">🎂</div><div><div class="t-title">تولد!</div><div class="t-sub">'+bdToday+"</div></div></div>";
if(!tasks)tasks='<div class="empty">🎉 همه‌چیز انجام شده — عالی!</div>';
const insightCard='<div class="card fade-up"><div class="row" style="justify-content:space-between;align-items:center;margin-bottom:6px"><h3 style="margin:0">✨ نمای کلی <span class="badge-ai">AI</span></h3><button class="btn sm ghost" onclick="showInsights()">جزئیات</button></div><div class="row" style="gap:12px;align-items:center">'+ringSVG(ins.avg,64)+'<div style="flex:1">'+sparkHTML(ins.spark)+'<p class="stat-line" style="margin:4px 0 0">میانگین حضور '+Jalali.toFa(ins.avg)+'٪'+(ins.trend?(' · '+(ins.trend>0?'+':'')+Jalali.toFa(ins.trend)+'٪'):'')+'</p></div></div></div>';

el.innerHTML=hubTilesHTML()+workflowStripHTML()+dataHealthHTML()+smartNextActionHTML()+kpiRowHTML()+heatmapHTML()+myTasksBannerHTML()+activityHTML()+backupReminderHTML()+periodSummaryHTML()+sessionCompareHTML()+roleDashboardHTML()+insightCard+
'<div class="card hero"><h3>🎯 کلاس بعدی</h3>'+(nc?
'<div style="position:relative;z-index:1"><div style="font-size:1.05em;font-weight:800">'+Jalali.DN[nc.c.dow]+" "+Jalali.fmt(nc.date)+(nc.c.extra?" (جلسه خاص)":"")+" — ساعت "+Jalali.toFa(nc.c.start)+'</div><div style="font-weight:900;font-size:clamp(1.2em,6vw,1.5em);margin:4px 0 8px">'+cd+"</div>"+
'<div class="row"><button class="btn" style="flex:1;background:rgba(255,255,255,.18);color:#fff;border:1px solid rgba(255,255,255,.28)" onclick="go(\'attend\')">📞 تماس‌ها</button><button class="btn" style="flex:1;background:#fff;color:#1d4ed8;border:none" onclick="openEntry()">✅ ثبت ورود</button></div></div>'
:'<div class="empty" style="color:rgba(255,255,255,.9)">کلاسی تنظیم نشده — از تنظیمات اضافه کنید</div>')+"</div>"+
'<div class="card"><h3>✅ اقدامات جلسه</h3>'+tasks+"</div>"+
'<div class="card"><div class="row" style="gap:10px"><div style="flex:1;text-align:center"><div style="font-weight:900;font-size:1.2em">'+Jalali.toFa(d.members.length)+'</div><div class="stat-line">عضو</div></div><div style="width:1px;height:30px;background:var(--ln)"></div><div style="flex:1;text-align:center"><div style="font-weight:900;font-size:1.2em;color:'+(unP?"var(--bad)":"var(--ok)")+'">'+Jalali.toFa(d.members.length-unP)+'</div><div class="stat-line">پرداخت‌شده</div></div><div style="width:1px;height:30px;background:var(--ln)"></div><div style="flex:1;text-align:center"><div style="font-weight:900;font-size:1.2em;color:var(--warn)">'+Jalali.toFa(d.members.length-unC)+'</div><div class="stat-line">تماس‌شده</div></div></div></div>';
window._cdTimer&&clearInterval(window._cdTimer);
if(nc&&nc.t>Date.now())window._cdTimer=setInterval(()=>{if(route==="home")Pages.home(el);},60000);};

/* ---- دکمه‌های تماس (چند شماره) ---- */
function callBtns(m){if(m.consentContact===false)return'<span style="margin-right:auto;font-size:.75em;color:var(--tx2)">بدون رضایت تماس</span>';
const ps=(m.phones||[]).filter(Boolean);
if(!ps.length)return'<span style="margin-right:auto"></span>';
let h="";
ps.slice(0,3).forEach((p,i)=>{const idx=i>0?Jalali.toFa(i+1):"";
h+='<a class="btn sm g" style="'+(i===0?"margin-right:auto;":"")+'min-width:40px" href="tel:'+esc(p)+'" aria-label="تماس'+(idx?" "+idx:"")+' با '+esc(m.name)+'">'+ICONS.phone+(idx?'<sub style="font-size:.7em">'+idx+"</sub>":"")+"</a>"+
'<a class="btn sm" style="min-width:40px;background:#25d366;color:#fff" href="'+waLink(p)+'" target="_blank" rel="noopener" aria-label="واتساپ'+(idx?" "+idx:"")+' '+esc(m.name)+'">'+ICONS.wa+(idx?'<sub style="font-size:.7em">'+idx+"</sub>":"")+"</a>";});
return h;}

/* ---- بلوک عضو ---- */
function memberRow(m,ph,cur,key){
const st=cur[ph];
const tF=ph==="p1"?"time":"time2",nF=ph==="p1"?"note":"note2",aF=ph==="p1"?"a1":"a2";
let h='<div class="mem'+(st==="present"?" done":"")+'">'+avatar(m)+"<b>"+esc(m.name)+"</b>"+callBtns(m);
if(ph==="p2"){h+='<span class="badge '+(ST.cls[cur.p1]||"b-m")+'">تماس: '+ST.lbl[cur.p1||"none"]+"</span>";}
else h+='<span class="badge '+(ST.cls[st]||"b-m")+'">'+ST.lbl[st||"none"]+"</span>";
h+="</div>";
h+='<div class="row" style="gap:4px;margin-bottom:8px">';
STK.forEach((k,i)=>{const hint=(ph==="p2"&&k==="present"&&st!==k)?" hint1":"";
h+='<button class="st-btn'+(st===k?" on"+(i+1):hint)+'" data-key="'+key+'" data-mid="'+m.id+'" data-ph="'+ph+'" data-s="'+k+'">'+STL[i]+"</button>";});
h+="</div>";
if(st==="delay")h+='<input type="time" name="delay-time-'+m.id+'" aria-label="ساعت تأخیر '+esc(m.name)+'" class="ex-input" data-key="'+key+'" data-mid="'+m.id+'" data-ph="'+ph+'" data-f="'+tF+'" value="'+(cur[tF]||"")+'" style="margin-bottom:6px">';
if(st&&st!=="present")h+='<input name="note-'+m.id+'" aria-label="یادداشت برای '+esc(m.name)+'" class="ex-input" placeholder="یادداشت (اختیاری)" data-key="'+key+'" data-mid="'+m.id+'" data-ph="'+ph+'" data-f="'+nF+'" value="'+esc(cur[nF]||"")+'" style="margin-bottom:6px">';
if(st&&st!=="present")h+='<div class="row" style="margin:-2px 0 8px;gap:6px"><button class="btn sm ghost" data-mic="1" data-key="'+key+'" data-mid="'+m.id+'" data-ph="'+ph+'" aria-label="ضبط یادداشت صوتی">🎙 صدا</button>'+audBtn(cur[aF],"پخش یادداشت صوتی")+"</div>";
return h;}
const block=(m,ph,cur,key)=>'<div class="mblk" data-mid="'+m.id+'">'+memberRow(m,ph,cur,key)+"</div>";
function doneRow(m,key,cur,ph){const st=cur[ph];const t=ph==="p1"?cur.time:cur.time2;
return'<div class="mblk" data-mid="'+m.id+'"><div class="mem done">'+avatar(m)+"<b>"+esc(m.name)+'</b><span class="badge '+(ST.cls[st]||"b-m")+'" style="margin-right:auto">'+ST.lbl[st||"none"]+(t?" — "+Jalali.toFa(t):"")+'</span><button class="btn sm ghost" data-restore="1" data-mid="'+m.id+'" data-key="'+key+'" data-ph="'+ph+'" aria-label="بازگرداندن '+esc(m.name)+'">↩️ بازگردانی</button></div></div>';}
function restoreAtt(key,mid,ph){const d=Store.get(),cur=(d.sessions[key]||{})[mid];if(!cur)return;
cur[ph]=null;
if(ph==="p1"){delete cur.time;delete cur.note;delete cur.a1;}else{delete cur.time2;delete cur.note2;delete cur.a2;}
Store.save();render();
toast("↩️ "+((d.members.find(m=>m.id===mid)||{}).name||"")+" به لیست برگشت");}

/* ---- نوبت ۱: تماس‌های قبلی ---- */
Pages.attend=function(el){const d=Store.get();
if(!d.members.length){el.innerHTML=emptyState("اول از تب «اعضا» اعضا را اضافه کن");return;}
const nc=nextClass(),key=sessionSel()||"",s=d.sessions[key]||{};
let done=d.members.filter(m=>(s[m.id]||{}).p1);
let need=d.members.filter(m=>!(s[m.id]||{}).p1);
done=smartSortMembers(applyListFilter(filterMembersForMe(done,"attend"),"attend"),"attend");
need=smartSortMembers(applyListFilter(filterMembersForMe(need,"attend"),"attend"),"attend");
const pct=d.members.length?Math.round(done.length/d.members.length*100):0;
const pastKeys=Object.keys(d.sessions).filter(k=>k!==key).sort().reverse();
let sel='<select name="session-select" aria-label="انتخاب جلسه" onchange="setSel(this.value)" style="flex:1;font-weight:700">';
sel+='<option value="'+key+'"'+(key===curKey()?"":" selected")+">"+(key===curKey()?"📅 جلسه بعد: ":"جلسه: ")+(key?Jalali.fmt(Jalali.fromKey(key)):"—")+"</option>";
for(const k of pastKeys)sel+='<option value="'+k+'"'+(k===key?" selected":"")+">جلسه گذشته: "+Jalali.fmt(Jalali.fromKey(k))+"</option>";
sel+="</select>";
let h='<div class="round-banner r1"><b>نوبت ۱ — تماس قبلی</b><br>چند ساعت یا یک روز قبل از کلاس با اعضا تماس بگیرید. بعد از تکمیل، گزارش را برای حامی‌ها بفرستید.</div>'+
'<div class="card"><h3>📞 نوبت ۱: تماس‌های قبلی</h3>'+onlyMineToggleHTML("attend")+filterChipsHTML()+batchBarHTML()+teamBoardHTML("attend")+'<div class="row" style="margin-bottom:8px">'+sel+"</div>";
h+='<div class="progress"><i style="width:'+pct+'%"></i></div><p class="stat-line">ثبت‌شده: <b style="color:var(--p)">'+Jalali.toFa(done.length)+"</b> از "+Jalali.toFa(d.members.length)+'</p>'+
'<div class="row" style="margin:10px 0 6px"><button class="chip'+(!UI.doneTab?" on":"")+'" style="flex:1" onclick="setDoneTab(false)">⏳ ثبت‌نشده ('+Jalali.toFa(need.length)+')</button><button class="chip'+(UI.doneTab?" on":"")+'" style="flex:1" onclick="setDoneTab(true)">✓ ثبت‌شده ('+Jalali.toFa(done.length)+')</button></div>'+
'<div class="row" style="margin-bottom:6px">'+filterBar("جستجوی نام در لیست")+
'<button class="btn p sm" onclick="openEntry()">🚪 نوبت ۲ پشت در</button><button class="btn g sm" onclick="reportRoundToHami(1)">📤 گزارش به حامی</button><button class="btn ghost sm" onclick="showReport(1)" aria-label="گزارش">📨</button><button class="btn ghost sm" onclick="printAttendReport()" aria-label="چاپ گزارش">🖨</button><button class="btn ghost sm" onclick="exportCSV(\'attend\',\''+key+'\')" aria-label="خروج اکسل">📊</button></div></div>';
const fl=UI.filter;
if(UI.doneTab){
const dl=fl?done.filter(m=>m.name.includes(fl)):done;
h+='<div class="card">'+(dl.length?dl.map(m=>doneRow(m,key,s[m.id]||{},"p1")).join(""):'<div class="empty">هنوز چیزی ثبت نشده</div>')+"</div>";
}else{
const nl=fl?need.filter(m=>m.name.includes(fl)):need;
h+='<div class="card">'+(nl.length?nl.map(m=>block(m,"p1",s[m.id]||{},key)).join(""):'<div class="empty">🎉 همه ثبت شده‌اند!</div>')+"</div>";}
el.innerHTML=h;wireMineToggle("attend");wireSessionNote();
try{
  document.querySelectorAll(".mem[data-mid]").forEach(el=>{
    el.addEventListener("click",e=>{
      if(e.target.closest("button,a,input,select,textarea,label"))return;
      if(e.shiftKey||window._batchMode){e.preventDefault();toggleBatchPick(el.getAttribute("data-mid"));}
    });
    el.addEventListener("contextmenu",e=>{e.preventDefault();toggleBatchPick(el.getAttribute("data-mid"));});
  });
}catch(e){}};
function setDoneTab(v){UI.doneTab=v;UI.filter="";render();}
window.setDoneTab=setDoneTab;
function setSel(k){const d=Store.get();d._lastSession=k;Store.save();resetUI();render();}
window.setSel=setSel;

/* ---- ثبت ورود ---- */
function openEntry(){const d=Store.get(),nc=nextClass();
if(!nc){toast("⚠️ اول کلاس را در تنظیمات ثبت کنید");return;}
try{if(d.settings.focusMode)document.body.classList.add("focus-on");}catch(e){}
const target=nc.t.getTime();
d._lastSession=Jalali.toKey(nc.date);
if(!d.timer||d.timer.target!==target)d.timer={target,fired:[]};
Store.save();route="entry";resetUI();UI.callOnly=true;
pushState();renderEntry();fsOn();}
function renderEntry(){const d=Store.get();
if(!d.timer||!d.timer.target){route="home";render();return;}
const target=d.timer.target,key=d._lastSession||sessionSel(),s=d.sessions[key]||{};
const done=d.members.filter(m=>(s[m.id]||{}).p2);
const need=d.members.filter(m=>!(s[m.id]||{}).p2);
const el=$("#app");
el.innerHTML='<div class="entry-head"><div class="row" style="justify-content:space-between"><button class="btn sm" onclick="exitEntry()">✕ خروج</button><button class="btn sm" onclick="showReport(2)">📨 گزارش</button></div>'+
'<div style="text-align:center;font-weight:800;margin-top:2px;opacity:.9;font-size:.92em">نوبت ۲ — پشت در کلاس</div>'+'<div style="text-align:center;margin:6px 0"><button class="chip" style="background:#fff;color:#1d4ed8" onclick="reportRoundToHami(2)">📤 گزارش این نوبت به حامی‌ها</button></div>'+
'<div class="timer-sm" id="cd">--:--</div>'+
'<div class="row" style="justify-content:center;gap:6px;flex-wrap:wrap"><button class="chip" style="background:#10b981;color:#fff;border:none" onclick="allPresent()">✅ همه حاضر شدند</button>'+
'<button class="chip" style="background:'+(UI.callOnly?"#fff":"rgba(255,255,255,.16)")+';color:'+(UI.callOnly?"#1d4ed8":"#fff")+'" onclick="toggleEntryFilter()">🎯 فقط ثبت‌نشده‌ها</button></div></div>'+
'<div class="entry-body">'+doorChecklistHTML()+
'<div class="row" style="margin-bottom:8px"><button class="chip'+(!UI.doneTab?" on":"")+'" style="flex:1" onclick="setDoneTab(false)">⏳ ثبت‌نشده ('+Jalali.toFa(need.length)+')</button><button class="chip'+(UI.doneTab?" on":"")+'" style="flex:1" onclick="setDoneTab(true)">✓ ثبت‌شده ('+Jalali.toFa(done.length)+')</button></div>'+
filterBar("جستجوی نام");
const fl=UI.filter;
if(UI.doneTab){
const dl=fl?done.filter(m=>m.name.includes(fl)):done;
el.innerHTML+='<div class="card">'+(dl.length?dl.map(m=>doneRow(m,key,s[m.id]||{},"p2")).join(""):'<div class="empty">هنوز چیزی ثبت نشده</div>')+"</div>";
}else{
const nl=fl?need.filter(m=>m.name.includes(fl)):need;
el.innerHTML+='<div class="card">'+(nl.length?nl.map(m=>block(m,"p2",s[m.id]||{},key)).join(""):'<div class="empty">🎉 همه حاضرند!</div>')+"</div>";}
el.innerHTML+="</div>";
tick();window._t&&clearInterval(window._t);window._t=setInterval(tick,1000);
window._tick=tick;
function tick(){const r=target-Date.now(),cd=$("#cd");if(!cd)return;
if(r<=0){cd.textContent="شروع شد! 🎬";window._t&&clearInterval(window._t);return;}
const mm=~~(r/6e4),ss=~~(r%6e4/1e3);
cd.textContent=Jalali.toFa(mm)+":"+Jalali.toFa(String(ss).padStart(2,"0"));
const d2=Store.get(),times=d2.settings.alarmTimes||[15,8,5,3];
for(const th of times)
if(r<=th*6e4&&!(d2.timer.fired||[]).includes(th)&&r>th*6e4-10*6e4){
d2.timer.fired=(d2.timer.fired||[]).concat(th);Store.save();showBigAlert(th);}}}
document.addEventListener("visibilitychange",()=>{if(route==="entry"&&!document.hidden&&window._tick)window._tick();});
function toggleEntryFilter(){UI.callOnly=!UI.callOnly;UI.filter="";renderEntry();}
function exitEntry(){window._t&&clearInterval(window._t);window._tick=null;resetUI();fsOff();
if(history.state&&history.state.route)history.back();
else{route="home";render();}}
function allPresent(){const d=Store.get(),key=d._lastSession||sessionSel();
d.sessions[key]=d.sessions[key]||{};let n=0;
for(const m of d.members){const cur=d.sessions[key][m.id]=d.sessions[key][m.id]||{};
if(!cur.p2){cur.p2="present";n++;}}
Store.save();renderEntry();celebrate("🎉 "+Jalali.toFa(n)+" نفر حاضر علامت خوردند!");}
window.allPresent=allPresent;

/* ---- شهریه (سه تب) ---- */
Pages.fees=function(el){if(!can("fees")){el.innerHTML='<div class="card"><div class="empty">⛔ به بخش شهریه دسترسی ندارید</div></div>';return;}const d=Store.get();const feeInfo=feeDeadlineInfo();
if(!d.members.length){el.innerHTML=emptyState("اول از تب «اعضا» اعضا را اضافه کن");return;}
const nc=nextClass(),key=curFeeKey(),f=d.fees[key]||{};
const np=d.members.filter(m=>!(f[m.id]&&f[m.id].paid)).length;
const pct=d.members.length?Math.round((d.members.length-np)/d.members.length*100):0;
let unpaid=d.members.filter(m=>!(f[m.id]&&f[m.id].paid));unpaid=smartSortMembers(filterMembersForMe(unpaid,"fee"),"fee");
const follow=unpaid.filter(m=>!(f[m.id]||{}).fc);
const contacted=d.members.filter(m=>(f[m.id]&&f[m.id].paid)||((f[m.id]||{}).fc));
let h=onlyMineToggleHTML("fee")+'<div class="'+(feeInfo.past&&feeInfo.overdue.length?'deadline-warn':'round-banner r1')+'"><b>مهلت واریز:</b> '+esc(feeInfo.text)+'<br><span style="font-size:.9em">اعضا باید تا یک روز قبل از کلاس واریز کنند و فیش را در واتساپ برای مسئولان شهریه بفرستند. اینجا وضعیت را ثبت و برای حامی‌ها گزارش کنید.</span></div>';
h+='<div class="row" style="margin:6px 0 8px;flex-wrap:wrap"><button class="btn sm g" type="button" id="btnFeeHami">📤 گزارش شهریه به حامی‌ها</button><button class="btn sm ghost" type="button" id="btnFeeXls">⬇️ خروجی اکسل</button></div>';
h+='<div class="card hero"><h3>💰 شهریه جلسه</h3><div style="position:relative;z-index:1">';
if(nc)h+='<div style="font-size:.85em;opacity:.9;margin-bottom:3px">'+Jalali.DN[nc.c.dow]+" "+Jalali.fmt(nc.date)+" — مهلت: قبل از شروع کلاس</div>";
h+='<div style="font-weight:800;font-size:1em">'+(np?"⏳ "+Jalali.toFa(np)+" نفر پرداخت‌نشده":"✅ همه پرداخت کرده‌اند")+"</div>"+
'<div class="progress" style="background:rgba(255,255,255,.2)"><i style="width:'+pct+'%;background:#fff"></i></div>'+
'<div class="row" style="margin-top:8px"><button class="btn" style="background:rgba(255,255,255,.18);color:#fff;border:1px solid rgba(255,255,255,.28)" onclick="feeReport()">📨 گزارش</button><button class="btn" style="background:rgba(255,255,255,.18);color:#fff;border:1px solid rgba(255,255,255,.28)" onclick="exportCSV(\'fees\',\''+key+'\')">📊 اکسل</button><button class="btn" style="background:rgba(255,255,255,.18);color:#fff;border:1px solid rgba(255,255,255,.28)" onclick="window.print()">🖨️ PDF</button></div></div></div>'+
'<div class="row" style="margin:4px 0 10px"><button class="chip'+(UI.feeTab===0?" on":"")+'" style="flex:1" onclick="setFeeTab(0)">💰 پرداخت‌ها</button><button class="chip'+(UI.feeTab===1?" on":"")+'" style="flex:1" onclick="setFeeTab(1)">📞 پیگیری ('+Jalali.toFa(follow.length)+')</button><button class="chip'+(UI.feeTab===2?" on":"")+'" style="flex:1" onclick="setFeeTab(2)">✓ انجام‌شده ('+Jalali.toFa(contacted.length)+')</button></div>'+
filterBar("جستجوی نام");
const fl=UI.filter;
const pick=arr=>fl?arr.filter(m=>m.name.includes(fl)):arr;
if(UI.feeTab===0){
const list=pick(d.members);
h+='<div class="card">';
for(const m of list){const st=f[m.id];
h+='<div class="mem payrow" data-key="'+key+'" data-mid="'+m.id+'" role="button" aria-label="تغییر وضعیت پرداخت '+esc(m.name)+'">'+avatar(m)+"<b>"+esc(m.name)+"</b>";
h+=st&&st.paid?'<span class="badge b-ok" style="margin-right:auto">پرداخت شد ✅</span>':'<span class="badge b-bad" style="margin-right:auto">پرداخت نشده</span>';
h+="</div>";
if(st&&st.paid)h+='<input name="fee-note-'+m.id+'" aria-label="یادداشت فیش '+esc(m.name)+'" class="fee-note" data-key="'+key+'" data-mid="'+m.id+'" placeholder="یادداشت فیش (مثلاً: عکس در واتساپ)" value="'+esc(st.note||"")+'" style="margin:-4px 0 8px;font-size:.9em">';}
h+="</div>";
}else if(UI.feeTab===1){
const list=pick(follow);
h+='<div class="card">'+(list.length?list.map(m=>feeCallRow(m,key,f[m.id]||{})).join(""):'<div class="empty">🎉 همه پیگیری شده‌اند!</div>')+"</div>";
}else{
const list=pick(contacted);
h+='<div class="card">'+(list.length?list.map(m=>feeDoneRow(m,key,f[m.id]||{})).join(""):'<div class="empty">هنوز کسی پیگیری نشده</div>')+"</div>";}
el.innerHTML=h;wireMineToggle("fee");
const bfh=document.getElementById("btnFeeHami");if(bfh)bfh.onclick=()=>reportFeesToHami();
const bfx=document.getElementById("btnFeeXls");if(bfx)bfx.onclick=()=>exportCSV("fees",key);
};
function feeCallRow(m,key,cur){
return'<div class="mblk" data-mid="'+m.id+'"><div class="mem">'+avatar(m)+"<b>"+esc(m.name)+"</b>"+
(m.phones&&m.phones.filter(Boolean).length?callBtns(m):'<span style="margin-right:auto"></span>')+
'<span class="badge b-bad">پرداخت نشده</span></div>'+
'<div class="row" style="gap:4px;margin-bottom:8px">'+
'<button class="st-btn'+(cur.fc==="promised"?" on2":"")+'" data-fst="1" data-key="'+key+'" data-mid="'+m.id+'" data-s="promised">🗣 قول داد</button>'+
'<button class="st-btn'+(cur.fc==="noanswer"?" on3":"")+'" data-fst="1" data-key="'+key+'" data-mid="'+m.id+'" data-s="noanswer">📵 جواب نداد</button>'+
'<button class="st-btn'+(cur.paid?" on1":" hint1")+'" data-fst="1" data-key="'+key+'" data-mid="'+m.id+'" data-s="paid">✅ پرداخت کرد</button>'+
"</div>"+
(cur.fc?'<input name="fee-cnote-'+m.id+'" aria-label="یادداشت پیگیری '+esc(m.name)+'" class="fee-note" data-key="'+key+'" data-mid="'+m.id+'" placeholder="یادداشت (اختیاری)" value="'+esc(cur.note||"")+'" style="margin-bottom:6px">':"")+
"</div>";}
function feeDoneRow(m,key,cur){
const lbl=cur.paid?"پرداخت شد ✅":(cur.fc==="promised"?"🗣 قول داده":cur.fc==="noanswer"?"📵 بی‌پاسخ":"💬 پیگیری شده");
return'<div class="mblk" data-mid="'+m.id+'"><div class="mem done">'+avatar(m)+"<b>"+esc(m.name)+'</b><span class="badge '+(cur.paid?"b-ok":"b-m")+'" style="margin-right:auto">'+lbl+'</span><button class="btn sm ghost" data-restorefee="1" data-key="'+key+'" data-mid="'+m.id+'" aria-label="بازگرداندن '+esc(m.name)+'">↩️ بازگردانی</button></div></div>';}
function setFeeTab(v){UI.feeTab=v;UI.filter="";render();}
function feeStatus(key,mid,st){const d=Store.get();d.fees[key]=d.fees[key]||{};
const cur=d.fees[key][mid]=d.fees[key][mid]||{};
if(cur.fc===st&&st!=="paid")cur.fc=null;
else{cur.fc=st;
if(st==="paid"&&!cur.paid){cur.paid=true;cur.date=Jalali.toKey(Jalali.today());}}
d._lastFee=key;Store.save();
const y=window.scrollY;render();window.scrollTo(0,y);
if(d.members.length&&d.members.every(m=>(d.fees[key][m.id]||{}).paid))celebrate("🎉 شهریه این جلسه کامل شد!");}
function restoreFee(key,mid){const d=Store.get(),cur=(d.fees[key]||{})[mid];if(!cur)return;
cur.fc=null;Store.save();render();}
window.setFeeTab=setFeeTab;

/* ---- تکالیف (دو تب + جستجو + صدا + ویرایش) ---- */
Pages.homework=function(el){/* sectioned */const d=Store.get();
let h='<div class="row" style="margin-bottom:10px"><button class="chip'+(!UI.doneTab?" on":"")+'" style="flex:1" onclick="setDoneTab(false)">➕ تکلیف جدید</button><button class="chip'+(UI.doneTab?" on":"")+'" style="flex:1" onclick="setDoneTab(true)">📚 آرشیو ('+Jalali.toFa(d.homework.length)+')</button></div>';
if(!UI.doneTab){
h+='<div class="card"><h3>📚 تکلیف جدید</h3><label>جلسه (تاریخ)</label>'+
'<input id="hwDate" name="hw-date" readonly placeholder="انتخاب تاریخ" value="'+(nextClass()?Jalali.fmt(nextClass().date):"")+'" onclick="pickHWDate()" style="cursor:pointer">'+
'<label>متن تکلیف</label><textarea id="hwText" name="hw-text" placeholder="تکلیف این هفته را بنویسید…"></textarea>'+
'<div class="row" style="margin-top:8px">"+speechBtn("hwText")+"<button class="btn sm ghost" id="hwMic" aria-label="ضبط یادداشت صوتی">🎙 ضبط صدا</button><span id="hwV"></span></div>'+
'<div class="row" style="margin-top:10px"><button class="btn p" style="flex:1" onclick="saveHW()">💾 ذخیره</button></div></div>';
}else{
h+=filterBar("جستجوی تکالیف");
const list=d.homework.filter(w=>!UI.filter||w.text.includes(UI.filter)).sort((a,b)=>b.key<a.key?-1:1);
h+=list.length?list.map(hwItem).join(""):'<div class="card"><div class="empty">موردی یافت نشد</div></div>';}
el.innerHTML=h;
const mic=document.getElementById("hwMic");
if(mic){const upd=()=>{document.getElementById("hwV").innerHTML=audBtn(window._hwA,"پخش");
const p=document.querySelector("#hwV [data-aud]");if(p)p.onclick=()=>playAud(window._hwA);};
mic.onclick=()=>recordVoice(res=>{window._hwA=res;upd();},window._hwA);upd();}};
function hwItem(hw){return'<div class="card"><div class="row" style="justify-content:space-between"><b style="color:var(--p)">'+Jalali.fmt(Jalali.fromKey(hw.key))+'</b><span class="noprint row" style="gap:6px">'+audBtn(hw.audio,"پخش تکلیف")+
'<button class="btn sm ghost" onclick="copyHW(\''+hw.id+'\')" aria-label="ارسال">📤</button>'+
'<button class="btn sm ghost" onclick="hwEdit(\''+hw.id+'\')" aria-label="ویرایش">✏️</button>'+
'<button class="btn sm ghost" onclick="delHW(\''+hw.id+'\')" aria-label="حذف">🗑</button></span></div>'+
'<p style="white-space:pre-wrap;margin:8px 0 0">'+esc(hw.text)+"</p></div>";}
function hwEdit(id){const d=Store.get();const hw=d.homework.find(x=>x.id===id);if(!hw)return;
const o=modal("<h3 style='font-weight:800'>✏️ ویرایش تکلیف</h3><label>متن</label><textarea id='heT' style='min-height:120px'>"+esc(hw.text)+"</textarea><div class='row' style='margin-top:12px'><button class='btn p' style='flex:1' id='heOk'>💾 ذخیره</button><button class='btn ghost' id='heCl'>انصراف</button></div>");
document.getElementById("heCl").onclick=()=>o.remove();
document.getElementById("heOk").onclick=()=>{const t=document.getElementById("heT").value.trim();
if(!t){toast("⚠️ متن خالی است");return;}
hw.text=t;Store.save();o.remove();render();toast("✅ ویرایش شد");};}
window.hwEdit=hwEdit;

/* ---- اعضا ---- */
Pages.members=function(el){
el.innerHTML='<div class="card hero"><h3>👥 اعضا</h3><p style="opacity:.9;font-size:.88em;margin:0">فهرست اعضا — نقش‌ها با آیکون مشخص‌اند (حضور، شهریه، تکلیف، حامی).</p></div>'+
'<div class="card"><div class="sec-label">جستجو و افزودن</div><div class="row"><input id="mSearch" name="member-search" aria-label="جستجوی نام عضو" placeholder="🔍 جستجوی نام…" oninput="renderMembers(this.value)" style="flex:1"><button class="btn p" onclick="memberForm()" aria-label="افزودن عضو جدید">＋</button></div>'+
'<div class="row" style="margin-top:8px;gap:6px;flex-wrap:wrap"><button class="btn ghost sm" onclick="exportMembersCSV()">📊 خروجی</button><button class="btn ghost sm" onclick="document.getElementById(\'mimp\').click()">⬆️ ورود</button><input type="file" id="mimp" class="sr" accept=".csv,text/csv" onchange="importMembersCSV(this)"></div>'+
'<div class="role-legend">'+
'<span class="role-ico" title="پیگیری حضور">📞</span><span class="leg">حضور</span>'+
'<span class="role-ico" title="شهریه">💰</span><span class="leg">شهریه</span>'+
'<span class="role-ico" title="تکالیف">📋</span><span class="leg">تکلیف</span>'+
'<span class="role-ico" title="حامی">🤝</span><span class="leg">حامی</span>'+
'</div></div><div class="sec-label">فهرست اعضا</div><div id="mList"></div>';
renderMembers("");};

/* ---- تنظیمات ---- */
Pages.settings=function(el){if(!can("settings")){el.innerHTML='<div class="card"><p>فقط مدیر به تنظیمات دسترسی دارد.</p><button class="btn ghost" onclick="logoutUser()">خروج</button></div>';return;}const d=Store.get(),DAYS=Jalali.DN,st=d.settings;
const cls=d.classes.map((c,i)=>'<div class="mem"><div class="stat-ico">🗓</div><b>'+DAYS[c.dow]+" — "+Jalali.toFa(c.start)+" تا "+Jalali.toFa(c.end)+'</b><button class="btn sm d" style="margin-right:auto" onclick="delClass('+i+')">حذف</button></div>').join("");
const extras=(d.extra||[]).map((ex,i)=>'<div class="mem"><div class="stat-ico">📅</div><b>'+Jalali.fmt(Jalali.fromKey(ex.key))+" — "+Jalali.toFa(ex.start)+" تا "+Jalali.toFa(ex.end)+'</b><button class="btn sm d" style="margin-right:auto" onclick="delExtra('+i+')">حذف</button></div>').join("");
const COLORS=[["blue","آبی","#2563eb"],["teal","فیروزه‌ای","#0d9488"],["purple","بنفش","#7c3aed"],["warm","گرم","#ea580c"]];
const sz=JSON.stringify(d).length/1024;
el.innerHTML=
'<div class="card"><h3>🗓 کلاس‌های هفتگی</h3>'+(cls||'<p class="stat-line">کلاسی ثبت نشده</p>')+
'<div class="row" style="margin-top:10px"><select id="cDow" style="flex:1.2" aria-label="روز هفته">'+DAYS.map((n,i)=>'<option value="'+i+'">'+n+"</option>").join("")+'</select><input type="time" id="cS" name="class-start" aria-label="ساعت شروع" value="19:00" style="flex:1"><input type="time" id="cE" name="class-end" aria-label="ساعت پایان" value="21:00" style="flex:1"><button class="btn p sm" onclick="addClass()" aria-label="افزودن کلاس">＋</button></div></div>'+
'<div class="card"><h3>📅 جلسات خاص (جبرانی / تعطیلات)</h3>'+(extras||'<p class="stat-line">جلسه خاصی ثبت نشده</p>')+
'<div class="row" style="margin-top:8px"><button class="btn p sm" style="flex:1" onclick="addExtra()">➕ جلسه با تاریخ مشخص</button></div></div>'+
'<div class="card"><h3>🎨 رنگ برنامه</h3><div class="row">'+COLORS.map(c=>'<button class="swatch'+(st.color===c[0]?" on":"")+'" style="background:linear-gradient(135deg,'+c[2]+',#fff3)" onclick="setColor(\''+c[0]+'\')" aria-label="رنگ '+c[1]+'"></button>').join("")+"</div>"+
'<p class="stat-line" style="margin:8px 0 0">'+({blue:"آبی — آرام و رسمی",teal:"فیروزه‌ای — تازه و شاداب",purple:"بنفش — مدرن",warm:"گرم — صمیمی"}[st.color]||"")+"</p></div>"+
'<div class="card"><h3>⏰ تایمر ثبت ورود</h3><label>لحظه‌های یادآوری (دقیقه، با کاما)</label>'+
'<input id="alarmIn" name="alarm-times" value="'+st.alarmTimes.join(",")+'" dir="ltr" inputmode="numeric" aria-label="لحظه‌های یادآوری">'+
'<div class="row" style="margin-top:8px"><button class="chip'+(st.sound?" on":"")+'" onclick="toggleSound()">'+(st.sound?"🔔 صدا روشن":"🔕 صدا خاموش")+'</button><span class="stat-line">ویبره همیشه فعال است</span></div></div>'+
'<div class="card"><h3>🎨 نمایش</h3><label>تم</label><div class="row"><button class="btn sm '+(theme()==="dark"?"p":"ghost")+'" onclick="setTheme(\'dark\')">🌙 تیره</button><button class="btn sm '+(theme()==="light"?"p":"ghost")+'" onclick="setTheme(\'light\')">☀️ روشن</button></div>'+
'<label>اندازه متن</label><div class="row">'+[["s","کوچک"],["m","متوسط"],["l","بزرگ"]].map(f=>'<button class="btn sm '+(st.fs===f[0]?"p":"ghost")+'" onclick="setFS(\''+f[0]+'\')">'+f[1]+"</button>").join("")+"</div></div>"+
'<div class="card"><h3>💾 پشتیبان و همگام‌سازی</h3><div class="focus-banner" style="margin:0 0 10px">⚠️ داده‌ها فقط در همین مرورگر است!</div>'+
'<div class="card"><h3>🏫 نام کلاس</h3><input id="classNameIn" value="'+esc(st.className||"کلاس من")+'" placeholder="مثلاً کلاس ریاضی" onchange="setClassName(this.value)" aria-label="نام کلاس"></div>'+
'<div class="card"><h3>👥 گروه‌ها</h3><div id="grpList" class="row" style="flex-wrap:wrap;gap:6px;margin-bottom:8px"></div><button class="btn sm ghost" onclick="addGroup()">＋ گروه جدید</button></div>'+
'<div class="card" id="storCard"><h3>💾 فضای ذخیره‌سازی</h3><div id="storBody"></div></div>'+
'<div class="card"><h3>🔔 هوشمندسازی</h3><div class="row" style="flex-wrap:wrap;gap:8px"><button class="btn sm ghost" onclick="enableNotifs()">🔔 اعلان کلاس</button><button class="btn sm ghost" onclick="togglePrivacyMode()">🔒 حریم خصوصی</button><button class="btn sm ghost" onclick="editTemplates()">📝 الگوهای پیام</button><button class="btn sm ghost" onclick="toggleAutoTheme()">🌓 تم خودکار</button><button class="btn sm ghost" onclick="toggleA11y()">♿ دسترسی‌پذیری</button><button class="btn sm ghost" onclick="toggleOled()">⬛ OLED</button><button class="btn sm ghost" onclick="openCommandPalette()">⌘ دستورات</button><button class="btn sm ghost" onclick="performUndo()">↩ بازگشت</button><button class="btn sm ghost" onclick="handoffPackage()">📦 تحویل شیفت</button><button class="btn sm ghost" onclick="compactSyncExport()">🔗 همگام فشرده</button><button class="btn sm ghost" onclick="communicationHub()">📡 ارتباطات</button><button class="btn sm ghost" onclick="copyPrevSession()">📋 کپی جلسه قبل</button><button class="btn sm ghost" onclick="transferMyTasks()">🔄 انتقال وظایف</button><button class="btn sm ghost" onclick="toggleFocusMode()">🎯 تمرکز پشت‌در</button><button class="btn sm ghost" onclick="shareStoryCard()">📸 کارت استوری</button><button class="btn sm ghost" onclick="exportICS()">📅 خروجی تقویم</button><button class="btn sm ghost" onclick="shareClassCode()">📲 اشتراک QR</button><button class="btn sm ghost" onclick="showInsights()">✨ بینش</button></div><p class="stat-line" style="margin-top:8px">اعلان ۱۵ دقیقه قبل از کلاس · تقویم ICS · اشتراک برنامه</p></div>'+
'<div class="card"><h3>👥 کاربران و دسترسی</h3><p class="role-hint">استفاده مشترک: برای هر نفر کاربر و رمز جدا بسازید.</p><div class="toggle-row"><span>ورود با رمز اجباری</span><button type="button" class="sw '+(st.requireLogin?"on":"")+'" id="swLogin"></button></div><div class="toggle-row"><span>تأیید قبل از کارهای مهم</span><button type="button" class="sw '+(st.quickConfirm!==false?"on":"")+'" id="swConfirm"></button></div><div id="userList" style="margin-top:8px"></div><button class="btn sm p" style="margin-top:8px" id="btnAddUser">＋ کاربر جدید</button> <button class="btn sm ghost" style="margin-top:8px" id="btnLogout">خروج</button></div>'+'<div class="row"><button class="btn p" style="flex:1" onclick="backup()">⬇️ پشتیبان</button><button class="btn ghost" style="flex:1" onclick="document.getElementById(\'rf\').click()">⬆️ بازیابی</button><input type="file" id="rf" class="sr" accept=".json" onchange="restore(this)"></div>'+
'<button class="btn g" style="width:100%;margin-top:8px" onclick="shareBackup()">📤 ارسال داده برای همگام‌سازی</button></div>'+
'<div class="card"><h3>ℹ️ درباره</h3><p class="stat-line">My-Class-Track — نسخه ۲۲ — ماژول ES و ناوبری هوشمند<br>کاملاً آفلاین — حجم داده: '+Jalali.toFa(~~sz)+' کیلوبایت از ~۵ مگابایت</p>'+
'<button class="btn d" style="width:100%" onclick="wipeAll()">🗑 پاک کردن همه داده‌ها</button></div>';
const gl=document.getElementById("grpList");
if(gl){gl.innerHTML=(d.groups||["عمومی"]).map(g=>{
  const x=document.createElement("span");x.className="chip";x.style.cursor="default";
  x.textContent=g;
  if(g!=="عمومی"){const b=document.createElement("b");b.style.cssText="cursor:pointer;margin-right:4px";b.textContent=" ✕";b.onclick=()=>delGroup(g);x.appendChild(b);}
  gl.appendChild(x);return "";
}).join("");}
const sb=document.getElementById("storBody");
if(sb){const si=storageInfo();
sb.innerHTML='<p class="stat-line">حجم داده: <b>'+Jalali.toFa(si.kb)+'</b> کیلوبایت ('+si.mb+' MB) — حدود <b>'+Jalali.toFa(si.pct)+'٪</b> ظرفیت</p><div class="progress"><i style="width:'+Math.min(100,si.pct)+'%"></i></div><p class="stat-line">جلسات: '+Jalali.toFa(si.sessions)+' | اعضا: '+Jalali.toFa(si.members)+'</p><button class="btn sm ghost" style="margin-top:8px" id="pruneBtn">🧹 پاکسازی جلسات قدیمی</button>';
const pb=document.getElementById("pruneBtn");if(pb)pb.onclick=()=>{const n=pruneSessions();toast(n?("🧹 "+Jalali.toFa(n)+" جلسه قدیمی پاک شد"):"✅ جلسه‌ای برای پاک کردن نبود");render();};}

};

function emptyState(m){return'<div class="card"><div class="empty">'+ICONS.users+"<p>"+esc(m)+"</p></div></div>";}

/* ---- اعضا: عملیات ---- */
function renderMembers(q){q=(q||"").trim();const d=Store.get();
const list=d.members.filter(m=>!q||m.name.includes(q));
 $("#mList").innerHTML=list.length?('<div class="card">'+list.map(m=>{
const rl=roleIconsHTML(m.roles)+(m.group&&m.group!=="عمومی"?'<span class="role-ico" title="گروه: '+esc(m.group)+'">🏷</span>':"");
const p0=(m.phones||[]).filter(Boolean)[0];
const extraN=(m.phones||[]).filter(Boolean).length-1;
return'<div class="mem mem-row">'+avatar(m)+'<div class="mem-main"><div class="mem-name"><b>'+esc(m.name)+'</b>'+needTags(m)+rl+'</div><div class="mem-meta">'+
(p0?'<a href="tel:'+esc(p0)+'" class="mem-phone" aria-label="تماس با '+esc(m.name)+'">📞 '+Jalali.toFa(p0)+'</a>'+(extraN>0?'<span class="mem-extra">+'+Jalali.toFa(extraN)+'</span>':''):'<span class="mem-muted">بدون شماره</span>')+
(supporterName(m)?'<span class="mem-muted"> · 🤝 '+esc(supporterName(m))+'</span>':'')+
(m.birth?'<span class="mem-muted"> · 🎂 '+Jalali.fmt(m.birth)+'</span>':'')+
'</div></div><div class="mem-actions">'+audBtn(m.voice,"پخش یادداشت "+m.name)+'<button class="btn sm ghost ico-btn" onclick="memberForm(\''+m.id+'\')" aria-label="ویرایش">✏️</button><button class="btn sm ghost ico-btn" onclick="delMember(\''+m.id+'\')" aria-label="حذف">🗑</button></div></div>';
}).join("")+"</div>"):('<div class="card"><div class="empty">'+ICONS.users+"<p>عضوی ثبت نشده</p><button class='btn p' onclick='memberForm()'>＋ افزودن اولین عضو</button></div></div>");}
function memberForm(id){const d=Store.get(),m=id?d.members.find(x=>x.id===id):null;
const o=modal("<h3 style='font-weight:800'>"+(m?"✏️ ویرایش عضو":"＋ عضو جدید")+"</h3>"+
'<div class="ph-pick">'+(m&&m.photo?'<img id="phPrev" src="'+m.photo+'" alt="عکس عضو">':'<div class="ph-empty" id="phPrev">👤</div>')+
'<div style="flex:1"><input type="file" id="phFile" class="sr" accept="image/*" onchange="pickPhoto(this)">'+
'<div class="row"><button class="btn sm ghost" onclick="document.getElementById(\'phFile\').click()">📷 عکس</button>'+
((m&&m.photo)?'<button class="btn sm ghost" onclick="delPhoto()">🗑 حذف عکس</button>':"")+"</div></div></div>"+
"<label>نام *</label><input id='fName' name='m-name' autocomplete='off' value='"+esc(m?m.name:"")+"'>"+
"<label>شماره‌های تماس (تا ۳ شماره)</label><div id='phList'></div>"+
"<button type='button' class='btn sm ghost' id='addPh' style='margin:4px 0'>＋ شماره دیگر</button>"+
"<label>تاریخ تولد (شمسی)</label><input id='fBirth' name='m-birth' readonly placeholder='انتخاب کنید' value='"+(m&&m.birth?Jalali.fmt(m.birth):"")+"' onclick='pickBirth()' style='cursor:pointer'>"+
"<label>نقش‌ها</label><div class='row'>"+ROLES.map(r=>'<label style="display:flex;align-items:center;gap:6px;margin:0"><input type="checkbox" class="fRole" name="m-role-'+r[0]+'" value="'+r[0]+'" style="width:auto;min-height:0" '+(m&&(m.roles||[]).includes(r[0])?"checked":"")+">"+r[1]+"</label>").join("")+"</div>"+
"<label>گروه</label><select id='fGroup' name='m-group' aria-label='گروه عضو'></select>"+
"<label>یادداشت عمومی <span class='stat-line'>(قابل نمایش در لیست)</span></label><input id='fNote' name='m-note' autocomplete='off' value='"+esc(m?m.note||"":"")+"'>"+
"<label>🔒 یادداشت محرمانه <span class='stat-line'>(هرگز در گزارش و خروجی نمی‌آید)</span></label><textarea id='fPrivNote' name='m-priv' rows='2' placeholder='فقط برای شما / درمانگر — مثل شرایط حساس، ترجیحات تماس…'>"+esc(m?m.privateNote||"":"")+"</textarea>"+
"<label>نیازها و مراقبت</label><div class='row' style='flex-wrap:wrap'>"+NEEDS.map(n=>'<label style="display:flex;align-items:center;gap:4px;margin:0 8px 0 0;font-size:.85em"><input type="checkbox" class="fNeed" value="'+n[0]+'" style="width:auto;min-height:0" '+((m&&(m.needs||[]).includes(n[0]))?"checked":"")+">"+n[1]+"</label>").join("")+"</div>"+
"<label style='display:flex;align-items:center;gap:8px;margin-top:8px'><input type='checkbox' id='fCare' style='width:auto;min-height:0' "+(m&&m.careFlag?"checked":"")+"> علامت «نیازمند حمایت» برای صف حمایتی</label>"+
"<label>حامی مرتبط</label><select id='fSupp' name='m-supp'><option value=''>— بدون حامی —</option>"+d.members.filter(x=>!m||x.id!==m.id).map(x=>'<option value="'+x.id+'" '+(m&&m.supporterId===x.id?"selected":"")+'>'+esc(x.name)+'</option>').join("")+"</select>"+
"<div class='priv-banner'>🛡️ رضایت‌ها: با خاموش کردن، در حالت حریم خصوصی محوتر رعایت می‌شود.</div>"+
"<label style='display:flex;align-items:center;gap:8px'><input type='checkbox' id='fConsC' style='width:auto;min-height:0' "+(m&&m.consentContact===false?"":"checked")+"> رضایت تماس پیگیری</label>"+
"<label style='display:flex;align-items:center;gap:8px'><input type='checkbox' id='fConsP' style='width:auto;min-height:0' "+(m&&m.consentPhoto===false?"":"checked")+"> رضایت نمایش عکس</label>"+
"<label>یادداشت صوتی</label><div class='row' style='margin-bottom:8px'><button type='button' class='btn sm ghost' id='vRec'>🎙 ضبط</button><span id='vWrap'></span></div>"+
"<div class='row' style='margin-top:10px'><button class='btn p' style='flex:1' id='fSave'>💾 ذخیره</button><button class='btn ghost' id='fCancel'>انصراف</button></div>");
let birth=m?m.birth:null;
o._photo=m?m.photo||null:null;
const gsel=$("#fGroup",o);if(gsel){gsel.innerHTML=(d.groups||["عمومی"]).map(g=>'<option value="'+esc(g)+'"'+((m&&m.group===g)?" selected":"")+">"+esc(g)+"</option>").join("");}

o._voice=m?m.voice||null:null;
if(!can("privateNotes")){const pr=$("#fPrivNote",o);if(pr){pr.style.display="none";const labels=[...o.querySelectorAll("label")];const lb=labels.find(l=>/محرمانه/.test(l.textContent||""));if(lb)lb.style.display="none";}}
if(!can("edit")){[...o.querySelectorAll("input,select,textarea,button")].forEach(el=>{if(el.id==="fCancel")return;if(el.id==="fSave"){el.style.display="none";return;}el.disabled=true;});}

let phones=m?((m.phones||[]).filter(Boolean).slice()):[];
if(!phones.length)phones=[""];
const drawPh=()=>{const c=$("#phList",o);c.innerHTML="";
phones.forEach((p,i)=>{const w=document.createElement("div");w.className="row";w.style.marginBottom="6px";
w.innerHTML="<input type='tel' dir='ltr' name='m-phone-"+i+"' aria-label='شماره "+(i+1)+"' value='"+esc(p)+"' style='flex:1'><button type='button' class='btn sm ghost' aria-label='حذف شماره'>✕</button>";
w.querySelector("input").oninput=e=>{phones[i]=e.target.value;};
w.querySelector("button").onclick=()=>{phones.splice(i,1);if(!phones.length)phones=[""];drawPh();};
c.appendChild(w);});
 $("#addPh",o).style.display=phones.length>=3?"none":"";
};
drawPh();
 $("#addPh",o).onclick=()=>{if(phones.length<3){phones.push("");drawPh();}};
window.pickBirth=()=>datePick(birth,j=>{birth=j;$("#fBirth",o).value=Jalali.fmt(j);});
window.pickPhoto=inp=>{const f=inp.files[0];if(!f)return;
const r=new FileReader();r.onload=()=>{const img=new Image();
img.onload=()=>{const c=document.createElement("canvas"),s=160;c.width=s;c.height=s;
const x=c.getContext("2d"),mn=Math.min(img.width,img.height);
x.drawImage(img,(img.width-mn)/2,(img.height-mn)/2,mn,mn,0,0,s,s);
o._photo=c.toDataURL("image/jpeg",.72);
 $("#phPrev",o).outerHTML='<img id="phPrev" src="'+o._photo+'" alt="عکس عضو">';};
img.src=r.result;};
r.readAsDataURL(f);inp.value="";};
window.delPhoto=()=>{o._photo=null;$("#phPrev",o).outerHTML='<div class="ph-empty" id="phPrev">👤</div>';};
const updV=()=>{const w=$("#vWrap",o);
w.innerHTML=o._voice?'<button type="button" class="btn sm ghost" id="vPlay">▶️ پخش</button><button type="button" class="btn sm ghost" id="vDel">🗑</button>':"";
const p=$("#vPlay",o);if(p)p.onclick=()=>playAud(o._voice);
const dl=$("#vDel",o);if(dl)dl.onclick=()=>{o._voice=null;updV();};};
updV();
 $("#vRec",o).onclick=()=>recordVoice(res=>{o._voice=res;updV();},o._voice);
 $("#fCancel",o).onclick=()=>o.remove();
 $("#fSave",o).onclick=()=>{
const name=$("#fName",o).value.trim();
const phs=phones.map(x=>x.trim()).filter(Boolean);
if(!name){toast("⚠️ نام را وارد کنید");return;}
if(!m&&d.members.some(x=>x.name===name)){toast("⚠️ عضوی با همین نام از قبل ثبت شده");return;}
for(const p of phs){const ph=p.replace(/[۰-۹]/g,x=>"۰۱۲۳۴۵۶۷۸۹".indexOf(x));
if(!/^0?9\d{9}$|^\+?\d{8,15}$/.test(ph)){toast("⚠️ شماره «"+p+"» معتبر نیست");return;}}
const roles=[...o.querySelectorAll(".fRole:checked")].map(c=>c.value);
const grp=($("#fGroup",o)&&$("#fGroup",o).value)||"عمومی";
const needs=[...o.querySelectorAll(".fNeed:checked")].map(c=>c.value);
const privEl=$("#fPrivNote",o);const careEl=$("#fCare",o);const suppEl=$("#fSupp",o);
const consC=$("#fConsC",o);const consP=$("#fConsP",o);
const obj={name,phones:phs,birth,roles,note:$("#fNote",o).value.trim(),
privateNote:privEl?privEl.value.trim():"",
needs,careFlag:careEl?careEl.checked:false,
supporterId:suppEl&&suppEl.value?suppEl.value:null,
consentContact:consC?consC.checked:true,
consentPhoto:consP?consP.checked:true,
photo:o._photo,voice:o._voice,group:grp};
if(m)Object.assign(m,obj);else d.members.push(Object.assign({id:Store.uid()},obj));
Store.save();o.remove();render();toast("✅ ذخیره شد");};}
function delMember(id){if(!requirePerm("delete","اجازه حذف ندارید"))return;const d=Store.get();const i=d.members.findIndex(m=>m.id===id);if(i<0)return;
const mm=d.members.splice(i,1)[0];Store.save();render();
toastUndo("🗑 "+mm.name+" حذف شد",()=>{d.members.splice(i,0,mm);Store.save();render();});}

/* ---- جلسات خاص ---- */
function addExtra(){const o=modal("<h3 style='font-weight:800'>➕ جلسه با تاریخ مشخص</h3><label>تاریخ جلسه</label><input id='exD' name='ex-date' readonly placeholder='انتخاب تاریخ' onclick='exPick()' style='cursor:pointer'><label>ساعت شروع</label><input type='time' id='exS' name='ex-start' value='19:00' aria-label='ساعت شروع'><label>ساعت پایان</label><input type='time' id='exE' name='ex-end' value='21:00' aria-label='ساعت پایان'><div class='row' style='margin-top:12px'><button class='btn p' style='flex:1' id='exOk'>💾 ذخیره</button><button class='btn ghost' id='exCl'>انصراف</button></div>");
let key=null;
window.exPick=()=>datePick(null,j=>{key=Jalali.toKey(j);document.getElementById("exD").value=Jalali.fmt(j);});
document.getElementById("exCl").onclick=()=>o.remove();
document.getElementById("exOk").onclick=()=>{if(!key){toast("⚠️ تاریخ را انتخاب کنید");return;}
const d=Store.get();d.extra=d.extra||[];
if(d.extra.some(x=>x.key===key)){toast("⚠️ برای این تاریخ جلسه ثبت شده");return;}
d.extra.push({key,start:document.getElementById("exS").value,end:document.getElementById("exE").value});
Store.save();o.remove();render();toast("✅ جلسه اضافه شد");};}
function delExtra(i){confirm2("این جلسه حذف شود؟",()=>{const d=Store.get();d.extra.splice(i,1);Store.save();render();});}
window.addExtra=addExtra;window.delExtra=delExtra;

/* ---- حضور ---- */
function toggleCallFilter(){UI.callOnly=!UI.callOnly;UI.filter="";render();}
function setAtt(key,mid,ph,st){const d=Store.get();
if(!key){toast("⚠️ اول کلاس را در تنظیمات ثبت کنید");return;}
d._lastSession=key;d.sessions[key]=d.sessions[key]||{};
const _prev=d.sessions[key][mid]?JSON.parse(JSON.stringify(d.sessions[key][mid])):null;
const cur=d.sessions[key][mid]=d.sessions[key][mid]||{};cur.time=Date.now();cur.by=(currentUser()||{}).name||"";
const tF=ph==="p1"?"time":"time2",nF=ph==="p1"?"note":"note2";
const was=cur[ph];
if(cur[ph]===st){cur[ph]=null;delete cur[tF];delete cur[nF];delete cur[ph==="p1"?"a1":"a2"];}
else cur[ph]=st;
pushUndo({type:"att",key:key,mid:mid,prev:_prev,label:"ثبت حضور"});Store.save();
const y=window.scrollY;
if(route==="entry")renderEntry();else render();
window.scrollTo(0,y);
if(cur[ph]&&was!==cur[ph]){
const mm=d.members.find(m=>m.id===mid);if(!mm)return;
toastUndo("📝 "+mm.name+": "+ST.lbl[cur[ph]],()=>{
const c=d.sessions[key][mid];c[ph]=null;
delete c[ph==="p1"?"time":"time2"];delete c[ph==="p1"?"note":"note2"];delete c[ph==="p1"?"a1":"a2"];
Store.save();route==="entry"?renderEntry():render();});
}
if(ph==="p2"&&d.members.length&&d.members.every(m=>!needsCall((d.sessions[key][m.id]||{}).p2)))
celebrate("🎉 همه اعضا حاضرند — کلاس کامل است!");}

/* ---- گزارش‌ها ---- */
function reportText(ph,full){const d=Store.get(),key=d._lastSession||sessionSel();if(!key)return"";
const s=d.sessions[key]||{},g={present:[],delay:[],absent:[],problem:[],none:[]};
for(const m of d.members){const st=ph===2?((s[m.id]||{}).p2||(s[m.id]||{}).p1):(s[m.id]||{}).p1;
(g[st||"none"]||g.none).push(m);}
const fm=m=>{const ex=s[m.id]||{};let t=m.name;
if(ex.time||ex.time2)t+=" (حدود "+Jalali.toFa(ex.time2||ex.time)+")";
else if(ex.note)t+=" ("+ex.note+")";return t;};
const nc=nextClass(),icon={present:"✅",delay:"⏰",absent:"📭",problem:"💬",none:"—"};
let out="📋 گزارش حضور — "+(nc?Jalali.DN[nc.c.dow]+" "+Jalali.fmt(nc.date):"")+" — "+(ph===1?"نوبت ۱ (تماس‌های قبلی)":"نوبت ۲ (ثبت ورود)")+"\n";
const keys=full?["present","delay","absent","problem","none"]:["delay","absent","problem"];
for(const k of keys)
if(g[k].length)out+=icon[k]+" "+ST.lbl[k]+": "+g[k].map(fm).join("، ")+"\n";
if(!full){const un=g.none.length;if(un)out+="❔ ثبت‌نشده: "+Jalali.toFa(un)+" نفر\n";}
return out;}
function feeReportText(){const d=Store.get(),key=curFeeKey(),f=d.fees[key]||{};
const paid=d.members.filter(m=>f[m.id]&&f[m.id].paid);
const un=d.members.filter(m=>!(f[m.id]&&f[m.id].paid));
const promised=un.filter(m=>(f[m.id]||{}).fc==="promised");
const noans=un.filter(m=>(f[m.id]||{}).fc==="noanswer");
const notYet=un.filter(m=>!(f[m.id]||{}).fc);
const nc=nextClass();
return"💰 گزارش شهریه — "+(nc?Jalali.DN[nc.c.dow]+" "+Jalali.fmt(nc.date):"")+"\n"+
"✅ پرداخت‌شده ("+Jalali.toFa(paid.length)+"): "+(paid.map(m=>m.name).join("، ")||"—")+"\n"+
"🗣 قول داده ("+Jalali.toFa(promised.length)+"): "+(promised.map(m=>m.name).join("، ")||"—")+"\n"+
"📵 بی‌پاسخ ("+Jalali.toFa(noans.length)+"): "+(noans.map(m=>m.name).join("، ")||"—")+"\n"+
"⏳ پیگیری‌نشده ("+Jalali.toFa(notYet.length)+"): "+(notYet.map(m=>m.name).join("، ")||"—");}
function showReport(ph){
modal("<h3 style='font-weight:800'>📨 گزارش نوبت "+ph+"</h3>"+
'<div class="row" style="margin-bottom:8px"><button class="chip'+(!UI.repFull?" on":"")+'" id="rShort">کوتاه</button><button class="chip'+(UI.repFull?" on":"")+'" id="rFull">کامل</button></div>'+
"<textarea style='min-height:190px' readonly id='rpt' name='report-text'></textarea>"+
"<div class='row' style='margin-top:12px'><button class='btn p' style='flex:1' id='rcp'>📋 کپی</button>"+(navigator.share?"<button class='btn g' style='flex:1' id='rsh'>📤 ارسال</button>":"")+"</div>");
const upd=()=>{document.getElementById("rpt").value=reportText(ph,UI.repFull);
document.getElementById("rShort").classList.toggle("on",!UI.repFull);
document.getElementById("rFull").classList.toggle("on",UI.repFull);};
upd();
document.getElementById("rShort").onclick=()=>{UI.repFull=false;upd();};
document.getElementById("rFull").onclick=()=>{UI.repFull=true;upd();};
document.getElementById("rcp").onclick=()=>copyTxt(document.getElementById("rpt").value);
const sh=document.getElementById("rsh");if(sh)sh.onclick=()=>shareTxt(document.getElementById("rpt").value);}
function feeReport(){const txt=feeReportText();
modal("<h3 style='font-weight:800'>📨 گزارش شهریه</h3><textarea style='min-height:180px' readonly id='rpt' name='report-text'>"+esc(txt)+"</textarea><div class='row' style='margin-top:12px'><button class='btn p' style='flex:1' id='rcp'>📋 کپی</button>"+(navigator.share?"<button class='btn g' style='flex:1' id='rsh'>📤 ارسال</button>":"")+"</div>");
document.getElementById("rcp").onclick=()=>copyTxt(txt);
const sh=document.getElementById("rsh");if(sh)sh.onclick=()=>shareTxt(txt);}

/* ---- شهریه: عملیات ---- */
function togglePay(key,mid){const d=Store.get();d.fees[key]=d.fees[key]||{};
if(d.fees[key][mid]&&d.fees[key][mid].paid)delete d.fees[key][mid];
else d.fees[key][mid]={paid:true,date:Jalali.toKey(Jalali.today()),note:""};
d._lastFee=key;Store.save();
const y=window.scrollY;render();window.scrollTo(0,y);
if(d.members.length&&d.members.every(m=>(d.fees[key][m.id]||{}).paid))celebrate("🎉 شهریه این جلسه کامل شد!");}
function feeNote(key,mid,v){const d=Store.get();d.fees[key][mid].note=v;d._lastFee=key;Store.save();}

/* ---- تکالیف: عملیات ---- */
function pickHWDate(){datePick(null,j=>{const e=document.getElementById("hwDate");e.value=Jalali.fmt(j);e._j=Jalali.toKey(j);});}
function saveHW(){const t=document.getElementById("hwText").value.trim();
if(!t){toast("⚠️ متن تکلیف را بنویسید");return;}
const de=document.getElementById("hwDate");
const key=de._j||Jalali.toKey(nextClass()?nextClass().date:Jalali.today());
const d=Store.get();d.homework.push({id:Store.uid(),key,text:t,audio:window._hwA||null});
window._hwA=null;Store.save();render();toast("✅ ذخیره شد");}
function delHW(id){const d=Store.get();const i=d.homework.findIndex(h=>h.id===id);if(i<0)return;
const hw=d.homework.splice(i,1)[0];Store.save();render();
toastUndo("🗑 حذف شد",()=>{d.homework.splice(i,0,hw);Store.save();render();});}
function copyHW(id){const hw=Store.get().homework.find(h=>h.id===id);
if(hw)shareTxt("📚 تکلیف جلسه "+Jalali.fmt(Jalali.fromKey(hw.key))+":\n\n"+hw.text);}

/* ---- تنظیمات: عملیات ---- */
function addClass(){const d=Store.get();
d.classes.push({dow:+$("#cDow").value,start:$("#cS").value,end:$("#cE").value});
Store.save();render();toast("✅ کلاس اضافه شد");}
function delClass(i){confirm2("این کلاس حذف شود؟",()=>{const d=Store.get();d.classes.splice(i,1);Store.save();render();});}
function setColor(c){const d=Store.get();d.settings.color=c;Store.save();applyColor();render();}
function toggleSound(){const d=Store.get();d.settings.sound=!d.settings.sound;Store.save();render();}
function theme(){return Store.get().settings.theme||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");}
function applyTheme(){const t=theme();document.body.classList.toggle("dark",t==="dark");
document.querySelector('meta[name="theme-color"]').setAttribute("content",t==="dark"?"#0b1220":"#f4f7fe");
const b=document.getElementById("themeBtn");if(b)b.textContent=t==="light"?"☀️":"🌙";}
function applyColor(){const c=Store.get().settings.color||"blue";
document.body.classList.remove("c-teal","c-purple","c-warm");
if(c!=="blue")document.body.classList.add("c-"+c);}
function toggleTheme(){setTheme(theme()==="light"?"dark":"light");}
function setTheme(t){Store.get().settings.theme=t;Store.save();applyTheme();render();}
function setFS(f){Store.get().settings.fs=f;Store.save();applyFS();render();}
function applyFS(){document.documentElement.style.setProperty("--fs",{s:"13px",m:"15px",l:"17px"}[Store.get().settings.fs||"m"]);}
function backup(){if(!requirePerm("backup","فقط مدیر می‌تواند پشتیبان بگیرد"))return;try{markBackupDone();}catch(e){}logActivity("تهیه پشتیبان");const t=Jalali.today();
const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(Store.get())],{type:"application/json"}));
a.download="My-Class-Track-Backup-"+t.jy+"-"+String(t.jm).padStart(2,"0")+"-"+String(t.jd).padStart(2,"0")+".json";a.click();toast("✅ پشتیبان گرفته شد");}
function shareBackup(){const j=JSON.stringify(Store.get());
const file=new File([j],"My-Class-Track-data.json",{type:"application/json"});
if(navigator.canShare&&navigator.canShare({files:[file]}))
navigator.share({files:[file],title:"پشتیبان My-Class-Track"}).catch(()=>{});
else{toast("📤 ارسال فایل پشتیبان");backup();}}
function restore(inp){const f=inp.files[0];if(!f)return;
const r=new FileReader();r.onload=()=>{try{Store.importObj(JSON.parse(r.result));applyTheme();applyColor();applyFS();route="home";resetUI();render();toast("✅ بازیابی شد");}catch(e){toast("⚠️ فایل نامعتبر است");}};
r.readAsText(f);inp.value="";}
function wipeAll(){if(!requirePerm("backup","فقط مدیر"))return;confirm2("همه داده‌ها پاک شود؟",()=>confirm2("واقعاً مطمئنی؟ اول پشتیبان بگیر!",()=>{Store.reset();applyTheme();applyColor();applyFS();route="home";resetUI();render();toast("همه داده‌ها پاک شد");}))}

/* ============ اکسل: خروج و ورود ============ */
function parseCSV(t){t=t.replace(/^\ufeff/,"");
const rows=[];let row=[],cur="",q=false;
for(let i=0;i<t.length;i++){const c=t[i];
if(q){if(c==='"'){if(t[i+1]==='"'){cur+='"';i++;}else q=false;}else cur+=c;}
else if(c==='"')q=true;
else if(c===","){row.push(cur);cur="";}
else if(c==="\n"||c==="\r"){if(c==="\r"&&t[i+1]==="\n")i++;
row.push(cur);cur="";
if(row.some(x=>x!==""))rows.push(row);row=[];}
else cur+=c;}
if(cur!==""||row.length){row.push(cur);if(row.some(x=>x!==""))rows.push(row);}
return rows;}
function dlCSV(rows,name){const q=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
const csv="\ufeff"+rows.map(r=>r.map(q).join(",")).join("\r\n");
const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
a.download=name;a.click();toast("✅ فایل اکسل (CSV) دانلود شد");}
function exportCSV(kind,key){const d=Store.get();let rows;
if(kind==="fees"){const f=d.fees[key]||{};
rows=[["نام","تلفن‌ها","وضعیت","تاریخ پرداخت","پیگیری","یادداشت"]];
for(const m of d.members){const st=f[m.id]||{};
rows.push([m.name,(m.phones||[]).join(" / "),st.paid?"پرداخت شد":"پرداخت نشده",st.paid?st.date:"",st.fc==="promised"?"قول داده":st.fc==="noanswer"?"بی‌پاسخ":"",st.note||""]);}}
else if(kind==="attend"){const s=d.sessions[key]||{};
rows=[["نام","تلفن‌ها","تماس قبلی","ساعت","یادداشت","ثبت ورود","ساعت","یادداشت"]];
for(const m of d.members){const c=s[m.id]||{};
rows.push([m.name,(m.phones||[]).join(" / "),c.p1?ST.lbl[c.p1]:"ثبت‌نشده",c.time||"",c.note||"",c.p2?ST.lbl[c.p2]:"ثبت‌نشده",c.time2||"",c.note2||""]);}}
else rows=[["نام","تلفن‌ها","تولد","نقش‌ها","گروه","یادداشت عمومی","نیازها"],...d.members.map(m=>[m.name,(m.phones||[]).join(" / "),m.birth?Jalali.fmt(m.birth):"",(m.roles||[]).join("|"),m.group||"عمومی",m.note||"",(m.needs||[]).join("|")])];
dlCSV(rows,kind+"-"+key+".csv");}
function exportMembersCSV(){exportCSV("members","members");}
function importMembersCSV(inp){const f=inp.files[0];if(!f)return;
const r=new FileReader();r.onload=()=>{try{
const rows=parseCSV(r.result);if(rows.length<2){toast("⚠️ فایل خالی است");return;}
const head=rows[0].map(x=>x.trim());
const hasHead=head.includes("نام");
const ci=n=>head.indexOf(n);
const iName=hasHead?ci("نام"):0;
const iPhone=hasHead?(ci("تلفن")>=0?ci("تلفن"):ci("شماره")):1;
const iBirth=hasHead?ci("تولد"):2;
const iRole=hasHead?ci("نقش‌ها"):3;
const iNote=hasHead?ci("یادداشت"):4;
const d=Store.get();let n=0,skip=0;
for(let i=hasHead?1:0;i<rows.length;i++){
const c=rows[i];const name=(c[iName]||"").trim();
if(!name)continue;
if(d.members.some(x=>x.name===name)){skip++;continue;}
let birth=null;
const bs=(c[iBirth]||"").trim();
const bm=bs.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
if(bm)birth={jy:+bm[1],jm:+bm[2],jd:+bm[3]};
const phones=(c[iPhone]||"").split(/[\/؛;|]/).map(x=>x.trim()).filter(Boolean);
d.members.push({id:Store.uid(),name,phones,birth,
roles:(c[iRole]||"").split("|").map(x=>x.trim()).filter(Boolean),
note:(c[iNote]||"").trim()});
n++;}
Store.save();render();
toast("✅ "+Jalali.toFa(n)+" عضو اضافه شد"+(skip?" — "+Jalali.toFa(skip)+" تکراری رد شد":""));
}catch(e){toast("⚠️ خواندن فایل ناموفق بود");}};
r.readAsText(f);inp.value="";}
window.exportMembersCSV=exportMembersCSV;window.importMembersCSV=importMembersCSV;

/* ---- آلارم ---- */
function showBigAlert(min){const d=Store.get();
if(d.settings.sound)beep(2);
if(navigator.vibrate)navigator.vibrate([400,150,400]);
const a=document.createElement("div");a.className="alert-screen";
a.innerHTML='<div style="font-size:4em">⏰</div><div class="msg">به دکتر بگویید:<br>'+Jalali.toFa(min)+" دقیقه مانده</div><button class='btn' style='padding:14px 40px;font-size:1.05em' id='okA'>باشه</button>";
document.body.appendChild(a);document.getElementById("okA").onclick=()=>a.remove();}
let AC=null;
function beep(n){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();
for(let i=0;i<n;i++){const o=AC.createOscillator(),g=AC.createGain();
o.connect(g);g.connect(AC.destination);o.frequency.value=880;o.type="sine";
const t=AC.currentTime+i*.45;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.5,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+.35);
o.start(t);o.stop(t+.4);}}catch(e){}}

/* ============ ناوبری ============ */
function pushState(){if(route!=="home")history.pushState({route:route},"");}
function goBack(){if(history.state&&history.state.route)history.back();else go("home");}
window.addEventListener("popstate",e=>{
route=(e.state&&e.state.route)||"home";
if(Store.get().settings.requireLogin&&!currentUser())route="login";
resetUI();window._t&&clearInterval(window._t);window._tick=null;render();});
