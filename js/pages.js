/**
 * MCT Pages — صفحات UI
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
  const groups=[
    {title:"کارهای تکمیلی",items:[
      ["📡","گزارش‌ها و ارتباطات","گزارش حامی، پیام‌ها و استوری","go('reports')"],
      ["⚙️","تنظیمات برنامه","کلاس، کاربران و ظاهر","go('settings')"],
      ["📖","راهنما","راهنمای استفاده و توضیحات","go('help')"]
    ]},
    {title:"ابزارهای مدیریتی",items:[
      ["💾","پشتیبان‌گیری","ذخیره فایل نسخه پشتیبان","backup()"],
      ["🔄","انتقال اطلاعات بین دستگاه‌ها","ساخت یا ورود کد همگام‌سازی","compactSyncExport()"],
      ["📦","تحویل شیفت","خلاصه کارهای باقی‌مانده برای همکار","handoffPackage()"],
      ["⌘","جستجوی دستورات","پیدا کردن سریع عملیات برنامه","openCommandPalette()"]
    ]}
  ];
  let h='<div class="more-hero-compact"><button type="button" class="members-help-btn" onclick="go(\'help\')" aria-label="راهنما" title="راهنما">?</button></div>';
  groups.forEach((group,index)=>{
    h+='<section class="more-group" aria-labelledby="more-group-'+index+'">'+(index===0?'<h3 id="more-group-'+index+'" class="more-group-title">'+group.title+'</h3>':'')+'<div class="more-list">';
    group.items.forEach(item=>{
      h+='<button type="button" class="more-item" onclick="'+item[3]+'"><span class="mi-ico">'+item[0]+'</span><span class="mi-txt"><b>'+item[1]+'</b><span>'+item[2]+'</span></span><span class="mi-go" aria-hidden="true">←</span></button>';
    });
    h+='</div></section>';
  });
  h+='<p class="more-footnote">برای خانه، حضور، شهریه و اعضا از نوار پایین استفاده کن.</p>';
  el.innerHTML=h;
};
Pages.reports=function(el){
  let h='<div class="card hero"><h3>📡 گزارش و ارتباطات</h3><p style="opacity:.9;font-size:.9em;margin:0">گزارش‌های جلسه و هماهنگی مسئولان.</p></div>';
  h+='<div class="sec-label">ارسال گزارش</div><div class="hub-grid">';
  [
    ["📤","نوبت ۱","گزارش تماس قبلی","reportRoundToHami(1)"],
    ["📤","نوبت ۲","گزارش پشت در","reportRoundToHami(2)"],
    ["💰","شهریه","گزارش پرداخت‌ها","reportFeesToHami()"],
    ["🤝","خلاصه انسانی","گزارش حمایتگر","humanHamiSummary()"],
    ["📊","هفتگی","چند جلسه اخیر","weeklyDigest()"],
    ["📸","استوری","کارت تصویری","shareStoryCard()"]
  ].forEach(t=>{
    h+='<button type="button" class="hub-tile" onclick="'+t[3]+'"><span class="ht-ico">'+t[0]+'</span><span class="ht-title">'+t[1]+'</span><span class="ht-sub">'+t[2]+'</span></button>';
  });
  h+='</div><div class="sec-label">یادآوری و ابزارهای مدیریتی</div><div class="hub-grid">';
  [
    ["💬","یادآوری حضور","واتساپ اعضا","attendRemindWA()"],
    ["💚","یادآوری شهریه","واتساپ بدهکاران","remindUnpaidWA()"],
    ["📈","آمار و روند","خلاصه حضور و مقایسه جلسات","openReportPanel('stats')"],
    ["🧭","گردش کار","کارهای باز و مسئولان دوره","openReportPanel('workflow')"],
    ["🤝","پیگیری حمایتی","اولویت پیگیری و هماهنگی حامی‌ها","openReportPanel('support')"],
    ["🛡","سلامت اطلاعات","کیفیت داده، پشتیبان و فعالیت‌ها","openReportPanel('system')"]
  ].forEach(t=>{
    h+='<button type="button" class="hub-tile" onclick="'+t[3]+'"><span class="ht-ico">'+t[0]+'</span><span class="ht-title">'+t[1]+'</span><span class="ht-sub">'+t[2]+'</span></button>';
  });
  h+='</div>';
  el.innerHTML=h;
};
function openReportPanel(kind){
  const titles={stats:"آمار و روند جلسات",workflow:"گردش کار و مسئولان",support:"پیگیری حمایتی",system:"سلامت اطلاعات و نگهداری"};
  let body="";
  if(kind==="stats"){
    body=kpiRowHTML()+sessionCompareHTML()+heatmapHTML()+
      '<div class="card"><h3>تحلیل جزئی‌تر</h3><p class="stat-line">میانگین حضور و روند تغییرات جلسات.</p><button type="button" class="btn p" onclick="showInsights()">📊 باز کردن تحلیل کامل</button></div>';
  }else if(kind==="workflow"){
    body=workflowStripHTML()+myTasksBannerHTML()+periodSummaryHTML();
  }else if(kind==="support"){
    body=roleDashboardHTML();
  }else if(kind==="system"){
    body=dataHealthHTML()+activityHTML();
  }else{
    return;
  }
  const o=modal('<h3 style="font-weight:800">'+titles[kind]+'</h3>'+body+
    '<div class="row" style="margin-top:12px"><button type="button" class="btn ghost" id="reportPanelClose" style="flex:1">بستن</button></div>');
  const close=$("#reportPanelClose",o);
  if(close)close.onclick=()=>o.remove();
  o.addEventListener("click",event=>{
    const button=event.target.closest("button");
    if(button&&button.id!=="reportPanelClose")o.remove();
  });
}
window.openReportPanel=openReportPanel;

window.openCalendarSettings=function(){go("settings");let tries=0;const open=()=>{const b=document.querySelector("#settingsHome .settings-shortcut[data-settings-group=\'calendar\']");if(b){b.click();return;}if(++tries<12)setTimeout(open,80);};requestAnimationFrame(open);};

Pages.home=function(el){
  const d=Store.get(),nc=nextClass();
  const today=new Date(),j=Jalali.toJ(today.getFullYear(),today.getMonth()+1,today.getDate());
  const dayName=["یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه","شنبه"][today.getDay()];
  const dateLabel=dayName+"، "+Jalali.toFa(j.jd)+" "+(Jalali.MN[j.jm-1]||"")+" "+Jalali.toFa(j.jy);
  let cd="";
  if(nc){
    const diff=nc.t-Date.now();
    if(diff>0){const totalMinutes=Math.max(1,Math.ceil(diff/6e4)),dd=Math.floor(totalMinutes/1440),hh=Math.floor(totalMinutes%1440/60),mm=totalMinutes%60;
      if(dd>0)cd=Jalali.toFa(dd)+" روز"+(hh?" و "+Jalali.toFa(hh)+" ساعت":"")+" دیگر";
      else if(hh>0)cd=Jalali.toFa(hh)+" ساعت"+(mm?" و "+Jalali.toFa(mm)+" دقیقه":"")+" دیگر";
      else cd=Jalali.toFa(mm)+" دقیقه دیگر";
    }else cd="کلاس در جریان است";
  }
  const pending=navBadges();
  const unAttendance=pending.attend;
  const unP=pending.fees;
  const hw=typeof pendingHomeworkCount==="function"?pendingHomeworkCount():0;
  const count=(n)=>n>99?"۹۹+":Jalali.toFa(n);
let h='<section class="home-android-head"><button type="button" class="home-menu" onclick="go(\'more\')" aria-label="بخش‌های بیشتر" title="بخش‌های بیشتر">☰</button><div class="home-head-title"><div class="home-date">'+esc(dateLabel)+'</div><div class="home-greeting">پیگیری جلسات</div></div></section>';
  h+='<section class="home-next-card"><div class="home-next-label"><span class="home-live-dot"></span> تا جلسه بعدی</div>';
  if(nc){
    h+='<div class="home-next-name">'+esc(d.settings.className||"جلسه گروه درمانی")+'</div><div class="home-next-date">'+esc(Jalali.DN[nc.c.dow])+' '+esc(Jalali.fmt(nc.date))+' · '+Jalali.toFa(nc.c.start)+(nc.c.end?" تا "+Jalali.toFa(nc.c.end):"")+'</div><div class="home-countdown">'+esc(cd)+'</div>';
  }else h+='<div class="home-next-name">برنامه جلسه تعریف نشده</div><button type="button" class="btn sm" onclick="go(\'settings\')">تنظیم برنامه</button>';
  h+='</section><div class="home-shortcut-grid">';
  const tiles=[
    ["attend","حضور","calendar",unAttendance,"ثبت وضعیت اعضا"],
    ["fees","شهریه","wallet",unP,"پیگیری پرداخت‌ها"],
    ["homework","تکالیف","tasks",hw,"تکالیف جلسه"],
    ["calendar","تقویم و مناسبت‌ها","schedule",0,"تقویم جلالی، مناسبت‌ها و کلاس‌ها"]
  ];
  tiles.forEach(t=>{
    const badge=(t[0]==="attend"||t[0]==="fees")&&t[3]>0?'<span class="home-shortcut-badge" aria-label="'+Jalali.toFa(t[3])+' مورد نیازمند پیگیری">'+count(t[3])+'</span>':"";
    const icons={calendar:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 15l2 2 5-5"/></svg>',wallet:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M16 14h2"/></svg>',tasks:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M8 11l2 2 5-4M8 17h8"/></svg>',schedule:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M12 13v4l3 1"/></svg>'};
    h+='<button type="button" class="home-shortcut home-shortcut-'+t[2]+'" onclick="'+(t[0]==="calendar"?"openCalendarSettings()":"go(\'"+t[0]+"\')")+'">'+badge+'<span class="home-shortcut-icon" aria-hidden="true">'+icons[t[2]]+'</span><b>'+t[1]+'</b><small>'+t[4]+'</small></button>';
  });
  h+='</div><button type="button" class="home-reminder" aria-label="یادآور درمانگر" onclick="showDoorChecklist()"><span class="home-reminder-icon">◷</span><span><b>یادآوری‌ها</b><small>یادآوری ورود، تماس و پیگیری جلسه</small></span><span class="home-reminder-arrow">‹</span></button>';
  el.innerHTML=h;
  window._cdTimer&&clearInterval(window._cdTimer);
  if(nc&&nc.t>Date.now())window._cdTimer=setInterval(()=>{if(route==="home")Pages.home(el);},60000);
};
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
function doneRow(m,key,cur,ph){const st=cur[ph];const t=ph==="p1"?cur.time:cur.time2;const nF=ph==="p1"?"note":"note2",tF=ph==="p1"?"time":"time2";let extra="";
if(st==="delay")extra+='<input type="time" name="delay-time-'+m.id+'" aria-label="ساعت تأخیر '+esc(m.name)+'" class="ex-input" data-key="'+key+'" data-mid="'+m.id+'" data-ph="'+ph+'" data-f="'+tF+'" value="'+(cur[tF]||"")+'" style="margin:6px 0">';
if(st&&st!=="present")extra+='<input name="note-'+m.id+'" aria-label="یادداشت برای '+esc(m.name)+'" class="ex-input" placeholder="دلیل یا یادداشت (اختیاری)" data-key="'+key+'" data-mid="'+m.id+'" data-ph="'+ph+'" data-f="'+nF+'" value="'+esc(cur[nF]||"")+'" style="margin:6px 0">';
return'<div class="mblk" data-mid="'+m.id+'"><div class="mem done">'+avatar(m)+"<b>"+esc(m.name)+'</b><span class="badge '+(ST.cls[st]||"b-m")+'" style="margin-right:auto">'+ST.lbl[st||"none"]+(t?" — "+Jalali.toFa(t):"")+'</span><button class="btn sm ghost" data-restore="1" data-mid="'+m.id+'" data-key="'+key+'" data-ph="'+ph+'" aria-label="بازگرداندن '+esc(m.name)+'">↩️ بازگردانی</button></div>'+extra+'</div>';}
function restoreAtt(key,mid,ph){const d=Store.get(),cur=(d.sessions[key]||{})[mid];if(!cur)return;
const previous=JSON.parse(JSON.stringify(cur));
cur[ph]=null;
if(ph==="p1"){delete cur.time;delete cur.note;delete cur.a1;}else{delete cur.time2;delete cur.note2;delete cur.a2;}
if(Store.save()===false){d.sessions[key][mid]=previous;render();toast("⚠️ ذخیره نشد؛ وضعیت قبلی حفظ شد");return;}
render();
toast("↩️ "+((d.members.find(m=>m.id===mid)||{}).name||"")+" به لیست برگشت");}

/* ---- نوبت ۱: تماس‌های قبلی ---- */
Pages.attend=function(el){const d=Store.get();
if(!d.members.length){el.innerHTML='<div class="card"><h3>📞 پیگیری تماس‌های قبل از جلسه</h3></div>'+emptyState("اول از تب «اعضا» اعضا را اضافه کن");return;}
const nc=nextClass(),key=sessionSel()||"",s=d.sessions[key]||{};
let done=d.members.filter(m=>(s[m.id]||{}).p1);
let need=d.members.filter(m=>!(s[m.id]||{}).p1);
done=smartSortMembers(applyListFilter(filterMembersForMe(done,"attend"),"attend"),"attend");
need=smartSortMembers(applyListFilter(filterMembersForMe(need,"attend"),"attend"),"attend");
const pct=d.members.length?Math.round(done.length/d.members.length*100):0;
const pastKeys=Object.keys(d.sessions).filter(k=>k!==key).sort().reverse();
let sel='<select name="session-select" aria-label="انتخاب جلسه" onchange="setSel(this.value)" style="flex:1;font-weight:700">';
sel+='<option value="'+key+'"'+(key===curKey()?" selected":"")+">"+(key===curKey()?"📅 جلسه بعد: ":"جلسه: ")+(key?Jalali.fmt(Jalali.fromKey(key)):"—")+"</option>";
for(const k of pastKeys)sel+='<option value="'+k+'"'+(k===key?" selected":"")+">جلسه گذشته: "+Jalali.fmt(Jalali.fromKey(k))+"</option>";
sel+="</select>";
let h='<div class="card"><h3>📞 پیگیری تماس‌های قبل از جلسه</h3>'+'<div class="row" style="margin-bottom:8px">'+sel+"</div>";
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
function setSel(k){const d=Store.get(),previous=d._lastSession;d._lastSession=k;if(Store.save()===false){if(previous===undefined)delete d._lastSession;else d._lastSession=previous;toast("⚠️ انتخاب جلسه ذخیره نشد؛ انتخاب قبلی حفظ شد");return;}resetUI();render();}
window.setSel=setSel;

/* ---- ثبت ورود ---- */
function openEntry(){const d=Store.get(),nc=nextClass();
if(!nc){toast("⚠️ اول کلاس را در تنظیمات ثبت کنید");return;}
/* Keep normal mobile viewport; do not force focus zoom. */
const target=nc.t.getTime();
const previousLast=d._lastSession,previousTimer=d.timer?JSON.parse(JSON.stringify(d.timer)):null;
d._lastSession=Jalali.toKey(nc.date);
if(!d.timer||d.timer.target!==target)d.timer={target,fired:[]};
if(Store.save()===false){if(previousLast===undefined)delete d._lastSession;else d._lastSession=previousLast;if(previousTimer)d.timer=previousTimer;else delete d.timer;toast("⚠️ نوبت شروع نشد؛ ذخیره‌سازی ناموفق بود");return;}
route="entry";resetUI();UI.callOnly=true;
pushState();renderEntry();}
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
'<div class="entry-body">'+
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
fitEntryHeader();try{decorateHelpHints(el);}catch(e){}
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
if(!key){toast("⚠️ جلسه‌ای برای ثبت حضور انتخاب نشده است");return;}
const hadSession=Object.prototype.hasOwnProperty.call(d.sessions,key);
const before=hadSession?JSON.parse(JSON.stringify(d.sessions[key])):null;d.sessions[key]=d.sessions[key]||{};let n=0;
for(const m of d.members){const cur=d.sessions[key][m.id]=d.sessions[key][m.id]||{};
if(!cur.p2){cur.p2="present";n++;}}
if(Store.save()===false){if(hadSession)d.sessions[key]=before;else delete d.sessions[key];renderEntry();toast("⚠️ ثبت گروهی ذخیره نشد؛ وضعیت قبلی حضور حفظ شد");return;}
renderEntry();celebrate("🎉 "+Jalali.toFa(n)+" نفر حاضر علامت خوردند!");}
window.allPresent=allPresent;

/* ---- شهریه (سه تب) ---- */
Pages.fees=function(el){if(!can("fees")){el.innerHTML='<div class="card"><div class="empty">⛔ به بخش شهریه دسترسی ندارید</div></div>';return;}const d=Store.get();const feeInfo=feeDeadlineInfo();
if(!d.members.length){el.innerHTML=emptyState("اول از تب «اعضا» اعضا را اضافه کن");return;}
const nc=nextClass(),key=curFeeKey(),f=d.fees[key]||{};
const feeDeadlineText=feeInfo.key===key?feeInfo.text:"مهلت خودکار فقط برای جلسهٔ بعد محاسبه می‌شود.";
const np=d.members.filter(m=>!(f[m.id]&&f[m.id].paid)).length;
const pct=d.members.length?Math.round((d.members.length-np)/d.members.length*100):0;
let unpaid=d.members.filter(m=>!(f[m.id]&&f[m.id].paid));unpaid=smartSortMembers(filterMembersForMe(unpaid,"fee"),"fee");
const follow=unpaid.filter(m=>!(f[m.id]||{}).fc);
const contacted=d.members.filter(m=>(f[m.id]&&f[m.id].paid)||((f[m.id]||{}).fc));
const feeKeys=[...new Set([key,...Object.keys(d.fees||{}),...Object.keys(d.sessions||{})].filter(Boolean))].sort().reverse();
let feeSel='<label for="feeSessionSelect">جلسهٔ مربوط به این شهریه</label><select id="feeSessionSelect" name="fee-session" aria-label="انتخاب جلسه برای شهریه" onchange="setSel(this.value)" style="width:100%;margin-bottom:8px">'+feeKeys.map(k=>'<option value="'+k+'"'+(k===key?" selected":"")+'>جلسه: '+Jalali.fmt(Jalali.fromKey(k))+'</option>').join("")+'</select>';
let h=feeSel+'<div class="card fee-summary"><div class="row" style="justify-content:space-between;align-items:center"><div><b>💰 خلاصه شهریه جلسه</b><div class="stat-line">جلسه: '+(key?Jalali.fmt(Jalali.fromKey(key)):"جلسه تنظیم نشده")+' · مهلت: '+esc(feeDeadlineText)+'</div></div><b>'+(np?"⏳ "+Jalali.toFa(np)+" پرداخت‌نشده":"✅ تسویه کامل")+'</b></div><div class="progress"><i style="width:'+pct+'%"></i></div><button class="btn g" type="button" id="btnFeeHami" style="width:100%;margin-top:8px">📤 گزارش شهریه به حامی‌ها</button></div>'+
'<div class="row" style="margin:6px 0 8px;flex-wrap:wrap"><button class="btn sm ghost" type="button" id="btnFeeXls">⬇️ خروجی اکسل</button><button class="btn sm ghost" type="button" onclick="feeReport()">📨 مشاهده گزارش</button><button class="btn sm ghost" type="button" onclick="window.print()">🖨️ چاپ / PDF</button></div>'+
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
function feeStatus(key,mid,st){const d=Store.get(),hadBucket=Object.prototype.hasOwnProperty.call(d.fees,key),hadRecord=hadBucket&&Object.prototype.hasOwnProperty.call(d.fees[key],mid),previous=hadRecord?JSON.parse(JSON.stringify(d.fees[key][mid])):null,previousLast=d._lastFee;d.fees[key]=d.fees[key]||{};
const cur=d.fees[key][mid]=d.fees[key][mid]||{};
if(cur.fc===st&&st!=="paid")cur.fc=null;
else{cur.fc=st;
if(st==="paid"&&!cur.paid){cur.paid=true;cur.date=Jalali.toKey(Jalali.today());}}
d._lastFee=key;if(Store.save()===false){if(hadRecord)d.fees[key][mid]=previous;else delete d.fees[key][mid];if(!hadBucket)delete d.fees[key];d._lastFee=previousLast;render();toast("⚠️ پیگیری شهریه ذخیره نشد؛ اطلاعات قبلی حفظ شد");return;}
const y=window.scrollY;render();window.scrollTo(0,y);
if(d.members.length&&d.members.every(m=>(d.fees[key][m.id]||{}).paid))celebrate("🎉 شهریه این جلسه کامل شد!");}
function restoreFee(key,mid){const d=Store.get(),cur=(d.fees[key]||{})[mid];if(!cur)return;
const previous=JSON.parse(JSON.stringify(cur));cur.fc=null;
if(Store.save()===false){d.fees[key][mid]=previous;render();toast("⚠️ ذخیره نشد؛ وضعیت قبلی حفظ شد");return;}
render();}
window.setFeeTab=setFeeTab;

/* ---- تکالیف (دو تب + جستجو + صدا + ویرایش) ---- */
Pages.homework=function(el){/* sectioned */const d=Store.get();
let h='<div class="row" style="margin-bottom:10px"><button class="chip'+(!UI.doneTab?" on":"")+'" style="flex:1" onclick="setDoneTab(false)">➕ تکلیف جدید</button><button class="chip'+(UI.doneTab?" on":"")+'" style="flex:1" onclick="setDoneTab(true)">📚 آرشیو ('+Jalali.toFa(d.homework.length)+')</button></div>';
if(!UI.doneTab){
h+='<div class="card"><h3>📚 تکلیف جدید</h3><label>جلسه (تاریخ)</label>'+
'<input id="hwDate" name="hw-date" readonly placeholder="انتخاب تاریخ" value="'+(sessionSel()?Jalali.fmt(Jalali.fromKey(sessionSel())):(nextClass()?Jalali.fmt(nextClass().date):""))+'" data-key="'+(sessionSel()||"")+'" onclick="pickHWDate()" style="cursor:pointer">'+
'<label>متن تکلیف</label><textarea id="hwText" name="hw-text" placeholder="تکلیف این هفته را بنویسید…"></textarea>'+
'<div class="row hw-audio-actions" style="margin-top:8px">'+speechBtn("hwText")+'<button type="button" class="btn sm ghost" id="hwMic" aria-label="ضبط یادداشت صوتی">🎙 ضبط صدا</button><span id="hwV"></span></div>'+
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
const previous=hw.text;hw.text=t;if(Store.save()===false){hw.text=previous;render();toast("⚠️ ویرایش ذخیره نشد؛ متن قبلی حفظ شد");return;}o.remove();render();toast("✅ ویرایش شد");};}
window.hwEdit=hwEdit;

/* ---- اعضا ---- */
Pages.members=function(el){
el.innerHTML='<div class="card hero members-hero"><div class="members-hero-title"><h3>👥 اعضا</h3><button type="button" class="members-help-btn" onclick="showMembersHelp()" aria-label="راهنمای صفحه اعضا" title="راهنمای صفحه اعضا">?</button></div></div>'+
'<div class="card"><div class="sec-label">جستجو و افزودن</div><div class="row"><input id="mSearch" name="member-search" aria-label="جستجوی نام عضو" placeholder="🔍 جستجوی نام…" oninput="renderMembers(this.value)" style="flex:1"><button class="btn p" onclick="memberForm()" aria-label="افزودن عضو جدید">＋</button></div>'+
'<div class="row" style="margin-top:8px;gap:6px;flex-wrap:wrap"><button class="btn ghost sm" onclick="exportMembersCSV()">📊 خروجی کامل</button><button class="btn ghost sm" onclick="document.getElementById(\'mimp\').click()">⬆️ ورود</button><input type="file" id="mimp" class="sr" accept=".csv,text/csv" onchange="importMembersCSV(this)"><select id="memberSort" aria-label="مرتب‌سازی اعضا" onchange="memberSortMode=this.value;renderMembers(document.getElementById(\'mSearch\').value)" style="flex:1;min-width:130px"><option value="name">مرتب‌سازی: نام</option><option value="family">نام خانوادگی</option><option value="birth">تاریخ تولد</option><option value="phone">شماره تلفن</option></select></div>'+
'<div class="role-legend">'+
'<span class="role-ico" title="پیگیری حضور">📞</span><span class="leg">حضور</span>'+
'<span class="role-ico" title="شهریه">💰</span><span class="leg">شهریه</span>'+
'<span class="role-ico" title="تکالیف">📋</span><span class="leg">تکلیف</span>'+
'<span class="role-ico" title="حامی">🤝</span><span class="leg">حامی</span>'+
'</div></div><div class="sec-label">فهرست اعضا</div><div id="mList"></div>';
renderMembers("");
/* Persistent add action stays available after saving each member. */
const addBar=document.createElement("div");addBar.className="members-add-bar";addBar.innerHTML='<button type="button" class="btn p" onclick="memberForm()">＋ ثبت عضو جدید</button>';el.appendChild(addBar);
};

/* ---- تنظیمات ---- */
Pages.settings=function(el){if(!can("settings")){el.innerHTML='<div class="card"><p>فقط مدیر به تنظیمات دسترسی دارد.</p><button class="btn ghost" onclick="logoutUser()">خروج</button></div>';return;}const d=Store.get(),DAYS=Jalali.DN,st=d.settings;
const cls=d.classes.map((c,i)=>'<div class="mem"><div class="stat-ico">🗓</div><b>'+DAYS[c.dow]+" — "+Jalali.toFa(c.start)+" تا "+Jalali.toFa(c.end)+'</b><button class="btn sm d" style="margin-right:auto" onclick="delClass('+i+')">حذف</button></div>').join("");
const extras=(d.extra||[]).map((ex,i)=>'<div class="mem"><div class="stat-ico">📅</div><b>'+Jalali.fmt(Jalali.fromKey(ex.key))+" — "+Jalali.toFa(ex.start)+" تا "+Jalali.toFa(ex.end)+'</b><button class="btn sm d" style="margin-right:auto" onclick="delExtra('+i+')">حذف</button></div>').join("");
const COLORS=[["blue","آبی","#2563eb"],["teal","فیروزه‌ای","#0d9488"],["purple","بنفش","#7c3aed"],["warm","گرم","#ea580c"]];
const sz=JSON.stringify(d).length/1024;
el.innerHTML=
'<div class="card"><h3>🗓 کلاس‌های هفتگی</h3>'+(cls||'<p class="stat-line">کلاسی ثبت نشده</p>')+
'<div class="class-calendar-fields"><label for="cDate">تاریخ شروع کلاس</label><input type="text" id="cDate" aria-label="تاریخ شروع کلاس شمسی" placeholder="انتخاب تاریخ شمسی" readonly onclick="pickClassDate(\'cDate\')"><label for="cEndDate">تاریخ پایان (اختیاری)</label><input type="text" id="cEndDate" aria-label="تاریخ پایان کلاس شمسی" placeholder="انتخاب تاریخ شمسی (اختیاری)" readonly onclick="pickClassDate(\'cEndDate\')"></div><div class="row" style="margin-top:10px"><select id="cDow" style="flex:1.2" aria-label="روز هفته">'+DAYS.map((n,i)=>'<option value="'+i+'">'+n+"</option>").join("")+'</select><input type="time" id="cS" name="class-start" aria-label="ساعت شروع" value="19:00" style="flex:1"><input type="time" id="cE" name="class-end" aria-label="ساعت پایان" value="21:00" style="flex:1"><button class="btn p sm" onclick="addClass()" aria-label="افزودن کلاس">＋</button></div></div>'+
'<div class="card"><h3>📅 جلسات خاص (جبرانی / تعطیلات)</h3>'+(extras||'<p class="stat-line">جلسه خاصی ثبت نشده</p>')+
'<div class="row" style="margin-top:8px"><button class="btn p sm" style="flex:1" onclick="addExtra()">➕ جلسه با تاریخ مشخص</button></div></div>'+
'<div class="card"><h3>🎨 رنگ برنامه</h3><div class="row">'+COLORS.map(c=>'<button class="swatch'+(st.color===c[0]?" on":"")+'" style="background:linear-gradient(135deg,'+c[2]+',#fff3)" onclick="setColor(\''+c[0]+'\')" aria-label="رنگ '+c[1]+'"></button>').join("")+"</div>"+
'<p class="stat-line" style="margin:8px 0 0">'+({blue:"آبی — آرام و رسمی",teal:"فیروزه‌ای — تازه و شاداب",purple:"بنفش — مدرن",warm:"گرم — صمیمی"}[st.color]||"")+"</p></div>"+
'<div class="card"><h3>⏰ تایمر ثبت ورود</h3><label>لحظه‌های یادآوری (دقیقه، با کاما)</label>'+
'<input id="alarmIn" name="alarm-times" value="'+st.alarmTimes.join(",")+'" dir="ltr" inputmode="numeric" aria-label="لحظه‌های یادآوری">'+
'<div class="row" style="margin-top:8px"><button class="chip'+(st.sound?" on":"")+'" onclick="toggleSound()">'+(st.sound?"🔔 صدا روشن":"🔕 صدا خاموش")+'</button><span class="stat-line">ویبره همیشه فعال است</span></div></div>'+
'<div class="card"><h3>🎨 نمایش</h3><label>تم</label><div class="row"><button class="btn sm '+(theme()==="dark"?"p":"ghost")+'" onclick="setTheme(\'dark\')">🌙 تیره</button><button class="btn sm '+(theme()==="light"?"p":"ghost")+'" onclick="setTheme(\'light\')">☀️ روشن</button></div>'+
'<label>اندازه متن</label><div class="row">'+[["s","کوچک"],["m","متوسط"],["l","بزرگ"]].map(f=>'<button class="btn sm '+(st.fs===f[0]?"p":"ghost")+'" onclick="setFS(\''+f[0]+'\')">'+f[1]+"</button>").join("")+"</div></div>"+
'<div class="card"><h3>💾 پشتیبان و همگام‌سازی</h3><div class="focus-banner" style="margin:0 0 10px">⚠️ داده‌ها فقط در همین مرورگر است!</div></div>'+
'<div class="card"><h3>🏫 نام کلاس</h3><input id="classNameIn" value="'+esc(st.className||"کلاس من")+'" placeholder="مثلاً کلاس ریاضی" onchange="setClassName(this.value)" aria-label="نام کلاس"></div>'+
'<div class="card"><h3>👥 گروه‌ها</h3><div id="grpList" class="row" style="flex-wrap:wrap;gap:6px;margin-bottom:8px"></div><button class="btn sm ghost" onclick="addGroup()">＋ گروه جدید</button></div>'+
'<div class="card" id="storCard"><h3>💾 فضای ذخیره‌سازی</h3><div id="storBody"></div></div>'+
'<div class="card"><h3>🔔 هوشمندسازی</h3><div class="row" style="flex-wrap:wrap;gap:8px"><button class="btn sm ghost" onclick="enableNotifs()">🔔 اعلان کلاس</button><button class="btn sm ghost" onclick="togglePrivacyMode()">🔒 حریم خصوصی</button><button class="btn sm ghost" onclick="editTemplates()">📝 الگوهای پیام</button><button class="btn sm ghost" onclick="toggleAutoTheme()">🌓 تم خودکار</button><button class="btn sm ghost" onclick="toggleA11y()">♿ دسترسی‌پذیری</button><button class="btn sm ghost" onclick="toggleOled()">⬛ OLED</button><button class="btn sm ghost" onclick="openCommandPalette()">⌘ دستورات</button><button class="btn sm ghost" onclick="performUndo()">↩ بازگشت</button><button class="btn sm ghost" onclick="handoffPackage()">📦 تحویل شیفت</button><button class="btn sm ghost" onclick="compactSyncExport()">🔗 همگام فشرده</button><button class="btn sm ghost" onclick="communicationHub()">📡 ارتباطات</button><button class="btn sm ghost" onclick="copyPrevSession()">📋 کپی جلسه قبل</button><button class="btn sm ghost" onclick="transferMyTasks()">🔄 انتقال وظایف</button><button class="btn sm ghost" onclick="toggleFocusMode()">🎯 تمرکز پشت‌در</button><button class="btn sm ghost" onclick="shareStoryCard()">📸 کارت استوری</button><button class="btn sm ghost" onclick="exportICS()">📅 خروجی تقویم</button><button class="btn sm ghost" onclick="shareClassCode()">📲 اشتراک QR</button><button class="btn sm ghost" onclick="showInsights()">✨ بینش</button></div><p class="stat-line" style="margin-top:8px">اعلان ۱۵ دقیقه قبل از کلاس · تقویم ICS · اشتراک برنامه</p></div>'+
'<div class="card"><h3>👥 کاربران و دسترسی</h3><p class="role-hint">استفاده مشترک: برای هر نفر کاربر و رمز جدا بسازید.</p><div class="toggle-row"><span>ورود با رمز اجباری</span><button type="button" class="sw '+(st.requireLogin?"on":"")+'" id="swLogin"></button></div><div class="toggle-row"><span>تأیید قبل از کارهای مهم</span><button type="button" class="sw '+(st.quickConfirm!==false?"on":"")+'" id="swConfirm"></button></div><div id="userList" style="margin-top:8px"></div><button class="btn sm p" style="margin-top:8px" id="btnAddUser">＋ کاربر جدید</button> <button class="btn sm ghost" style="margin-top:8px" id="btnLogout">خروج</button></div>'+'<div class="card"><h3>💾 پشتیبان و بازیابی</h3><div class="row"><button class="btn p" style="flex:1" onclick="backup()">⬇️ پشتیبان</button><button class="btn ghost" style="flex:1" onclick="document.getElementById(\'rf\').click()">⬆️ بازیابی</button><input type="file" id="rf" class="sr" accept=".json" onchange="restore(this)"></div>'+
'<button class="btn g" style="width:100%;margin-top:8px" onclick="shareBackup()">📤 ارسال داده برای همگام‌سازی</button></div>'+
'<div class="card"><h3>ℹ️ درباره</h3><p class="stat-line">My-Class-Track — نسخه ۲۴ — ماژول ES و ناوبری هوشمند<br>کاملاً آفلاین — حجم داده: '+Jalali.toFa(~~sz)+' کیلوبایت از ~۵ مگابایت</p>'+
'<button class="btn d" style="width:100%" onclick="wipeAll()">🗑 پاک کردن همه داده‌ها</button></div>';

/* Settings are presented as a compact shortcut hub; the original controls remain available in their category. */
const settingsGroups=[
 {id:"calendar",title:"برنامه و تقویم",icon:"▦",desc:"کلاس‌های هفتگی و جلسات تاریخ‌دار"},
 {id:"appearance",title:"ظاهر و رنگ",icon:"◐",desc:"تم، رنگ و اندازه نوشته"},
 {id:"reminders",title:"یادآوری‌ها",icon:"◷",desc:"تایمر، صدا و اعلان‌ها"},
 {id:"people",title:"کلاس و کاربران",icon:"♙",desc:"نام کلاس، گروه‌ها و دسترسی"},
 {id:"data",title:"داده و پشتیبان",icon:"▤",desc:"ذخیره، بازیابی و فضای داده"},
 {id:"tools",title:"ابزارهای تکمیلی",icon:"⚙",desc:"حریم خصوصی و ابزارهای کمکی"}
];
el.insertAdjacentHTML("afterbegin",'<section class="settings-hub" id="settingsHome"><div class="settings-hub-head"><b>تنظیمات</b><span>یک بخش را انتخاب کنید</span></div><div class="settings-shortcut-grid">'+settingsGroups.map(g=>'<button type="button" class="settings-shortcut" data-settings-group="'+g.id+'"><span class="settings-shortcut-icon" aria-hidden="true">'+g.icon+'</span><b>'+g.title+'</b><small>'+g.desc+'</small><span class="settings-shortcut-arrow" aria-hidden="true">‹</span></button>').join("")+'</div></section><div id="settingsPanelHead" class="settings-panel-head" hidden><button type="button" class="btn sm ghost" id="settingsBack">→ بازگشت به تنظیمات</button><b id="settingsPanelTitle"></b></div>');
const settingsCards=[...el.querySelectorAll(".card")];
function settingsGroup(card){
 const title=(card.querySelector("h3")?.textContent||"").trim();
 if(title.includes("کلاس‌های هفتگی")||title.includes("جلسات خاص"))return "calendar";
 if(title.includes("رنگ برنامه")||title.includes("نمایش"))return "appearance";
 if(title.includes("تایمر ثبت ورود"))return "reminders";
 if(title.includes("هوشمندسازی"))return "tools";
 if(title.includes("نام کلاس")||title.includes("گروه‌ها")||title.includes("کاربران و دسترسی"))return "people";
 if(title.includes("فضای ذخیره‌سازی")||title.includes("پشتیبان و بازیابی")||title.includes("پشتیبان و همگام‌سازی")||title.includes("درباره"))return "data";
 return "tools";
}
settingsCards.forEach(card=>{card.dataset.settingsGroup=settingsGroup(card);card.hidden=true;});
const settingsHome=document.getElementById("settingsHome"),settingsHead=document.getElementById("settingsPanelHead");
let activeSettingsGroup=null;
const showSettingsGroup=id=>{
 const group=settingsGroups.find(g=>g.id===id);if(!group)return;
 activeSettingsGroup=id;
 settingsHome.hidden=true;settingsHead.hidden=false;
 document.getElementById("settingsPanelTitle").textContent=group.title;
 settingsCards.forEach(card=>card.hidden=card.dataset.settingsGroup!==id);
 document.getElementById("settingsBack")?.focus();
};
el.querySelectorAll(".settings-shortcut[data-settings-group]").forEach(b=>b.addEventListener("click",()=>showSettingsGroup(b.dataset.settingsGroup)));
const settingsBack=document.getElementById("settingsBack");
if(settingsBack)settingsBack.onclick=()=>{
 const returnTo=activeSettingsGroup;
 settingsCards.forEach(card=>card.hidden=true);settingsHead.hidden=true;settingsHome.hidden=false;
 activeSettingsGroup=null;
 const shortcut=[...settingsHome.querySelectorAll(".settings-shortcut[data-settings-group]")].find(b=>b.dataset.settingsGroup===returnTo);
 if(shortcut)shortcut.focus();
};
el.addEventListener("keydown",ev=>{
 if(ev.key==="Escape"&&settingsHome.hidden&&!settingsHead.hidden){ev.preventDefault();settingsBack?.click();}
});
window.pickClassDate=function(id){
 const input=document.getElementById(id);if(!input)return;
 let cur=null;
 if(input.dataset.iso){const parts=input.dataset.iso.split("-").map(Number);if(parts.length===3)cur=Jalali.toJ(parts[0],parts[1],parts[2]);}
 datePick(cur,j=>{
   const g=Jalali.toG(j.jy,j.jm,j.jd);
   input.dataset.iso=g.gy+"-"+String(g.gm).padStart(2,"0")+"-"+String(g.gd).padStart(2,"0");
   input.value=Jalali.fmt(j);
   if(id==="cDate"){const dw=document.getElementById("cDow");if(dw)dw.value=String(Jalali.dow(j));}
 });
};

const ul=document.getElementById("userList");if(ul){ul.innerHTML=(d.users||[]).map(u=>'<div class="mem user-setting-row"><div class="stat-ico">👤</div><div style="flex:1;min-width:0"><b>'+esc(u.name)+'</b><div class="stat-line">'+esc(({admin:"مدیر",support:"حامی",follow:"پیگیر",view:"مشاهده‌گر"})[u.role]||u.role)+'</div></div><button type="button" class="btn sm ghost" onclick="userForm(\''+u.id+'\')">ویرایش</button><button type="button" class="btn sm d" onclick="delUser(\''+u.id+'\')">حذف</button></div>').join("")||'<p class="stat-line">کاربری ثبت نشده است.</p>';}
const addU=document.getElementById("btnAddUser");if(addU)addU.onclick=()=>userForm();const outU=document.getElementById("btnLogout");if(outU)outU.onclick=()=>logoutUser();const swL=document.getElementById("swLogin");if(swL)swL.onclick=()=>{const x=Store.get();x.settings.requireLogin=!x.settings.requireLogin;Store.save();render();toast(x.settings.requireLogin?"ورود با رمز فعال شد":"ورود با رمز غیرفعال شد");};const swC=document.getElementById("swConfirm");if(swC)swC.onclick=()=>{const x=Store.get();x.settings.quickConfirm=x.settings.quickConfirm===false;Store.save();render();toast(x.settings.quickConfirm?"تأیید عملیات فعال شد":"تأیید عملیات غیرفعال شد");};
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
const pb=document.getElementById("pruneBtn");if(pb)pb.onclick=()=>pruneSessions();}

};

function emptyState(m){return'<div class="card empty-state-card"><div class="empty-state-mark" aria-hidden="true">✓</div><h3>هنوز موردی برای نمایش نیست</h3><p>'+esc(m)+'</p><button type="button" class="btn p" onclick="go(\'members\')">＋ رفتن به اعضا</button></div>';}

/* ---- اعضا: عملیات ---- */
function showMembersHelp(){const o=modal('<div class="members-help"><div class="members-help-head"><span class="members-help-mark">?</span><div><h3>راهنمای صفحه اعضا</h3><p>مدیریت سریع اعضای کلاس</p></div></div><ul><li>برای افزودن عضو، دکمه ＋ کنار جستجو را بزنید.</li><li>با جستجو می‌توانید عضو موردنظر را سریع پیدا کنید.</li><li>آیکون‌های کنار نام، نقش‌های عضو را نشان می‌دهند: حضور، شهریه، تکلیف و حامی.</li><li>برای اصلاح اطلاعات از دکمه ویرایش استفاده کنید.</li><li>ورود و خروجی اعضا برای انتقال یا نگهداری اطلاعات در دسترس است.</li></ul><button type="button" class="btn p" style="width:100%;margin-top:8px" id="membersHelpDone">متوجه شدم</button></div>');o.classList.add("members-help-overlay");const b=o.querySelector("#membersHelpDone");if(b)b.onclick=()=>o.remove();}
window.showMembersHelp=showMembersHelp;
let memberSortMode="name";
function renderMembers(q){q=(q||"").trim();const d=Store.get();
let list=d.members.filter(m=>!q||m.name.includes(q));
const pins=d.pinnedMembers||[];
const familyName=m=>{const p=String(m.name||"").trim().split(/\\s+/);return p.length>1?p[p.length-1]:p[0]||"";};
const birthKey=m=>m.birth?String(m.birth.jy).padStart(4,"0")+"-"+String(m.birth.jm).padStart(2,"0")+"-"+String(m.birth.jd).padStart(2,"0"):"9999-99-99";
const phoneKey=m=>(m.phones||[]).filter(Boolean)[0]||"~~~~~~~~";
const cmp=(a,b)=>memberSortMode==="family"?familyName(a).localeCompare(familyName(b),"fa")||a.name.localeCompare(b.name,"fa"):memberSortMode==="birth"?birthKey(a).localeCompare(birthKey(b)):memberSortMode==="phone"?phoneKey(a).localeCompare(phoneKey(b)):a.name.localeCompare(b.name,"fa");
list=list.slice().sort((a,b)=>((pins.indexOf(b.id)>=0?1:0)-(pins.indexOf(a.id)>=0?1:0))||cmp(a,b));
 $("#mList").innerHTML=list.length?('<div class="card">'+list.map(m=>{
const rl=roleIconsHTML(m.roles)+(m.group&&m.group!=="عمومی"?'<span class="role-ico" title="گروه: '+esc(m.group)+'">🏷</span>':"");
const p0=(m.phones||[]).filter(Boolean)[0];
const extraN=(m.phones||[]).filter(Boolean).length-1;
return'<div class="mem mem-row">'+avatar(m)+'<div class="mem-main"><div class="mem-name"><b>'+esc(m.name)+'</b>'+needTags(m)+rl+'</div><div class="mem-meta">'+
(p0?'<a href="tel:'+esc(p0)+'" class="mem-phone" aria-label="تماس با '+esc(m.name)+'">📞 '+Jalali.toFa(p0)+'</a>'+(extraN>0?'<span class="mem-extra">+'+Jalali.toFa(extraN)+'</span>':''):'<span class="mem-muted">بدون شماره</span>')+
(supporterName(m)?'<span class="mem-muted"> · 🤝 '+esc(supporterName(m))+'</span>':'')+
(m.birth?'<span class="mem-muted"> · 🎂 '+Jalali.fmt(m.birth)+'</span>':'')+
'</div></div><div class="mem-actions">'+audBtn(m.voice,"پخش یادداشت "+m.name)+'<button class="btn sm ghost ico-btn" onclick="memberForm(\''+m.id+'\')" aria-label="ویرایش">✏️</button><button class="btn sm ghost ico-btn" onclick="delMember(\''+m.id+'\')" aria-label="حذف">🗑</button></div></div>';
}).join("")+"</div>"):('<div class="card empty-members-card"><div class="empty"><div class="empty-members-art" aria-hidden="true"><span>م</span><span>ع</span><span>ض</span></div><h3>هنوز عضوی ثبت نشده</h3><p>برای شروع، اولین عضو کلاس را اضافه کنید.</p><button class=btn onclick=memberForm()>＋ افزودن اولین عضو</button></div></div>');}
/* Canonicalise Persian/Arabic phone digits so validation and duplicate checks agree. */
function latinPhoneDigits(value){
 return String(value||"")
  .replace(/[۰-۹]/g,d=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
  .replace(/[٠-٩]/g,d=>String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}
function canonicalPhone(value){
 let p=latinPhoneDigits(value).replace(/[\s().-]/g,"");
 if(p.startsWith("+98"))p="0"+p.slice(3);
 else if(p.startsWith("0098"))p="0"+p.slice(4);
 else if(p.startsWith("98")&&p.length===12)p="0"+p.slice(2);
 return p;
}
function validPhone(value){
 const p=canonicalPhone(value);
 return !p || /^0?9\d{9}$/.test(p) || /^\+?\d{8,15}$/.test(p);
}
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
for(const p of phs){if(!validPhone(p)){toast("⚠️ شماره «"+p+"» معتبر نیست");return;}}
const canonicalPhones=phs.map(canonicalPhone);
if(new Set(canonicalPhones).size!==canonicalPhones.length){toast("⚠️ یک شماره تماس بیش از یک‌بار وارد شده است");return;}
const duplicateOwners=[];
d.members.filter(x=>!m||x.id!==m.id).forEach(x=>{
 const existing=(x.phones||[]).map(canonicalPhone).filter(Boolean);
 if(canonicalPhones.some(p=>p&&existing.includes(p))&&!duplicateOwners.includes(x.name))duplicateOwners.push(x.name);
});
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
const commitMember=()=>{
const previous=m?JSON.parse(JSON.stringify(m)):null;
const savedMember=m?m:Object.assign({id:Store.uid()},obj);
if(m)Object.assign(m,obj);else d.members.push(savedMember);
if(Store.save()===false){if(m){for(const k of Object.keys(m))delete m[k];Object.assign(m,previous);}else{const at=d.members.indexOf(savedMember);if(at>=0)d.members.splice(at,1);}render();toast("⚠️ ذخیره عضو ناموفق بود؛ اطلاعات قبلی حفظ شد");return;}
o.remove();render();toast("✅ ذخیره شد");
};
if(duplicateOwners.length){
 confirm2("این شماره با عضو دیگری مشترک است: "+duplicateOwners.join("، ")+". اگر اشتراک شماره عمدی است، ادامه دهید.",commitMember);
 return;
}
commitMember();};}
function delMember(id){if(!requirePerm("delete","اجازه حذف ندارید"))return;const d=Store.get();const i=d.members.findIndex(m=>m.id===id);if(i<0)return;
const mm=d.members.splice(i,1)[0];if(Store.save()===false){d.members.splice(i,0,mm);render();toast("⚠️ حذف عضو ذخیره نشد؛ اطلاعات عضو حفظ شد");return;}render();
toastUndo("🗑 "+mm.name+" حذف شد",()=>{const at=Math.min(i,d.members.length);d.members.splice(at,0,mm);if(Store.save()===false){const restored=d.members.indexOf(mm);if(restored>=0)d.members.splice(restored,1);render();toast("⚠️ بازگردانی عضو ذخیره نشد؛ وضعیت قبلی حفظ شد");return;}render();});}

/* ---- جلسات خاص ---- */
function validClassTimeRange(start,end){
 if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(start||"")||!/^([01]\d|2[0-3]):[0-5]\d$/.test(end||""))return false;
 const minutes=t=>Number(t.slice(0,2))*60+Number(t.slice(3,5));
 return minutes(end)>minutes(start);
}
function addExtra(){const o=modal("<h3 style='font-weight:800'>➕ جلسه با تاریخ مشخص</h3><label>تاریخ جلسه</label><input id='exD' name='ex-date' readonly placeholder='انتخاب تاریخ' onclick='exPick()' style='cursor:pointer'><label>ساعت شروع</label><input type='time' id='exS' name='ex-start' value='19:00' aria-label='ساعت شروع'><label>ساعت پایان</label><input type='time' id='exE' name='ex-end' value='21:00' aria-label='ساعت پایان'><div class='row' style='margin-top:12px'><button class='btn p' style='flex:1' id='exOk'>💾 ذخیره</button><button class='btn ghost' id='exCl'>انصراف</button></div>");
let key=null;
window.exPick=()=>datePick(null,j=>{key=Jalali.toKey(j);document.getElementById("exD").value=Jalali.fmt(j);});
document.getElementById("exCl").onclick=()=>o.remove();
document.getElementById("exOk").onclick=()=>{if(!key){toast("⚠️ تاریخ را انتخاب کنید");return;}
const start=document.getElementById("exS").value,end=document.getElementById("exE").value;
if(!validClassTimeRange(start,end)){toast("⚠️ ساعت پایان باید بعد از ساعت شروع باشد");return;}
const d=Store.get();d.extra=d.extra||[];
if(d.extra.some(x=>x.key===key)){toast("⚠️ برای این تاریخ جلسه ثبت شده");return;}
const added={key,start,end};d.extra.push(added);
if(Store.save()===false){const at=d.extra.indexOf(added);if(at>=0)d.extra.splice(at,1);toast("⚠️ ذخیره جلسه ناموفق بود؛ تغییر ثبت نشد");return;}
o.remove();render();toast("✅ جلسه اضافه شد");};}
function delExtra(i){confirm2("این جلسه حذف شود؟",()=>{const d=Store.get();d.extra=d.extra||[];if(i<0||i>=d.extra.length)return;const removed=d.extra.splice(i,1)[0];if(Store.save()===false){d.extra.splice(i,0,removed);render();toast("⚠️ حذف جلسه ذخیره نشد؛ جلسه حفظ شد");return;}render();});}
window.addExtra=addExtra;window.delExtra=delExtra;

/* ---- حضور ---- */
function toggleCallFilter(){UI.callOnly=!UI.callOnly;UI.filter="";render();}
function setAtt(key,mid,ph,st){const d=Store.get();
if(!key){toast("⚠️ اول کلاس را در تنظیمات ثبت کنید");return;}
d._lastSession=key;d.sessions[key]=d.sessions[key]||{};
const _prev=d.sessions[key][mid]?JSON.parse(JSON.stringify(d.sessions[key][mid])):null;
const cur=d.sessions[key][mid]=d.sessions[key][mid]||{};cur.time=Date.now();cur.by=(currentUser()||{}).name||"";
const tF=ph==="p1"?"time":"time2",nF=ph==="p1"?"note":"note2";
const was=cur[ph],undoBefore=JSON.parse(JSON.stringify(d.undoStack||[]));
if(cur[ph]===st){cur[ph]=null;delete cur[tF];delete cur[nF];delete cur[ph==="p1"?"a1":"a2"];}
else cur[ph]=st;
pushUndo({type:"att",key:key,mid:mid,prev:_prev,label:"ثبت حضور"});
if(Store.save()===false){if(_prev)d.sessions[key][mid]=_prev;else delete d.sessions[key][mid];if(!d.sessions[key]||!Object.keys(d.sessions[key]).length)delete d.sessions[key];d.undoStack=undoBefore;render();toast("⚠️ حضور ذخیره نشد؛ اطلاعات قبلی حفظ شد");return;}
const y=window.scrollY;
if(route==="entry")renderEntry();else render();
window.scrollTo(0,y);
if(cur[ph]&&was!==cur[ph]){
const mm=d.members.find(m=>m.id===mid);if(!mm)return;
toastUndo("📝 "+mm.name+": "+ST.lbl[cur[ph]],()=>{
const c=d.sessions[key][mid];if(!c)return;const before=JSON.parse(JSON.stringify(c)),undoBefore=JSON.parse(JSON.stringify(d.undoStack||[]));
c[ph]=null;delete c[ph==="p1"?"time":"time2"];delete c[ph==="p1"?"note":"note2"];delete c[ph==="p1"?"a1":"a2"];
if(Store.save()===false){d.sessions[key][mid]=before;d.undoStack=undoBefore;render();toast("⚠️ بازگردانی حضور ذخیره نشد؛ وضعیت قبلی حفظ شد");return;}route==="entry"?renderEntry():render();});
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
const nc=nextClass(),sessionDate=key?Jalali.fromKey(key):null,icon={present:"✅",delay:"⏰",absent:"📭",problem:"💬",none:"—"};
let out="📋 گزارش حضور — "+(sessionDate?Jalali.fmt(sessionDate):"جلسه تنظیم نشده")+" — "+(ph===1?"نوبت ۱ (تماس‌های قبلی)":"نوبت ۲ (ثبت ورود)")+"\n";
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
const sessionDate=key?Jalali.fromKey(key):null;
return"💰 گزارش شهریه — "+(sessionDate?Jalali.fmt(sessionDate):"جلسه تنظیم نشده")+"\n"+
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
function togglePay(key,mid){const d=Store.get(),hadBucket=Object.prototype.hasOwnProperty.call(d.fees,key),hadRecord=hadBucket&&Object.prototype.hasOwnProperty.call(d.fees[key],mid),previous=hadRecord?JSON.parse(JSON.stringify(d.fees[key][mid])):null,previousLast=d._lastFee;d.fees[key]=d.fees[key]||{};
if(d.fees[key][mid]&&d.fees[key][mid].paid)delete d.fees[key][mid];
else d.fees[key][mid]={paid:true,date:Jalali.toKey(Jalali.today()),note:""};
d._lastFee=key;if(Store.save()===false){if(hadRecord)d.fees[key][mid]=previous;else delete d.fees[key][mid];if(!hadBucket)delete d.fees[key];d._lastFee=previousLast;render();toast("⚠️ ثبت پرداخت ذخیره نشد؛ اطلاعات قبلی حفظ شد");return;}
const y=window.scrollY;render();window.scrollTo(0,y);
if(d.members.length&&d.members.every(m=>(d.fees[key][m.id]||{}).paid))celebrate("🎉 شهریه این جلسه کامل شد!");}
function feeNote(key,mid,v){const d=Store.get(),cur=(d.fees[key]||{})[mid];if(!cur){toast("⚠️ رکورد پیگیری پیدا نشد؛ دوباره صفحه را باز کنید");return;}const hadNote=Object.prototype.hasOwnProperty.call(cur,"note"),previous=cur.note,previousLast=d._lastFee;cur.note=v;d._lastFee=key;if(Store.save()===false){if(hadNote)cur.note=previous;else delete cur.note;d._lastFee=previousLast;toast("⚠️ یادداشت ذخیره نشد؛ متن قبلی حفظ شد");}}

/* ---- تکالیف: عملیات ---- */
function pickHWDate(){datePick(null,j=>{const e=document.getElementById("hwDate");e.value=Jalali.fmt(j);e._j=Jalali.toKey(j);});}
function saveHW(){const t=document.getElementById("hwText").value.trim();
if(!t){toast("⚠️ متن تکلیف را بنویسید");return;}
const de=document.getElementById("hwDate");
const key=de._j||de.dataset.key||Jalali.toKey(nextClass()?nextClass().date:Jalali.today());
const d=Store.get(),item={id:Store.uid(),key,text:t,audio:window._hwA||null};d.homework.push(item);
if(Store.save()===false){const i=d.homework.findIndex(h=>h.id===item.id);if(i>=0)d.homework.splice(i,1);render();toast("⚠️ تکلیف ذخیره نشد؛ اطلاعات قبلی حفظ شد");return;}
window._hwA=null;render();toast("✅ ذخیره شد");}
function delHW(id){const d=Store.get();const i=d.homework.findIndex(h=>h.id===id);if(i<0)return;
const hw=d.homework.splice(i,1)[0];if(Store.save()===false){d.homework.splice(i,0,hw);render();toast("⚠️ حذف تکلیف ذخیره نشد؛ تکلیف حفظ شد");return;}render();
toastUndo("🗑 حذف شد",()=>{d.homework.splice(Math.min(i,d.homework.length),0,hw);if(Store.save()===false){const at=d.homework.findIndex(x=>x.id===hw.id);if(at>=0)d.homework.splice(at,1);render();toast("⚠️ بازگردانی ذخیره نشد؛ وضعیت قبلی حفظ شد");return;}render();});}
function copyHW(id){const hw=Store.get().homework.find(h=>h.id===id);
if(hw)shareTxt("📚 تکلیف جلسه "+Jalali.fmt(Jalali.fromKey(hw.key))+":\n\n"+hw.text);}

/* ---- تنظیمات: عملیات ---- */
function addClass(){const d=Store.get();const startDate=$("#cDate")?($("#cDate").dataset.iso||""):"",endDate=$("#cEndDate")?($("#cEndDate").dataset.iso||""):"",start=$("#cS")?$("#cS").value:"",end=$("#cE")?$("#cE").value:"";if(!validClassTimeRange(start,end)){toast("⚠️ ساعت پایان باید بعد از ساعت شروع باشد");return;}if(startDate&&endDate&&endDate<startDate){toast("⚠️ تاریخ پایان باید بعد از شروع باشد");return;}const dow=startDate?Jalali.dow(Jalali.toJ(...startDate.split("-").map(Number))):+$("#cDow").value;
const item={dow,start,end,startDate,endDate};d.classes.push(item);
if(Store.save()===false){const at=d.classes.indexOf(item);if(at>=0)d.classes.splice(at,1);render();toast("⚠️ کلاس ذخیره نشد؛ اطلاعات قبلی حفظ شد");return;}
render();toast("✅ کلاس اضافه شد");}
function delClass(i){confirm2("این کلاس حذف شود؟",()=>{const d=Store.get();if(i<0||i>=d.classes.length)return;const removed=d.classes.splice(i,1)[0];if(Store.save()===false){d.classes.splice(i,0,removed);render();toast("⚠️ حذف کلاس ذخیره نشد؛ کلاس حفظ شد");return;}render();});}
function setColor(c){const d=Store.get(),previous=d.settings.color;if(previous===c)return;d.settings.color=c;if(Store.save()===false){if(previous===undefined)delete d.settings.color;else d.settings.color=previous;applyColor();toast("⚠️ رنگ‌بندی ذخیره نشد؛ انتخاب قبلی حفظ شد");return;}applyColor();render();}
function toggleSound(){const d=Store.get(),previous=d.settings.sound;d.settings.sound=!d.settings.sound;if(Store.save()===false){if(previous===undefined)delete d.settings.sound;else d.settings.sound=previous;toast("⚠️ تنظیم صدا ذخیره نشد؛ مقدار قبلی حفظ شد");return;}render();}
function theme(){return Store.get().settings.theme||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");}
function applyTheme(){const t=theme();document.body.classList.toggle("dark",t==="dark");
document.querySelector('meta[name="theme-color"]').setAttribute("content",t==="dark"?"#0b1220":"#f4f7fe");
const b=document.getElementById("themeBtn");if(b)b.textContent=t==="light"?"☀️":"🌙";}
function applyColor(){const c=Store.get().settings.color||"blue";
document.body.classList.remove("c-teal","c-purple","c-warm");
if(c!=="blue")document.body.classList.add("c-"+c);}
function toggleTheme(){setTheme(theme()==="light"?"dark":"light");}
function setTheme(t){const d=Store.get(),previous=d.settings.theme;if(previous===t)return;d.settings.theme=t;if(Store.save()===false){if(previous===undefined)delete d.settings.theme;else d.settings.theme=previous;applyTheme();toast("⚠️ پوسته ذخیره نشد؛ انتخاب قبلی حفظ شد");return;}applyTheme();render();}
function setFS(f){const d=Store.get(),previous=d.settings.fs;if(previous===f)return;d.settings.fs=f;if(Store.save()===false){if(previous===undefined)delete d.settings.fs;else d.settings.fs=previous;applyFS();toast("⚠️ اندازه نوشته ذخیره نشد؛ مقدار قبلی حفظ شد");return;}applyFS();render();}
function applyFS(){document.documentElement.style.setProperty("--fs",{s:"13px",m:"15px",l:"17px"}[Store.get().settings.fs||"m"]);}
function backup(){if(!requirePerm("backup","فقط مدیر می‌تواند پشتیبان بگیرد"))return;try{markBackupDone();}catch(e){}logActivity("تهیه پشتیبان");const t=Jalali.today();
const a=document.createElement("a"),url=URL.createObjectURL(new Blob([JSON.stringify(Store.get())],{type:"application/json"}));a.href=url;
a.download="My-Class-Track-Backup-"+t.jy+"-"+String(t.jm).padStart(2,"0")+"-"+String(t.jd).padStart(2,"0")+".json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("✅ پشتیبان گرفته شد");}
function shareBackup(){if(!requirePerm("backup","فقط مدیر می‌تواند پشتیبان بگیرد"))return;const j=JSON.stringify(Store.get());
const file=new File([j],"My-Class-Track-data.json",{type:"application/json"});
if(navigator.canShare&&navigator.canShare({files:[file]}))
navigator.share({files:[file],title:"پشتیبان My-Class-Track"}).then(()=>toast("✅ درخواست اشتراک‌گذاری باز شد")).catch(()=>toast("⚠️ اشتراک‌گذاری لغو شد یا در دسترس نیست"));
else{toast("📤 ارسال فایل پشتیبان");backup();}}
function restore(inp){
 const f=inp&&inp.files&&inp.files[0];
 if(!f)return;
 if(f.size===0){toast("⚠️ فایل پشتیبان خالی است");inp.value="";return;}
 const r=new FileReader();
 r.onerror=()=>{toast("⚠️ خواندن فایل ناموفق بود");inp.value="";};
 r.onload=()=>{
   let parsed;
   try{parsed=JSON.parse(r.result);}catch(e){toast("⚠️ فایل JSON معتبر نیست");inp.value="";return;}
   confirm2("بازیابی، داده‌های فعلی این برنامه را با اطلاعات فایل جایگزین می‌کند. قبل از ادامه مطمئن شوید از اطلاعات فعلی نسخه پشتیبان دارید. ادامه می‌دهید؟",()=>{
     try{
       Store.importObj(parsed);
       applyTheme();applyColor();applyFS();route="home";resetUI();render();
       toast("✅ بازیابی انجام شد");
     }catch(e){toast("⚠️ "+(e&&e.message?e.message:"بازیابی انجام نشد؛ داده فعلی حفظ شد"));}
     inp.value="";
   });
   if(inp)inp.value="";
 };
 r.readAsText(f);
}
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
function dlCSV(rows,name){const q=v=>{let s=String(v??"");if(typeof v==="string"&&/^[\u0000-\u0020]*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
const csv="\ufeff"+rows.map(r=>r.map(q).join(",")).join("\r\n");
const a=document.createElement("a"),url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.href=url;
a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("✅ فایل اکسل (CSV) دانلود شد");}
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
function importMembersCSV(inp){const f=inp&&inp.files&&inp.files[0];if(!f)return;
const r=new FileReader();r.onload=()=>{try{
const rows=parseCSV(String(r.result||""));if(rows.length<2){toast("⚠️ فایل خالی است");return;}
const normalizeHeader=v=>String(v||"").trim().replace(/[يى]/g,"ی").replace(/ك/g,"ک").replace(/[\s\u200c_\-]/g,"");
const headers=rows[0].map(normalizeHeader);
const findCol=names=>{for(const n of names){const i=headers.indexOf(normalizeHeader(n));if(i>=0)return i;}return -1;};
const hasHead=headers.includes(normalizeHeader("نام"));
const iName=hasHead?findCol(["نام"]):0;
const iPhone=hasHead?findCol(["تلفن‌ها","تلفن ها","تلفن","شماره تماس","شماره‌ها","شماره","موبایل"]):1;
const iBirth=hasHead?findCol(["تولد","تاریخ تولد"]):2;
const iRole=hasHead?findCol(["نقش‌ها","نقش ها","نقش"]):3;
const iGroup=hasHead?findCol(["گروه"]):-1;
const iNote=hasHead?findCol(["یادداشت عمومی","یادداشت","توضیحات"]):4;
const iNeeds=hasHead?findCol(["نیازها","نیاز"]):-1;
if(iName<0){toast("⚠️ ستون «نام» در فایل پیدا نشد");return;}
const normalizeName=v=>String(v||"").trim().replace(/[يى]/g,"ی").replace(/ك/g,"ک").replace(/\u200c/g,"").replace(/\s+/g," ").toLowerCase();
const d=Store.get(),existingNames=new Set((d.members||[]).map(m=>normalizeName(m.name)));
const seenNames=new Set(existingNames),candidates=[];let skip=0,sharedPhoneCount=0;
const phoneOwners=new Map();
(d.members||[]).forEach(m=>(m.phones||[]).forEach(p=>{const key=canonicalPhone(p);if(key)phoneOwners.set(key,(phoneOwners.get(key)||0)+1);}));
for(let i=hasHead?1:0;i<rows.length;i++){
 const row=rows[i],name=(row[iName]||"").trim();
 if(!name)continue;
 const nameKey=normalizeName(name);
 if(seenNames.has(nameKey)){skip++;continue;}
 const phones=iPhone>=0?(row[iPhone]||"").split(/[\/؛;|]/).map(x=>x.trim()).filter(Boolean):[];
 for(const p of phones){if(!validPhone(p)){toast("⚠️ شماره تماس ردیف "+Jalali.toFa(i+1)+" معتبر نیست؛ هیچ عضوی وارد نشد");return;}}
 const phoneKeys=phones.map(canonicalPhone).filter(Boolean);
 if(new Set(phoneKeys).size!==phoneKeys.length){toast("⚠️ در ردیف "+Jalali.toFa(i+1)+" یک شماره تکراری است؛ هیچ عضوی وارد نشد");return;}
 let birth=null;
 const bs=iBirth>=0?latinPhoneDigits((row[iBirth]||"").trim()):"";
 if(bs){
  const bm=bs.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if(!bm||+bm[2]<1||+bm[2]>12||+bm[3]<1||+bm[3]>31){toast("⚠️ تاریخ تولد ردیف "+Jalali.toFa(i+1)+" معتبر نیست؛ هیچ عضوی وارد نشد");return;}
  birth={jy:+bm[1],jm:+bm[2],jd:+bm[3]};
 }
 for(const key of phoneKeys){if(phoneOwners.has(key))sharedPhoneCount++;phoneOwners.set(key,(phoneOwners.get(key)||0)+1);}
 const splitList=value=>String(value||"").split(/[|؛;]/).map(x=>x.trim()).filter(Boolean);
 candidates.push({id:Store.uid(),name,phones,birth,
  roles:iRole>=0?splitList(row[iRole]):[],
  group:iGroup>=0&&String(row[iGroup]||"").trim()?String(row[iGroup]).trim():"عمومی",
  note:iNote>=0?String(row[iNote]||"").trim():"",
  needs:iNeeds>=0?splitList(row[iNeeds]):[]});
 seenNames.add(nameKey);
}
if(!candidates.length){toast("ℹ️ عضو جدیدی برای افزودن پیدا نشد"+(skip?"؛ نام‌های تکراری رد شدند":""));return;}
const commit=()=>{const oldGroups=Array.isArray(d.groups)?d.groups.slice():["عمومی"];if(!Array.isArray(d.groups))d.groups=["عمومی"];candidates.forEach(m=>{if(m.group&&!d.groups.includes(m.group))d.groups.push(m.group);});d.members.push(...candidates);const saved=Store.save();if(saved===false){d.members.splice(d.members.length-candidates.length,candidates.length);d.groups=oldGroups;return;}render();toast("✅ "+Jalali.toFa(candidates.length)+" عضو اضافه شد"+(skip?" — "+Jalali.toFa(skip)+" نام تکراری رد شد":""));};
if(sharedPhoneCount){confirm2("در "+Jalali.toFa(sharedPhoneCount)+" مورد، شماره تماس بین اعضا مشترک است. اگر عمدی است، واردکردن اعضا را ادامه دهید؟",commit);return;}
commit();
}catch(e){console.error("MCT CSV import:",e);toast("⚠️ خواندن فایل ناموفق بود؛ قالب و ستون‌های فایل را بررسی کنید");}finally{inp.value="";}};
r.readAsText(f);
}window.exportMembersCSV=exportMembersCSV;window.importMembersCSV=importMembersCSV;

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
