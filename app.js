/**
 * MCT App — روتینگ، دسترسی، قابلیت‌ها، bootstrap (v21)
 * بارگذاری آخر
 */
"use strict";

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
recordVoice(res=>{d.sessions[key]=d.sessions[key]||{};
const c=d.sessions[key][mid]=d.sessions[key][mid]||{};
if(res)c[af]=res;else delete c[af];Store.save();render();},cur[af]);return;}
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
const ROLE_LABEL={admin:"مدیر",support:"حامی",follow:"پیگیر",view:"مشاهده‌گر"};
const ROLE_PERMS={
  admin:  {home:1,attend:1,fees:1,members:1,homework:1,settings:1,help:1,more:1,reports:1,privateNotes:1,delete:1,backup:1,report:1,shareSupport:1,edit:1},
  support:{home:1,attend:1,fees:0,members:1,homework:1,settings:0,help:1,more:1,reports:1,privateNotes:0,delete:0,backup:0,report:1,shareSupport:1,edit:0},
  follow: {home:1,attend:1,fees:1,members:1,homework:1,settings:0,help:1,more:1,reports:1,privateNotes:0,delete:0,backup:0,report:1,shareSupport:1,edit:1},
  view:   {home:1,attend:1,fees:0,members:1,homework:1,settings:0,help:1,more:1,reports:1,privateNotes:0,delete:0,backup:0,report:1,shareSupport:0,edit:0}
};

/* ============ v9: گردش‌کار گروه درمانی ============ */
function periodPeople(role){
  const d=Store.get();const p=d.period||{};
  const ids=role==="attend"?p.attendIds:role==="fee"?p.feeIds:role==="hw"?p.hwIds:[];
  return (ids||[]).map(id=>d.members.find(m=>m.id===id)).filter(Boolean);
}
function periodSummaryHTML(){
  const d=Store.get();const p=d.period||{title:"دوره جاری"};
  const fmt=ids=>{
    const names=(ids||[]).map(id=>{const m=d.members.find(x=>x.id===id);return m?m.name:null;}).filter(Boolean);
    return names.length?names.map(esc).join("، "):"— هنوز تعیین نشده";
  };
  const hamis=d.members.filter(m=>(m.roles||[]).includes("support"));
  let h='<div class="card period-card fade-up"><h3>📋 '+(esc(p.title||"دوره جاری"))+'</h3>';
  h+='<div class="hami-tip">🤝 <b>حامی‌ها</b> اعضای قدیمی‌اند که قبلاً مسئول بوده‌اند و الان پشتیبان مسئولان جدید و رابط اعضا با درمانگر هستند. گزارش‌ها برای آن‌هاست.</div>';
  h+='<p class="role-assign"><b>پیگیری حضور:</b> '+fmt(p.attendIds)+'</p>';
  h+='<p class="role-assign"><b>شهریه:</b> '+fmt(p.feeIds)+'</p>';
  h+='<p class="role-assign"><b>تکالیف:</b> '+fmt(p.hwIds)+'</p>';
  if(hamis.length)h+='<p class="role-assign"><b>حامی‌های این کلاس:</b> '+hamis.map(m=>esc(m.name)).join("، ")+'</p>';
  if(p.note)h+='<p class="stat-line">'+esc(p.note)+'</p>';
  if(can("settings"))h+='<button class="btn sm ghost" style="margin-top:6px" onclick="periodForm()">✏️ تنظیم دوره و مسئولان</button>';
  h+='</div>';
  return h;
}
function periodForm(){
  if(!requirePerm("settings","فقط مدیر/درمانگر دوره را تنظیم می‌کند"))return;
  const d=Store.get();const p=d.period||{title:"دوره جاری",attendIds:[],feeIds:[],hwIds:[],note:""};
  const opts=(selected)=>{
    selected=selected||[];
    return d.members.map(m=>'<option value="'+m.id+'" '+(selected.includes(m.id)?"selected":"")+'>'+esc(m.name)+'</option>').join("");
  };
  const o=modal('<h3 style="font-weight:800">📋 دوره و مسئولان</h3>'+
    '<div class="hami-tip">با نظر درمانگر در هر دوره مسئولان عوض می‌شوند. حامی‌ها همان اعضای قدیمی با نقش «حامی» در پروفایل‌اند.</div>'+
    '<label>عنوان دوره</label><input id="perTitle" value="'+esc(p.title||"")+'" placeholder="مثلاً دوره بهار ۱۴۰۵">'+
    '<label>مسئولان پیگیری حضور (می‌توانید چند نفر)</label><select id="perAtt" multiple size="4" style="min-height:90px">'+opts(p.attendIds)+'</select>'+
    '<label>مسئولان شهریه</label><select id="perFee" multiple size="4" style="min-height:90px">'+opts(p.feeIds)+'</select>'+
    '<label>مسئول تکالیف</label><select id="perHw" multiple size="3" style="min-height:70px">'+opts(p.hwIds)+'</select>'+
    '<label>یادداشت دوره</label><input id="perNote" value="'+esc(p.note||"")+'" placeholder="اختیاری">'+
    '<div class="row" style="margin-top:12px"><button class="btn p" style="flex:1" id="perSave">💾 ذخیره</button><button class="btn ghost" id="perCl">انصراف</button></div>');
  $("#perCl",o).onclick=()=>o.remove();
  $("#perSave",o).onclick=()=>{
    const pick=id=>[...o.querySelectorAll("#"+id+" option:checked")].map(x=>x.value);
    d.period={title:($("#perTitle",o).value||"دوره جاری").trim(),attendIds:pick("perAtt"),feeIds:pick("perFee"),hwIds:pick("perHw"),note:($("#perNote",o).value||"").trim()};
    // sync member roles lightly
    d.members.forEach(m=>{
      m.roles=m.roles||[];
      const set=(role,ids)=>{const on=ids.includes(m.id);if(on&&!m.roles.includes(role))m.roles.push(role);};
      set("attend",d.period.attendIds);set("fee",d.period.feeIds);set("hw",d.period.hwIds);
    });
    Store.save();o.remove();render();toast("✅ دوره ذخیره شد");
  };
}

/* گزارش نوبت مشخص به حامی‌ها */
function reportRoundToHami(ph){try{logActivity("گزارش نوبت "+ph+" به حامی");}catch(e){}
  if(!requirePerm("shareSupport","اجازه ارسال گزارش ندارید"))return;
  const d=Store.get();const key=sessionSel()||curKey();
  if(!key){toast("جلسه مشخص نیست");return;}
  const s=d.sessions[key]||{};
  const g={present:[],delay:[],absent:[],problem:[],none:[]};
  for(const m of d.members){
    const st=ph===2?((s[m.id]||{}).p2||(s[m.id]||{}).p1):(s[m.id]||{}).p1;
    (g[st||"none"]||g.none).push(m);
  }
  const roundName=ph===1?"نوبت ۱ — تماس قبلی (روز/ساعت‌های قبل)":"نوبت ۲ — پشت در کلاس";
  const lines=[];
  lines.push("🤝 گزارش به حامی‌ها");
  lines.push(d.settings.className||"کلاس");
  lines.push(roundName);
  lines.push("جلسه: "+Jalali.fmt(Jalali.fromKey(key)));
  lines.push("");
  const block=(title,arr,icon)=>{
    if(!arr.length)return;
    lines.push(icon+" "+title+" ("+Jalali.toFa(arr.length)+"):");
    arr.forEach(m=>{
      const ex=s[m.id]||{};
      let t="• "+m.name;
      if(ex.time||ex.time2)t+=" (حدود "+Jalali.toFa(ex.time2||ex.time)+")";
      if(ph===1&&ex.note)t+=" — "+ex.note;
      if(ph===2&&ex.note2)t+=" — "+ex.note2;
      lines.push(t);
    });
    lines.push("");
  };
  block("حاضر",g.present,"✅");
  block("تأخیر",g.delay,"⏰");
  block("بدون حضور",g.absent,"📭");
  block("مشکل / نیاز هماهنگی",g.problem,"💬");
  block("هنوز ثبت‌نشده",g.none,"—");
  lines.push("— برای حامی‌ها (اعضای قدیمی پشتیبان) — بدون یادداشت محرمانه —");
  const txt=lines.join("\n");
  const o=modal('<h3 style="font-weight:800">📤 گزارش '+esc(roundName)+'</h3>'+
    '<p class="role-hint">این متن برای حامی‌هاست: پشتیبان مسئولان جدید و رابط با درمانگر.</p>'+
    '<textarea id="rndRep" rows="12" readonly style="font-size:.88em">'+esc(txt)+'</textarea>'+
    '<div class="row" style="margin-top:10px"><button class="btn p" style="flex:1" id="rrCopy">📋 کپی</button><button class="btn g" style="flex:1" id="rrShare">📤 ارسال</button></div>');
  $("#rrCopy",o).onclick=()=>copyTxt(txt);
  $("#rrShare",o).onclick=()=>shareTxt(txt);
}

/* چک‌لیست در کلاس برای اعلام به درمانگر */
function doorKey(){const k=curKey()||sessionSel();return k||Jalali.toKey(Jalali.today());}
function doorState(){
  const d=Store.get();const k=doorKey();
  d.doorChecks=d.doorChecks||{};
  if(!d.doorChecks[k])d.doorChecks[k]={};
  return d.doorChecks[k];
}
function toggleDoorCheck(min){
  const d=Store.get();const st=doorState();
  st[String(min)]=!st[String(min)];
  Store.save();
  if(route==="entry")renderEntry();
  else render();
  if(st[String(min)]){
    const msg=min===3?"🚪 وقت باز کردن در کلاس":"📣 به درمانگر بگویید: "+min+" دقیقه تا شروع";
    toast(msg);
  }
}
function doorChecklistHTML(){
  const st=doorState();
  const items=[[15,"به درمانگر بگویید: ۱۵ دقیقه مانده"],[8,"به درمانگر بگویید: ۸ دقیقه مانده"],[5,"به درمانگر بگویید: ۵ دقیقه مانده"],[3,"🚪 در کلاس را باز کنید"]];
  let h='<div class="card"><h3>🚪 یادآور پشت در (برای درمانگر)</h3>';
  h+='<p class="stat-line">در ۴ نوبت زمان باقی‌مانده را اعلام کنید؛ در ۳ دقیقه در را باز کنید.</p><div class="door-check">';
  items.forEach(([min,act])=>{
    const done=!!st[String(min)];
    h+='<div class="door-item'+(done?" done":"")+'"><span class="min">'+Jalali.toFa(min)+"'</span><span class=\"act\">"+act+'</span>';
    h+='<button class="btn sm '+(done?"ghost":"p")+'" onclick="toggleDoorCheck('+min+')">'+(done?"✓":"ثبت")+'</button></div>';
  });
  h+='</div></div>';
  return h;
}

/* مهلت شهریه: یک روز قبل از کلاس */
function feeDeadlineInfo(){
  const d=Store.get();const days=d.settings.feeDeadlineDays!=null?d.settings.feeDeadlineDays:1;
  const nc=nextClass();
  if(!nc)return{ok:true,text:"کلاسی تنظیم نشده",overdue:[],days};
  const deadline=new Date(nc.t.getTime()-days*864e5);
  const now=new Date();
  const key=Jalali.toKey(nc.date);
  const f=d.fees[key]||{};
  const overdue=d.members.filter(m=>!(f[m.id]&&f[m.id].paid));
  const past=now>=deadline;
  return{ok:!past||!overdue.length,past,deadline,nc,key,overdue,days,text:past?("مهلت واریز گذشته — "+Jalali.toFa(overdue.length)+" نفر هنوز واریز نکرده‌اند"):("مهلت واریز: تا "+Jalali.fmt(Jalali.toJ(deadline.getFullYear(),deadline.getMonth()+1,deadline.getDate()))+" (یک روز قبل از کلاس)")};
}
function reportFeesToHami(){
  if(!requirePerm("shareSupport"))return;
  const info=feeDeadlineInfo();
  const d=Store.get();
  const lines=[];
  lines.push("💰 گزارش شهریه برای حامی‌ها");
  lines.push(d.settings.className||"کلاس");
  if(info.key)lines.push("جلسه: "+Jalali.fmt(Jalali.fromKey(info.key)));
  lines.push(info.text);
  lines.push("");
  const f=info.key?(d.fees[info.key]||{}):{};
  const paid=[],unpaid=[];
  d.members.forEach(m=>{(f[m.id]&&f[m.id].paid?paid:unpaid).push(m);});
  if(paid.length){lines.push("✅ واریز شده ("+Jalali.toFa(paid.length)+"):");paid.forEach(m=>lines.push("• "+m.name));lines.push("");}
  if(unpaid.length){lines.push("⏳ هنوز واریز نشده ("+Jalali.toFa(unpaid.length)+"):");unpaid.forEach(m=>lines.push("• "+m.name));lines.push("");}
  lines.push("— مسئولان شهریه این دوره می‌توانند اکسل را جدا خروجی بگیرند —");
  const txt=lines.join("\n");
  const o=modal('<h3 style="font-weight:800">📤 گزارش شهریه به حامی‌ها</h3><textarea rows="12" readonly id="feeHami">'+esc(txt)+'</textarea><div class="row" style="margin-top:10px"><button class="btn p" style="flex:1" id="fhC">📋 کپی</button><button class="btn g" style="flex:1" id="fhS">📤 ارسال</button></div>');
  $("#fhC",o).onclick=()=>copyTxt(txt);$("#fhS",o).onclick=()=>shareTxt(txt);
}



/* ============ v12: قابلیت‌های جدید ============ */
const DEFAULT_TEMPLATES={
  attend:"سلام {name}، یادآوری کلاس {class} در {date} ساعت {time}. لطفاً تأیید حضور بدهید. ممنون 🙏",
  fee:"سلام {name}، یادآوری واریز شهریه کلاس {class} تا قبل از {date}. پس از واریز فیش را ارسال کنید. سپاس",
  hami:"گزارش برای حامی‌ها — {class} — {date}\nجزئیات در پیام بعدی."
};
function getTemplates(){
  const d=Store.get();
  return Object.assign({},DEFAULT_TEMPLATES,(d.settings&&d.settings.msgTemplates)||{});
}
function fillTpl(tpl,vars){
  let s=tpl||"";
  Object.keys(vars||{}).forEach(k=>{s=s.split("{"+k+"}").join(vars[k]==null?"":String(vars[k]));});
  return s;
}
function logActivity(text){
  try{
    const d=Store.get();
    d.activityLog=d.activityLog||[];
    const u=currentUser();
    d.activityLog.unshift({t:Date.now(),by:u?u.name:"—",text:String(text).slice(0,120)});
    if(d.activityLog.length>80)d.activityLog=d.activityLog.slice(0,80);
    Store.save();
  }catch(e){}
}
function sessionCompareHTML(){
  const d=Store.get();
  const keys=Object.keys(d.sessions||{}).sort().reverse();
  if(keys.length<1)return"";
  const calc=key=>{
    const s=d.sessions[key]||{};
    let p=0,a=0,n=d.members.length||1;
    d.members.forEach(m=>{
      const st=(s[m.id]||{}).p2||(s[m.id]||{}).p1;
      if(st==="present"||st==="delay")p++;
      else if(st==="absent"||st==="problem")a++;
    });
    return{key,pct:Math.round(p/n*100),p,a};
  };
  const cur=calc(keys[0]);
  const prev=keys[1]?calc(keys[1]):null;
  let h='<div class="card fade-up"><h3>📊 مقایسه جلسات</h3><div class="compare-grid">';
  h+='<div class="box"><div class="stat-line">آخرین جلسه</div><div class="n">'+Jalali.toFa(cur.pct)+'٪</div><div class="stat-line">'+Jalali.fmt(Jalali.fromKey(cur.key))+'</div></div>';
  if(prev)h+='<div class="box"><div class="stat-line">جلسه قبل</div><div class="n">'+Jalali.toFa(prev.pct)+'٪</div><div class="stat-line">'+(cur.pct-prev.pct>=0?"+":"")+Jalali.toFa(cur.pct-prev.pct)+'٪ نسبت به قبل</div></div>';
  else h+='<div class="box"><div class="stat-line">جلسه قبل</div><div class="n">—</div></div>';
  h+='</div></div>';
  return h;
}
function backupReminderHTML(){
  const d=Store.get();
  const last=d.settings.lastBackupAt;
  const week=7*864e5;
  if(last&&(Date.now()-last)<week)return"";
  return'<div class="backup-banner noprint">💾 بیش از یک هفته از آخرین پشتیبان گذشته (یا هنوز نگرفته‌اید). از تنظیمات پشتیبان بگیرید تا داده از دست نرود. <button class="btn sm ghost" onclick="backup()">⬇️ پشتیبان الان</button></div>';
}
function activityHTML(){
  const d=Store.get();
  const log=(d.activityLog||[]).slice(0,6);
  if(!log.length)return"";
  let h='<div class="card noprint"><h3>📝 فعالیت‌های اخیر</h3>';
  log.forEach(a=>{
    const dt=new Date(a.t);
    const t=Jalali.toFa(dt.getHours())+":"+Jalali.toFa(String(dt.getMinutes()).padStart(2,"0"));
    h+='<div class="activity-item"><b>'+esc(a.by)+'</b> — '+esc(a.text)+' <span class="shortcut-hint">'+t+'</span></div>';
  });
  h+='</div>';
  return h;
}
function onlineBadgeHTML(){
  const on=navigator.onLine;
  return'<span class="online-dot'+(on?"":" off")+'" title="'+(on?"آنلاین":"آفلاین")+'"></span>'+(on?"آنلاین":"آفلاین");
}
function waMsg(phone,text){
  if(!phone){toast("شماره ندارد");return;}
  const url=waLink(phone);
  const base=url.split("?")[0];
  const full=base+"?text="+encodeURIComponent(text||"");
  window.open(full,"_blank");
}
function remindUnpaidWA(){
  if(!requirePerm("fees"))return;
  const info=feeDeadlineInfo();
  const d=Store.get();
  const f=info.key?(d.fees[info.key]||{}):{};
  const unpaid=d.members.filter(m=>!(f[m.id]&&f[m.id].paid)&&(m.phones||[])[0]);
  if(!unpaid.length){toast("همه پرداخت کرده‌اند یا شماره ندارند");return;}
  const tpl=getTemplates().fee;
  const nc=nextClass();
  const vars={class:d.settings.className||"کلاس",date:nc?Jalali.fmt(nc.date):"",time:nc?nc.c.start:""};
  // open first; show list modal for rest
  const o=modal('<h3 style="font-weight:800">📤 یادآوری شهریه واتساپ</h3><p class="role-hint">برای هر نفر پیام آماده با الگوی پیش‌فرض باز می‌شود.</p>'+
    unpaid.map(m=>'<div class="mem"><b>'+esc(m.name)+'</b><button class="btn sm g" style="margin-right:auto" data-wa="'+esc((m.phones||[])[0])+'" data-name="'+esc(m.name)+'">واتساپ</button></div>').join("")+
    '<button class="btn ghost" style="width:100%;margin-top:8px" id="waCl">بستن</button>');
  $("#waCl",o).onclick=()=>o.remove();
  o.querySelectorAll("[data-wa]").forEach(b=>{
    b.onclick=()=>{
      const msg=fillTpl(tpl,Object.assign({},vars,{name:b.getAttribute("data-name")}));
      waMsg(b.getAttribute("data-wa"),msg);
      logActivity("یادآوری شهریه واتساپ: "+b.getAttribute("data-name"));
    };
  });
}
function attendRemindWA(){
  if(!requirePerm("attend"))return;
  const d=Store.get();const key=sessionSel()||curKey();
  if(!key){toast("جلسه مشخص نیست");return;}
  const s=d.sessions[key]||{};
  const need=d.members.filter(m=>{
    const st=(s[m.id]||{}).p1;
    return !st&&(m.phones||[])[0];
  });
  if(!need.length){toast("مورد ثبت‌نشده با شماره نیست");return;}
  const tpl=getTemplates().attend;
  const nc=nextClass();
  const vars={class:d.settings.className||"کلاس",date:Jalali.fmt(Jalali.fromKey(key)),time:nc?nc.c.start:""};
  const o=modal('<h3 style="font-weight:800">📞 پیامک/واتساپ یادآوری حضور</h3>'+
    need.map(m=>'<div class="mem"><b>'+esc(m.name)+'</b><button class="btn sm g" style="margin-right:auto" data-wa="'+esc((m.phones||[])[0])+'" data-name="'+esc(m.name)+'">واتساپ</button></div>').join("")+
    '<button class="btn ghost" style="width:100%;margin-top:8px" id="waCl2">بستن</button>');
  $("#waCl2",o).onclick=()=>o.remove();
  o.querySelectorAll("[data-wa]").forEach(b=>{
    b.onclick=()=>{
      waMsg(b.getAttribute("data-wa"),fillTpl(tpl,Object.assign({},vars,{name:b.getAttribute("data-name")})));
      logActivity("یادآوری حضور: "+b.getAttribute("data-name"));
    };
  });
}
function editTemplates(){
  if(!requirePerm("settings"))return;
  const t=getTemplates();
  const o=modal('<h3 style="font-weight:800">📝 الگوهای پیام</h3><p class="role-hint">متغیرها: {name} {class} {date} {time}</p>'+
    '<label>یادآوری حضور</label><textarea id="tplA" rows="3">'+esc(t.attend)+'</textarea>'+
    '<label>یادآوری شهریه</label><textarea id="tplF" rows="3">'+esc(t.fee)+'</textarea>'+
    '<label>سربرگ گزارش حامی</label><textarea id="tplH" rows="2">'+esc(t.hami)+'</textarea>'+
    '<div class="row" style="margin-top:10px"><button class="btn p" style="flex:1" id="tplS">💾 ذخیره</button><button class="btn ghost" id="tplC">انصراف</button></div>');
  $("#tplC",o).onclick=()=>o.remove();
  $("#tplS",o).onclick=()=>{
    const d=Store.get();
    d.settings.msgTemplates={attend:$("#tplA",o).value,fee:$("#tplF",o).value,hami:$("#tplH",o).value};
    Store.save();o.remove();toast("✅ الگوها ذخیره شد");logActivity("ویرایش الگوهای پیام");
  };
}
function toggleAutoTheme(){
  const d=Store.get();
  d.settings.autoTheme=!d.settings.autoTheme;
  Store.save();
  applyAutoTheme();
  toast(d.settings.autoTheme?"تم خودکار روشن شد":"تم خودکار خاموش شد");
  render();
}
function applyAutoTheme(){
  const d=Store.get();
  if(!d.settings.autoTheme)return;
  const h=new Date().getHours();
  const dark=h>=19||h<7;
  if((document.body.classList.contains("dark"))!==dark){
    d.settings.theme=dark?"dark":"light";
    Store.save();
  }
}
// Keyboard shortcuts desktop
function bindShortcuts(){
  if(window._mctKeys)return;
  window._mctKeys=true;
  document.addEventListener("keydown",e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openCommandPalette();return;}
    if(e.target&&(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.target.tagName==="SELECT"))return;
    if(e.altKey||e.ctrlKey||e.metaKey)return;
    const map={h:"home",a:"attend",f:"fees",m:"members",w:"homework",s:"settings",g:"help",o:"more",r:"reports"};
    const k=e.key.toLowerCase();
    if(map[k]&&route!=="login"&&route!=="entry"){e.preventDefault();go(map[k]);}
    if(k==="?"||k==="/"){e.preventDefault();go("help");}
  });
}
function markBackupDone(){
  const d=Store.get();d.settings.lastBackupAt=Date.now();Store.save();
}


/* ============ v13: انسان‌محور + شبکه اجتماعی + هوشمند ============ */
function presenceStreak(id){
  const d=Store.get();
  const keys=Object.keys(d.sessions||{}).sort().reverse();
  let s=0;
  for(const k of keys){
    const st=(d.sessions[k][id]||{}).p2||(d.sessions[k][id]||{}).p1;
    if(st==="present"||st==="delay")s++;
    else break;
  }
  return s;
}
function streakBadge(id){
  const n=presenceStreak(id);
  if(n<3)return"";
  return'<span class="streak" title="حضور پیاپی">🔥 '+Jalali.toFa(n)+'</span>';
}
function smartNextActionHTML(){
  const d=Store.get();
  const nc=nextClass();
  const key=curKey()||sessionSel();
  const s=key?(d.sessions[key]||{}):{};
  const f=key?(d.fees[key]||{}):{};
  const un1=d.members.filter(m=>!(s[m.id]||{}).p1).length;
  const un2=d.members.filter(m=>!(s[m.id]||{}).p2).length;
  const unp=d.members.filter(m=>!(f[m.id]&&f[m.id].paid)).length;
  let title="پیشنهاد هوشمند",body="",act="";
  const now=Date.now();
  const msToClass=nc?nc.t-now:null;
  if(msToClass!=null&&msToClass>0&&msToClass<45*6e4){
    title="الان وقت نوبت ۲ است";
    body="کمتر از ۴۵ دقیقه تا کلاس — پشت در تماس بگیرید و چک‌لیست درمانگر را بزنید.";
    act='<button class="btn sm p" onclick="openEntry()">🚪 نوبت ۲</button>';
  }else if(un1>0&&(msToClass==null||msToClass>2*36e5)){
    title="نوبت ۱ ناتمام";
    body=Jalali.toFa(un1)+" نفر هنوز در تماس قبلی ثبت نشده‌اند.";
    act='<button class="btn sm p" onclick="go(\'attend\')">📞 ادامه نوبت ۱</button> <button class="btn sm ghost" onclick="attendRemindWA()">💬 واتساپ</button>';
  }else if(unp>0){
    title="پیگیری شهریه";
    body=Jalali.toFa(unp)+" نفر هنوز واریز نکرده‌اند.";
    act='<button class="btn sm p" onclick="go(\'fees\')">💰 شهریه</button> <button class="btn sm ghost" onclick="remindUnpaidWA()">💚 یادآوری</button>';
  }else if(un2>0&&msToClass!=null&&msToClass<864e5){
    title="آماده‌سازی نوبت ۲";
    body="نوبت ۱ خوب پیش رفته؛ برای پشت در آماده شوید.";
    act='<button class="btn sm p" onclick="openEntry()">ورود به نوبت ۲</button>';
  }else{
    title="وضعیت پایدار";
    body="کار فوری نیست. می‌توانید گزارش به حامی‌ها یا پشتیبان بگیرید.";
    act='<button class="btn sm ghost" onclick="reportRoundToHami(1)">📤 گزارش</button> <button class="btn sm ghost" onclick="backup()">💾 پشتیبان</button>';
  }
  return'<div class="next-action fade-up noprint"><div class="na-title">✨ '+title+'</div><div style="font-size:.88em;margin-bottom:8px">'+body+'</div><div class="row" style="flex-wrap:wrap;gap:6px">'+act+'</div></div>';
}
function celebrateConfetti(){
  const c=document.createElement("div");c.className="celebrate";
  const colors=["#2563eb","#10b981","#f59e0b","#ec4899","#8b5cf6","#38bdf8"];
  for(let i=0;i<40;i++){
    const p=document.createElement("i");
    p.style.left=Math.random()*100+"%";
    p.style.background=colors[i%colors.length];
    p.style.animationDelay=(Math.random()*0.8)+"s";
    p.style.width=(6+Math.random()*8)+"px";
    p.style.height=(6+Math.random()*8)+"px";
    c.appendChild(p);
  }
  document.body.appendChild(c);
  setTimeout(()=>c.remove(),2800);
  try{navigator.vibrate&&navigator.vibrate([40,30,40,30,80]);}catch(e){}
}
function checkSessionComplete(){
  const d=Store.get();const key=sessionSel()||curKey();
  if(!key||!d.members.length)return;
  const s=d.sessions[key]||{};
  const all=d.members.every(m=>(s[m.id]||{}).p1||(s[m.id]||{}).p2);
  if(all){celebrateConfetti();toast("🎉 همه ثبت شدند — عالی بود!");logActivity("تکمیل ثبت حضور جلسه");}
}
function tgShare(text){
  const url="https://t.me/share/url?url=&text="+encodeURIComponent(text);
  window.open(url,"_blank");
}
function shareNative(text,title){
  if(navigator.share){
    navigator.share({title:title||"MCT",text:text}).catch(()=>{});
  }else{
    copyTxt(text);
  }
}
function buildStoryCard(kind){
  // kind: attend | fees
  const d=Store.get();
  const key=sessionSel()||curKey();
  const canvas=document.createElement("canvas");
  canvas.width=1080;canvas.height=1920;
  const ctx=canvas.getContext("2d");
  // gradient bg
  const g=ctx.createLinearGradient(0,0,0,1920);
  g.addColorStop(0,"#1d4ed8");g.addColorStop(0.5,"#2563eb");g.addColorStop(1,"#0ea5e9");
  ctx.fillStyle=g;ctx.fillRect(0,0,1080,1920);
  // soft circles
  ctx.fillStyle="rgba(255,255,255,.06)";
  ctx.beginPath();ctx.arc(200,400,300,0,6.3);ctx.fill();
  ctx.beginPath();ctx.arc(900,1400,400,0,6.3);ctx.fill();
  ctx.fillStyle="#fff";
  ctx.textAlign="center";
  ctx.font="bold 54px Tahoma,sans-serif";
  ctx.fillText(d.settings.className||"کلاس",540,280);
  ctx.font="32px Tahoma,sans-serif";
  ctx.fillStyle="rgba(255,255,255,.85)";
  const dateStr=key?Jalali.fmt(Jalali.fromKey(key)):Jalali.fmt(Jalali.today());
  ctx.fillText(dateStr,540,360);
  let title="گزارش حضور", lines=[];
  if(kind==="fees"){
    title="گزارش شهریه";
    const f=key?(d.fees[key]||{}):{};
    const paid=d.members.filter(m=>f[m.id]&&f[m.id].paid).length;
    const un=d.members.length-paid;
    lines=["پرداخت‌شده: "+paid, "باقی‌مانده: "+un, "کل اعضا: "+d.members.length];
  }else{
    const s=key?(d.sessions[key]||{}):{};
    let p=0,del=0,ab=0,pr=0;
    d.members.forEach(m=>{
      const st=(s[m.id]||{}).p2||(s[m.id]||{}).p1;
      if(st==="present")p++;else if(st==="delay")del++;else if(st==="absent")ab++;else if(st==="problem")pr++;
    });
    lines=["حاضر: "+p,"تأخیر: "+del,"بدون حضور: "+ab,"نیاز هماهنگی: "+pr];
  }
  ctx.font="bold 64px Tahoma,sans-serif";
  ctx.fillStyle="#fff";
  ctx.fillText(title,540,520);
  ctx.font="bold 48px Tahoma,sans-serif";
  lines.forEach((ln,i)=>{
    ctx.fillStyle="rgba(255,255,255,.95)";
    ctx.fillText(ln,540,680+i*100);
  });
  ctx.font="28px Tahoma,sans-serif";
  ctx.fillStyle="rgba(255,255,255,.7)";
  ctx.fillText("My-Class-Track · برای حامی‌ها",540,1750);
  ctx.fillText("با احترام و حفظ حریم اعضا",540,1800);
  return canvas;
}
function shareStoryCard(kind){
  kind=kind||"attend";
  const canvas=buildStoryCard(kind);
  const o=modal('<h3 style="font-weight:800">📸 کارت استوری</h3><p class="role-hint">برای وضعیت واتساپ، تلگرام یا اینستاگرام — بدون جزئیات محرمانه.</p><div class="story-preview"><canvas id="storyCv" width="1080" height="1920" style="width:100%"></canvas></div>'+
    '<div class="share-grid" style="margin-top:10px">'+
    '<button class="btn p" id="stDl">⬇️ دانلود تصویر</button>'+
    '<button class="btn g" id="stWa">واتساپ</button>'+
    '<button class="btn ghost" id="stTg">تلگرام</button>'+
    '<button class="btn ghost" id="stSh">اشتراک</button></div>');
  const cv=$("#storyCv",o);
  cv.getContext("2d").drawImage(canvas,0,0);
  const blobP=new Promise(res=>canvas.toBlob(res,"image/png"));
  $("#stDl",o).onclick=async()=>{
    const b=await blobP;const a=document.createElement("a");
    a.href=URL.createObjectURL(b);a.download="mct-story.png";a.click();
    logActivity("دانلود کارت استوری");
  };
  $("#stWa",o).onclick=()=>{
    // WhatsApp can't attach image via URL easily; download + tip
    toast("تصویر را دانلود کنید و در وضعیت واتساپ بگذارید");
    $("#stDl",o).click();
  };
  $("#stTg",o).onclick=()=>{toast("تصویر را دانلود و در تلگرام بفرستید");$("#stDl",o).click();};
  $("#stSh",o).onclick=async()=>{
    const b=await blobP;
    const file=new File([b],"mct-story.png",{type:"image/png"});
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      navigator.share({files:[file],title:"گزارش کلاس",text:"گزارش بدون جزئیات محرمانه"}).catch(()=>{});
    }else if(navigator.share){
      navigator.share({title:"گزارش کلاس",text:"کارت استوری را از اپ ذخیره کنید"}).catch(()=>{});
    }else toast("اشتراک فایل در این مرورگر پشتیبانی نمی‌شود — دانلود کنید");
  };
}
function humanHamiSummary(){
  const d=Store.get();const key=sessionSel()||curKey();
  if(!key){toast("جلسه نیست");return;}
  const s=d.sessions[key]||{};
  let p=0,del=0,ab=0,pr=0,none=0;
  d.members.forEach(m=>{
    const st=(s[m.id]||{}).p2||(s[m.id]||{}).p1;
    if(st==="present")p++;else if(st==="delay")del++;else if(st==="absent")ab++;else if(st==="problem")pr++;else none++;
  });
  const total=d.members.length||1;
  const pct=Math.round((p+del)/total*100);
  let tone="وضعیت کلی خوب است.";
  if(pct<60)tone="نیاز به پیگیری حمایتگرانه داریم.";
  else if(pct<80)tone="وضعیت قابل قبول است؛ چند نفر را نرم پیگیری کنیم.";
  const text=["🤝 خلاصه انسانی برای حامی‌ها",
    d.settings.className||"کلاس",
    "تاریخ: "+Jalali.fmt(Jalali.fromKey(key)),
    "",
    "حدود "+Jalali.toFa(pct)+"٪ اعضا حاضر یا با تأخیر هماهنگ شده‌اند.",
    tone,
    p?"حاضر: "+Jalali.toFa(p):"",
    del?"تأخیر: "+Jalali.toFa(del):"",
    ab?"بدون حضور: "+Jalali.toFa(ab):"",
    pr?"نیاز هماهنگی: "+Jalali.toFa(pr):"",
    none?"هنوز نامشخص: "+Jalali.toFa(none):"",
    "",
    "— بدون ذکر جزئیات محرمانه —"].filter(Boolean).join("\n");
  const o=modal('<h3 style="font-weight:800">🤝 خلاصه انسانی</h3><textarea rows="12" readonly id="humSum">'+esc(text)+'</textarea>'+
    '<div class="share-grid" style="margin-top:10px">'+
    '<button class="btn p" id="hsCopy">📋 کپی</button>'+
    '<button class="btn g" id="hsWa">واتساپ</button>'+
    '<button class="btn ghost" id="hsTg">تلگرام</button>'+
    '<button class="btn ghost" id="hsSh">اشتراک</button></div>');
  $("#hsCopy",o).onclick=()=>copyTxt(text);
  $("#hsWa",o).onclick=()=>window.open("https://wa.me/?text="+encodeURIComponent(text),"_blank");
  $("#hsTg",o).onclick=()=>tgShare(text);
  $("#hsSh",o).onclick=()=>shareNative(text,"خلاصه حامی");
  logActivity("خلاصه انسانی برای حامی");
}
function toggleFocusMode(){
  const d=Store.get();
  d.settings.focusMode=!d.settings.focusMode;
  Store.save();
  document.body.classList.toggle("focus-on",!!d.settings.focusMode);
  toast(d.settings.focusMode?"🎯 حالت تمرکز پشت در روشن":"حالت تمرکز خاموش");
  if(route==="entry")renderEntry(); else render();
}
function toggleA11y(){
  const d=Store.get();
  d.settings.a11y=!d.settings.a11y;
  Store.save();
  document.body.classList.toggle("a11y-on",!!d.settings.a11y);
  toast(d.settings.a11y?"دسترسی‌پذیری بیشتر فعال شد":"حالت عادی");
  render();
}
function applyA11yFocus(){
  const d=Store.get();
  document.body.classList.toggle("a11y-on",!!(d.settings&&d.settings.a11y));
  document.body.classList.toggle("focus-on",!!(d.settings&&d.settings.focusMode&&route==="entry"));
}


/* ============ v14: تقسیم وظایف ============ */
function assignMap(kind){
  const d=Store.get();
  d.assignments=d.assignments||{attend:{},fee:{}};
  if(!d.assignments[kind])d.assignments[kind]={};
  return d.assignments[kind];
}
function myAssigneeId(){
  const u=currentUser();
  if(!u)return null;
  const d=Store.get();
  if(u.memberId)return u.memberId;
  const m=d.members.find(x=>x.name===u.name);
  return m?m.id:("user:"+u.id);
}
function isMine(kind, memberId){
  const map=assignMap(kind);
  const aid=map[memberId];
  if(!aid)return true;
  return aid===myAssigneeId();
}
function assigneeName(kind, memberId){
  const map=assignMap(kind);
  const aid=map[memberId];
  if(!aid)return"";
  const d=Store.get();
  if(String(aid).indexOf("user:")===0){
    const uid=aid.slice(5);
    const u=(d.users||[]).find(x=>x.id===uid);
    return u?u.name:"";
  }
  const m=d.members.find(x=>x.id===aid);
  return m?m.name:"";
}
function periodLeadIds(kind){
  const d=Store.get();
  const p=d.period||{};
  let leadIds=kind==="fee"?(p.feeIds||[]).slice():(p.attendIds||[]).slice();
  if(!leadIds.length){
    const role=kind==="fee"?"fee":"attend";
    leadIds=d.members.filter(m=>(m.roles||[]).includes(role)).map(m=>m.id);
  }
  return leadIds;
}
function autoSplitTasks(kind){
  kind=kind||"attend";
  const d=Store.get();
  const leadIds=periodLeadIds(kind);
  if(leadIds.length<1){toast("اول مسئولان این دوره را در کارت دوره مشخص کنید");return;}
  const map=assignMap(kind);
  Object.keys(map).forEach(k=>delete map[k]);
  const members=d.members.slice().sort((a,b)=>String(a.name).localeCompare(String(b.name),"fa"));
  members.forEach((m,i)=>{map[m.id]=leadIds[i%leadIds.length];});
  Store.save();
  logActivity("تقسیم خودکار "+(kind==="fee"?"شهریه":"حضور"));
  toast("✅ تقسیم بین "+Jalali.toFa(leadIds.length)+" مسئول");
  render();
}
function clearSplit(kind){
  kind=kind||"attend";
  const d=Store.get();
  d.assignments=d.assignments||{attend:{},fee:{}};
  d.assignments[kind]={};
  Store.save();toast("تقسیم پاک شد");render();
}
function workloadHTML(kind){
  const d=Store.get();
  const leadIds=periodLeadIds(kind);
  if(!leadIds.length)return'<p class="stat-line">مسئولی تعریف نشده — از کارت دوره اضافه کنید.</p>';
  const map=assignMap(kind);
  const key=sessionSel()||curKey();
  const bag=key?(kind==="fee"?(d.fees[key]||{}):(d.sessions[key]||{})):{};
  let h='<div class="workload-card">';
  leadIds.forEach(lid=>{
    const lead=d.members.find(m=>m.id===lid);
    const name=lead?lead.name:lid;
    const assigned=d.members.filter(m=>map[m.id]===lid);
    let done=0;
    assigned.forEach(m=>{
      if(kind==="fee"){if(bag[m.id]&&bag[m.id].paid)done++;}
      else{const st=(bag[m.id]||{}).p1||(bag[m.id]||{}).p2;if(st)done++;}
    });
    const pct=assigned.length?Math.round(done/assigned.length*100):0;
    h+='<div class="wl-row"><span><b>'+esc(name)+'</b> · '+Jalali.toFa(assigned.length)+' نفر</span><div class="progress-mini"><i style="width:'+pct+'%"></i></div><span>'+Jalali.toFa(done)+'/'+Jalali.toFa(assigned.length)+'</span></div>';
  });
  const un=d.members.filter(m=>!map[m.id]);
  if(un.length)h+='<p class="stat-line">تقسیم‌نشده: '+Jalali.toFa(un.length)+'</p>';
  h+='</div>';
  return h;
}
function onlyMineToggleHTML(kind){
  const d=Store.get();
  const on=!!d.settings.onlyMine;
  return'<div class="mine-toggle noprint"><label style="display:flex;align-items:center;gap:8px;margin:0"><input type="checkbox" id="onlyMineCb" '+(on?"checked":"")+' style="width:auto;min-height:0"> فقط وظایف من</label>'+
    '<button class="btn sm ghost" type="button" id="btnAutoSplit">⚖ تقسیم</button>'+
    '<button class="btn sm ghost" type="button" id="btnShowWL">📊 بارکار</button></div>';
}
function wireMineToggle(kind){
  kind=kind||"attend";
  const cb=document.getElementById("onlyMineCb");
  if(cb)cb.onchange=()=>{const d=Store.get();d.settings.onlyMine=!!cb.checked;Store.save();render();};
  const b=document.getElementById("btnAutoSplit");
  if(b)b.onclick=()=>autoSplitTasks(kind);
  const w=document.getElementById("btnShowWL");
  if(w)w.onclick=()=>{
    const o=modal('<h3 style="font-weight:800">📊 بار کار '+(kind==="fee"?"شهریه":"حضور")+'</h3>'+workloadHTML(kind)+
      '<div class="row" style="margin-top:12px;gap:6px;flex-wrap:wrap"><button class="btn sm p" id="wlSplit">⚖ تقسیم مساوی</button><button class="btn sm ghost" id="wlClear">پاک کردن</button><button class="btn sm ghost" id="wlCl">بستن</button></div>');
    const cl=$("#wlCl",o);if(cl)cl.onclick=()=>o.remove();
    const sp=$("#wlSplit",o);if(sp)sp.onclick=()=>{autoSplitTasks(kind);o.remove();};
    const cr=$("#wlClear",o);if(cr)cr.onclick=()=>{clearSplit(kind);o.remove();};
  };
}
function filterMembersForMe(list, kind){
  const d=Store.get();
  if(!d.settings.onlyMine)return list;
  return list.filter(m=>isMine(kind,m.id));
}
function assigneeChip(kind, mid){
  const n=assigneeName(kind,mid);
  if(!n)return"";
  return'<span class="assignee-chip">👤 '+esc(n)+'</span> ';
}
function myPendingCount(){
  const d=Store.get();
  const key=curKey()||sessionSel();
  const s=key?(d.sessions[key]||{}):{};
  const f=key?(d.fees[key]||{}):{};
  let a=0,fee=0;
  d.members.forEach(m=>{
    if(isMine("attend",m.id)&&!(s[m.id]||{}).p1)a++;
    if(isMine("fee",m.id)&&!(f[m.id]&&f[m.id].paid))fee++;
  });
  return{attend:a,fee:fee};
}
function myTasksBannerHTML(){
  const d=Store.get();
  const hasSplit=Object.keys(assignMap("attend")).length+Object.keys(assignMap("fee")).length;
  if(!hasSplit&&!d.settings.onlyMine)return"";
  const c=myPendingCount();
  let h='<div class="card fade-up noprint"><h3>🧩 وظایف من در این دوره</h3>';
  h+='<p class="stat-line">حضور باز: <b>'+Jalali.toFa(c.attend)+'</b> · شهریه باز: <b>'+Jalali.toFa(c.fee)+'</b></p>';
  h+='<div class="row" style="flex-wrap:wrap;gap:6px;margin-top:6px">';
  h+='<button class="btn sm p" onclick="go(\'attend\')">📞 حضور</button>';
  h+='<button class="btn sm ghost" onclick="go(\'fees\')">💰 شهریه</button>';
  h+='<button class="btn sm ghost" id="homeSplitBtn">⚖ تقسیم خودکار حضور</button>';
  h+='</div></div>';
  return h;
}
function wireHomeSplit(){
  const b=document.getElementById("homeSplitBtn");
  if(b)b.onclick=()=>autoSplitTasks("attend");
}


/* ============ v15: پیشرفته ============ */
function togglePin(id){
  const d=Store.get();
  d.pinned=d.pinned||[];
  const i=d.pinned.indexOf(id);
  if(i>=0)d.pinned.splice(i,1);else d.pinned.push(id);
  Store.save();render();
}
function isPinned(id){return (Store.get().pinned||[]).indexOf(id)>=0;}
function smartSortMembers(list, kind){
  const d=Store.get();
  if(!d.settings.smartSort)return list;
  const key=sessionSel()||curKey();
  const s=key?(kind==="fee"?(d.fees[key]||{}):(d.sessions[key]||{})):{};
  const pinned=d.pinned||[];
  return list.slice().sort((a,b)=>{
    const pa=pinned.indexOf(a.id)>=0?0:1;
    const pb=pinned.indexOf(b.id)>=0?0:1;
    if(pa!==pb)return pa-pb;
    let da=0,db=0;
    if(kind==="fee"){
      da=(s[a.id]&&s[a.id].paid)?1:0;
      db=(s[b.id]&&s[b.id].paid)?1:0;
    }else{
      da=((s[a.id]||{}).p1||(s[a.id]||{}).p2)?1:0;
      db=((s[b.id]||{}).p1||(s[b.id]||{}).p2)?1:0;
    }
    if(da!==db)return da-db; // pending first
    const ma=isMine(kind,a.id)?0:1;
    const mb=isMine(kind,b.id)?0:1;
    if(ma!==mb)return ma-mb;
    return String(a.name).localeCompare(String(b.name),"fa");
  });
}
function copyPrevSession(){
  if(!requirePerm("attend")&&!requirePerm("edit"))return;
  const d=Store.get();
  const keys=Object.keys(d.sessions||{}).sort();
  const cur=sessionSel()||curKey();
  if(!cur){toast("جلسه جاری نیست");return;}
  const prev=keys.filter(k=>k<cur).pop();
  if(!prev){toast("جلسه قبلی برای کپی نیست");return;}
  confirm2("وضعیت حضور جلسه قبل روی این جلسه کپی شود؟ (فقط خانه‌های خالی پر می‌شوند)",()=>{
    d.sessions[cur]=d.sessions[cur]||{};
    let n=0;
    d.members.forEach(m=>{
      const src=d.sessions[prev][m.id];
      if(!src)return;
      const dst=d.sessions[cur][m.id]=d.sessions[cur][m.id]||{};
      if(!dst.p1&&src.p1){dst.p1=src.p1;n++;}
    });
    Store.save();logActivity("کپی از جلسه قبل: "+n);toast("✅ "+Jalali.toFa(n)+" مورد از جلسه قبل");render();
  });
}
function saveSessionNote(){
  const d=Store.get();
  const key=sessionSel()||curKey();
  if(!key)return;
  const el=document.getElementById("sessNote");
  if(!el)return;
  d.sessionNotes=d.sessionNotes||{};
  d.sessionNotes[key]=el.value.trim();
  Store.save();toast("یادداشت جلسه ذخیره شد");logActivity("یادداشت جلسه");
}
function sessionNoteHTML(){
  const d=Store.get();
  const key=sessionSel()||curKey();
  if(!key)return"";
  const note=(d.sessionNotes||{})[key]||"";
  return'<div class="card noprint"><h3>📝 یادداشت مشترک جلسه</h3><p class="stat-line">برای هماهنگی بین مسئولان — محرمانه پزشکی نیست</p>'+
    '<textarea class="session-note" id="sessNote" placeholder="مثلاً: امروز باران است؛ تأخیر محتمل">'+esc(note)+'</textarea>'+
    '<button class="btn sm p" style="margin-top:6px" type="button" id="btnSaveNote">💾 ذخیره یادداشت</button></div>';
}
function wireSessionNote(){
  const b=document.getElementById("btnSaveNote");
  if(b)b.onclick=()=>saveSessionNote();
}
function transferMyTasks(kind){
  kind=kind||"attend";
  const d=Store.get();
  const leads=periodLeadIds(kind).filter(id=>id!==myAssigneeId());
  if(!leads.length){toast("مسئول دیگری برای انتقال نیست");return;}
  const map=assignMap(kind);
  let opts=leads.map(id=>{
    const m=d.members.find(x=>x.id===id);
    return'<option value="'+id+'">'+(m?m.name:id)+'</option>';
  }).join("");
  const o=modal('<h3 style="font-weight:800">🔄 انتقال وظایف من</h3><p class="role-hint">اعضای سهم من به مسئول دیگر منتقل می‌شوند.</p>'+
    '<label>انتقال به</label><select id="trTo">'+opts+'</select>'+
    '<div class="row" style="margin-top:12px"><button class="btn p" style="flex:1" id="trGo">انتقال</button><button class="btn ghost" id="trCl">انصراف</button></div>');
  $("#trCl",o).onclick=()=>o.remove();
  $("#trGo",o).onclick=()=>{
    const to=$("#trTo",o).value;
    const me=myAssigneeId();
    let n=0;
    d.members.forEach(m=>{
      if(map[m.id]===me){map[m.id]=to;n++;}
    });
    Store.save();o.remove();toast("✅ "+Jalali.toFa(n)+" وظیفه منتقل شد");logActivity("انتقال وظایف");render();
  };
}
function weeklyDigest(){
  const d=Store.get();
  const keys=Object.keys(d.sessions||{}).sort().reverse().slice(0,4);
  let lines=["📊 خلاصه هفتگی — "+(d.settings.className||"کلاس"), "تاریخ تهیه: "+Jalali.fmt(Jalali.today()), ""];
  keys.forEach(k=>{
    const s=d.sessions[k]||{};
    let p=0,t=d.members.length||1;
    d.members.forEach(m=>{
      const st=(s[m.id]||{}).p2||(s[m.id]||{}).p1;
      if(st==="present"||st==="delay")p++;
    });
    lines.push(Jalali.fmt(Jalali.fromKey(k))+" — حضور تقریبی "+Jalali.toFa(Math.round(p/t*100))+"٪ ("+Jalali.toFa(p)+"/"+Jalali.toFa(t)+")");
  });
  const note=(d.period&&d.period.note)||"";
  if(note)lines.push("","یادداشت دوره: "+note);
  lines.push("","— مناسب ارسال به حامی‌ها —");
  const text=lines.join("\n");
  const o=modal('<h3 style="font-weight:800">📊 خلاصه هفتگی</h3><textarea rows="12" readonly id="wdTx">'+esc(text)+'</textarea>'+
    '<div class="share-grid" style="margin-top:10px"><button class="btn p" id="wdC">📋 کپی</button><button class="btn g" id="wdW">واتساپ</button><button class="btn ghost" id="wdT">تلگرام</button></div>');
  $("#wdC",o).onclick=()=>copyTxt(text);
  $("#wdW",o).onclick=()=>window.open("https://wa.me/?text="+encodeURIComponent(text),"_blank");
  $("#wdT",o).onclick=()=>tgShare(text);
  logActivity("خلاصه هفتگی");
}
function openCommandPalette(){
  if(route==="login")return;
  const existing=document.querySelector(".cmd-overlay");
  if(existing){existing.remove();return;}
  const memActs=(Store.get().members||[]).slice(0,40).map(m=>({k:"روند: "+m.name,fn:()=>showMemberTimeline(m.id)}));
  const actions=memActs.concat([
    {k:"خانه",fn:()=>go("home")},
    {k:"حضور / نوبت ۱",fn:()=>go("attend")},
    {k:"نوبت ۲ پشت در",fn:()=>openEntry()},
    {k:"شهریه",fn:()=>go("fees")},
    {k:"اعضا",fn:()=>go("members")},
    {k:"تکالیف",fn:()=>go("homework")},
    {k:"تنظیمات",fn:()=>go("settings")},
    {k:"راهنما",fn:()=>go("help")},
    {k:"تقسیم وظایف حضور",fn:()=>autoSplitTasks("attend")},
    {k:"تقسیم وظایف شهریه",fn:()=>autoSplitTasks("fee")},
    {k:"گزارش نوبت ۱ به حامی",fn:()=>reportRoundToHami(1)},
    {k:"گزارش نوبت ۲ به حامی",fn:()=>reportRoundToHami(2)},
    {k:"خلاصه انسانی حامی",fn:()=>humanHamiSummary()},
    {k:"خلاصه هفتگی",fn:()=>weeklyDigest()},
    {k:"کارت استوری",fn:()=>shareStoryCard()},
    {k:"کپی از جلسه قبل",fn:()=>copyPrevSession()},
    {k:"پشتیبان",fn:()=>backup()},
    {k:"انتقال وظایف من",fn:()=>transferMyTasks("attend")},{k:"بسته تحویل شیفت",fn:()=>handoffPackage("attend")},{k:"همگام‌سازی فشرده",fn:()=>compactSyncExport()},{k:"مرکز ارتباطات",fn:()=>communicationHub()},{k:"ثبت دسته‌ای حاضر",fn:()=>batchSetAtt("present")},{k:"بازگشت آخرین عمل",fn:()=>performUndo()}
  ]);
  const ov=document.createElement("div");
  ov.className="cmd-overlay";
  ov.innerHTML='<div class="cmd-box"><input id="cmdIn" placeholder="جستجوی دستور… (Ctrl+K)" autocomplete="off"><div id="cmdList"></div></div>';
  document.body.appendChild(ov);
  const input=$("#cmdIn",ov), list=$("#cmdList",ov);
  let sel=0, filtered=actions;
  const draw=()=>{
    list.innerHTML=filtered.slice(0,10).map((a,i)=>'<div class="cmd-item'+(i===sel?" on":"")+'" data-i="'+i+'"><span>'+esc(a.k)+'</span></div>').join("")||'<div class="cmd-item">موردی نیست</div>';
    list.querySelectorAll(".cmd-item[data-i]").forEach(el=>{
      el.onclick=()=>{filtered[Number(el.getAttribute("data-i"))].fn();ov.remove();};
    });
  };
  const filter=()=>{
    const q=input.value.trim();
    filtered=actions.filter(a=>!q||a.k.indexOf(q)>=0);
    sel=0;draw();
  };
  input.oninput=filter;
  input.onkeydown=e=>{
    if(e.key==="Escape"){ov.remove();return;}
    if(e.key==="ArrowDown"){sel=Math.min(sel+1,filtered.length-1);draw();e.preventDefault();}
    if(e.key==="ArrowUp"){sel=Math.max(sel-1,0);draw();e.preventDefault();}
    if(e.key==="Enter"&&filtered[sel]){filtered[sel].fn();ov.remove();}
  };
  ov.onclick=e=>{if(e.target===ov)ov.remove();};
  filter();
  setTimeout(()=>input.focus(),50);
}
function toggleOled(){
  const d=Store.get();
  d.settings.oled=!d.settings.oled;
  if(d.settings.oled){d.settings.theme="dark";}
  Store.save();
  document.body.classList.toggle("oled",!!d.settings.oled);
  toast(d.settings.oled?"OLED تیره فعال":"OLED خاموش");
  render();
}
function applyOled(){
  const d=Store.get();
  document.body.classList.toggle("oled",!!(d.settings&&d.settings.oled));
}
function reassignMember(kind, mid){
  const d=Store.get();
  const leads=periodLeadIds(kind);
  if(!leads.length){toast("مسئولی در دوره نیست");return;}
  const map=assignMap(kind);
  const o=modal('<h3 style="font-weight:800">👤 تعیین مسئول</h3><select id="raSel"><option value="">— بدون تقسیم —</option>'+
    leads.map(id=>{
      const m=d.members.find(x=>x.id===id);
      return'<option value="'+id+'" '+(map[mid]===id?"selected":"")+'>'+(m?esc(m.name):id)+'</option>';
    }).join("")+'</select>'+
    '<div class="row" style="margin-top:12px"><button class="btn p" style="flex:1" id="raOk">تأیید</button><button class="btn ghost" id="raCl">انصراف</button></div>');
  $("#raCl",o).onclick=()=>o.remove();
  $("#raOk",o).onclick=()=>{
    const v=$("#raSel",o).value;
    if(!v)delete map[mid]; else map[mid]=v;
    Store.save();o.remove();render();
  };
}


/* ============ v16: عملیات پیشرفته ============ */
const _undoUI={timer:null};
function pushUndo(entry){
  const d=Store.get();
  d.undoStack=d.undoStack||[];
  d.undoStack.push(Object.assign({t:Date.now()},entry));
  if(d.undoStack.length>30)d.undoStack=d.undoStack.slice(-30);
  Store.save();
  showUndoBar(entry.label||"عملیات");
}
function showUndoBar(label){
  let bar=document.getElementById("undoBar");
  if(!bar){
    bar=document.createElement("div");
    bar.id="undoBar";
    bar.className="undo-bar";
    bar.innerHTML='<span id="undoLbl"></span><button type="button" id="undoBtn">↩ بازگشت</button>';
    document.body.appendChild(bar);
    document.getElementById("undoBtn").onclick=()=>performUndo();
  }
  document.getElementById("undoLbl").textContent=label+" — ۸ ثانیه برای بازگشت";
  bar.classList.add("show");
  clearTimeout(_undoUI.timer);
  _undoUI.timer=setTimeout(()=>bar.classList.remove("show"),8000);
}
function performUndo(){
  const d=Store.get();
  const u=(d.undoStack||[]).pop();
  if(!u){toast("چیزی برای بازگشت نیست");return;}
  if(u.type==="att"){
    d.sessions[u.key]=d.sessions[u.key]||{};
    if(u.prev==null)delete d.sessions[u.key][u.mid];
    else d.sessions[u.key][u.mid]=u.prev;
  }else if(u.type==="fee"){
    d.fees[u.key]=d.fees[u.key]||{};
    if(u.prev==null)delete d.fees[u.key][u.mid];
    else d.fees[u.key][u.mid]=u.prev;
  }
  Store.save();
  document.getElementById("undoBar")&&document.getElementById("undoBar").classList.remove("show");
  toast("↩ بازگردانده شد");
  render();
}
function absenceRisk(id){
  const d=Store.get();
  const keys=Object.keys(d.sessions||{}).sort().reverse().slice(0,8);
  if(keys.length<3)return0;
  let abs=0,total=0;
  keys.forEach(k=>{
    const st=(d.sessions[k][id]||{}).p2||(d.sessions[k][id]||{}).p1;
    if(!st)return;
    total++;
    if(st==="absent"||st==="problem")abs++;
  });
  if(total<3)return0;
  return abs/total;
}
function riskChip(id){
  const r=absenceRisk(id);
  if(r>=0.5)return'<span class="assignee-chip risk-hi">ریسک بالا</span> ';
  if(r>=0.3)return'<span class="assignee-chip risk-mid">نیاز توجه</span> ';
  return"";
}
function memberTimeline(id){
  const d=Store.get();
  const m=d.members.find(x=>x.id===id);
  if(!m)return;
  const keys=Object.keys(d.sessions||{}).sort().reverse().slice(0,10);
  const lbl={present:"حاضر",delay:"تأخیر",absent:"بدون حضور",problem:"مشکل"};
  let h='<div class="timeline">';
  keys.forEach(k=>{
    const st=(d.sessions[k][id]||{}).p2||(d.sessions[k][id]||{}).p1;
    h+='<div class="tl-item"><b>'+Jalali.fmt(Jalali.fromKey(k))+'</b> — '+(st?lbl[st]||st:"ثبت نشده")+'</div>';
  });
  h+='</div>';
  const risk=absenceRisk(id);
  modal('<h3 style="font-weight:800">📅 روند '+esc(m.name)+'</h3>'+
    (risk>=0.3?'<p class="stat-line">نرخ عدم‌ثبت مؤثر اخیر: '+Jalali.toFa(Math.round(risk*100))+'٪</p>':'')+
    h+'<button class="btn ghost" style="width:100%" onclick="this.closest(\'.modal-bg,dialog,[class*=modal]\')?.remove?.()">بستن</button>');
  // simpler close: find modal root
  setTimeout(()=>{
    const root=document.querySelector(".modal, .overlay, [id^=m]");
  },0);
}
function teamBoardHTML(kind){
  kind=kind||"attend";
  const d=Store.get();
  const leads=periodLeadIds(kind);
  if(!leads.length)return"";
  const map=assignMap(kind);
  const key=sessionSel()||curKey();
  const bag=key?(kind==="fee"?(d.fees[key]||{}):(d.sessions[key]||{})):{};
  let h='<div class="card noprint"><h3>👥 تابلوی تیم '+(kind==="fee"?"شهریه":"حضور")+'</h3><div class="team-board">';
  leads.forEach(lid=>{
    const lead=d.members.find(x=>x.id===lid);
    const name=lead?lead.name:lid;
    const assigned=d.members.filter(m=>map[m.id]===lid);
    let done=0;
    assigned.forEach(m=>{
      if(kind==="fee"){if(bag[m.id]&&bag[m.id].paid)done++;}
      else if((bag[m.id]||{}).p1||(bag[m.id]||{}).p2)done++;
    });
    const pct=assigned.length?Math.round(done/assigned.length*100):0;
    const me=lid===myAssigneeId()?' <span class="badge b-p">شما</span>':'';
    h+='<div class="tb"><div class="row" style="justify-content:space-between"><b>'+esc(name)+'</b>'+me+'<span>'+Jalali.toFa(pct)+'٪</span></div>'+
      '<div class="progress-mini" style="margin-top:6px"><i style="width:'+pct+'%"></i></div>'+
      '<div class="stat-line" style="margin-top:4px">'+Jalali.toFa(done)+' از '+Jalali.toFa(assigned.length)+' انجام شده</div></div>';
  });
  h+='</div></div>';
  return h;
}
function handoffPackage(kind){
  kind=kind||"attend";
  const d=Store.get();
  const me=myAssigneeId();
  const map=assignMap(kind);
  const key=sessionSel()||curKey();
  const pending=d.members.filter(m=>{
    if(map[m.id]&&map[m.id]!==me)return false;
    if(!map[m.id]&&d.settings.onlyMine)return isMine(kind,m.id);
    if(map[m.id]!==me&&Object.keys(map).length)return false;
    if(kind==="fee"){
      const f=key?(d.fees[key]||{}):{};
      return!(f[m.id]&&f[m.id].paid);
    }
    const s=key?(d.sessions[key]||{}):{};
    return!((s[m.id]||{}).p1||(s[m.id]||{}).p2);
  });
  // Actually simpler pending list for mine
  const minePending=d.members.filter(m=>{
    if(!isMine(kind,m.id))return false;
    if(kind==="fee"){const f=key?(d.fees[key]||{}):{};return!(f[m.id]&&f[m.id].paid);}
    const s=key?(d.sessions[key]||{}):{};
    return!((s[m.id]||{}).p1);
  });
  let lines=["📦 بسته تحویل شیفت — "+(kind==="fee"?"شهریه":"حضور"),
    d.settings.className||"کلاس",
    key?("جلسه: "+Jalali.fmt(Jalali.fromKey(key))):"",
    "از طرف: "+((currentUser()||{}).name||""),
    "","باقی‌مانده‌ها:"];
  minePending.forEach(m=>lines.push("• "+m.name+((m.phones||[])[0]?" — "+m.phones[0]:"")));
  if(!minePending.length)lines.push("• مورد بازی نیست");
  lines.push("","لطفاً ادامه دهید. — ارسال از MCT");
  const text=lines.join("\n");
  const o=modal('<h3 style="font-weight:800">📦 تحویل شیفت</h3><textarea rows="12" readonly>'+esc(text)+'</textarea>'+
    '<div class="share-grid" style="margin-top:10px"><button class="btn p" id="hoC">📋 کپی</button><button class="btn g" id="hoW">واتساپ</button><button class="btn ghost" id="hoTr">🔄 انتقال رسمی</button></div>');
  $("#hoC",o).onclick=()=>copyTxt(text);
  $("#hoW",o).onclick=()=>window.open("https://wa.me/?text="+encodeURIComponent(text),"_blank");
  $("#hoTr",o).onclick=()=>{o.remove();transferMyTasks(kind);};
  logActivity("بسته تحویل شیفت");
}
function showMemberTimeline(id){
  const d=Store.get();
  const m=d.members.find(x=>x.id===id);
  if(!m)return;
  const keys=Object.keys(d.sessions||{}).sort().reverse().slice(0,12);
  const lbl={present:"✅ حاضر",delay:"⏰ تأخیر",absent:"📭 بدون حضور",problem:"💬 مشکل"};
  let h='<div class="timeline">';
  if(!keys.length)h+='<div class="tl-item">هنوز جلسه‌ای نیست</div>';
  keys.forEach(k=>{
    const st=(d.sessions[k][id]||{}).p2||(d.sessions[k][id]||{}).p1;
    h+='<div class="tl-item"><b>'+Jalali.fmt(Jalali.fromKey(k))+'</b> — '+(st?lbl[st]||st:"—")+'</div>';
  });
  h+='</div>';
  const r=absenceRisk(id);
  const o=modal('<h3 style="font-weight:800">📅 '+esc(m.name)+'</h3>'+
    (r>=0.3?'<p class="assignee-chip risk-mid">الگوی نیاز به توجه: '+Jalali.toFa(Math.round(r*100))+'٪</p>':'')+
    h+'<button class="btn ghost" style="width:100%;margin-top:8px" id="tlCl">بستن</button>');
  $("#tlCl",o).onclick=()=>o.remove();
}


/* ============ v17: فیلتر، دسته، نقشه حرارت، مربی تماس ============ */
window._batchSel=window._batchSel||new Set();
window._listFilter=window._listFilter||"all";
function setListFilter(f){window._listFilter=f;render();}
function toggleBatchPick(id){
  if(window._batchSel.has(id))window._batchSel.delete(id);else window._batchSel.add(id);
  // update UI without full render if possible
  document.querySelectorAll(".mem[data-mid=\""+id+"\"]").forEach(el=>el.classList.toggle("pick",window._batchSel.has(id)));
  const bar=document.getElementById("batchBar");
  if(bar){bar.classList.toggle("on",window._batchSel.size>0);
    const c=document.getElementById("batchCount");if(c)c.textContent=Jalali.toFa(window._batchSel.size);}
}
function clearBatch(){window._batchSel=new Set();render();}
function batchSetAtt(st){
  if(!window._batchSel.size){toast("کسی انتخاب نشده");return;}
  const key=sessionSel()||curKey();
  if(!key){toast("جلسه مشخص نیست");return;}
  const ids=[...window._batchSel];
  ids.forEach(mid=>{
    // use setAtt for each for undo of last only - direct for speed
    const d=Store.get();
    d.sessions[key]=d.sessions[key]||{};
    const prev=d.sessions[key][mid]?JSON.parse(JSON.stringify(d.sessions[key][mid])):null;
    const cur=d.sessions[key][mid]=d.sessions[key][mid]||{};
    cur.p1=st;cur.time=Date.now();cur.by=(currentUser()||{}).name||"";
    pushUndo({type:"att",key,mid,prev,label:"دسته‌ای"});
  });
  Store.save();
  window._batchSel=new Set();
  toast("✅ "+Jalali.toFa(ids.length)+" نفر: "+st);
  logActivity("ثبت دسته‌ای "+st);
  render();
}
function filterChipsHTML(){
  const f=window._listFilter||"all";
  const items=[["all","همه"],["mine","وظایف من"],["risk","نیاز توجه"],["pin","پین"],["open","باز"]];
  return'<div class="filter-chips noprint">'+items.map(([k,l])=>
    '<button type="button" class="'+(f===k?"on":"")+'" onclick="setListFilter(\''+k+'\')">'+l+'</button>'
  ).join("")+'</div>';
}
function applyListFilter(list, kind){
  const f=window._listFilter||"all";
  const d=Store.get();
  const key=sessionSel()||curKey();
  const s=key?(d.sessions[key]||{}):{};
  if(f==="all")return list;
  if(f==="mine")return list.filter(m=>isMine(kind,m.id));
  if(f==="risk")return list.filter(m=>absenceRisk(m.id)>=0.3);
  if(f==="pin")return list.filter(m=>isPinned(m.id));
  if(f==="open"){
    if(kind==="fee"){const fees=key?(d.fees[key]||{}):{};return list.filter(m=>!(fees[m.id]&&fees[m.id].paid));}
    return list.filter(m=>!((s[m.id]||{}).p1||(s[m.id]||{}).p2));
  }
  return list;
}
function openBatchPicker(){
  const d=Store.get();
  const key=sessionSel()||curKey();
  let list=applyListFilter(filterMembersForMe(d.members.slice(),"attend"),"attend");
  list=smartSortMembers(list,"attend");
  const o=modal('<h3 style="font-weight:800">☑ انتخاب چندنفره</h3><div style="max-height:50vh;overflow:auto" id="bpList">'+
    list.map(m=>'<label class="mem" style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-id="'+m.id+'" '+(window._batchSel.has(m.id)?"checked":"")+' style="width:auto;min-height:0"> '+esc(m.name)+'</label>').join("")+
    '</div><div class="row" style="margin-top:10px;gap:6px;flex-wrap:wrap">'+
    '<button class="btn sm p" id="bpP">حاضر</button><button class="btn sm ghost" id="bpD">تأخیر</button><button class="btn sm ghost" id="bpA">غایب</button><button class="btn sm ghost" id="bpX">بستن</button></div>');
  const collect=()=>{window._batchSel=new Set();o.querySelectorAll("input[data-id]:checked").forEach(c=>window._batchSel.add(c.getAttribute("data-id")));};
  $("#bpP",o).onclick=()=>{collect();o.remove();batchSetAtt("present");};
  $("#bpD",o).onclick=()=>{collect();o.remove();batchSetAtt("delay");};
  $("#bpA",o).onclick=()=>{collect();o.remove();batchSetAtt("absent");};
  $("#bpX",o).onclick=()=>o.remove();
}
function batchBarHTML(){
  return'<div class="batch-bar noprint on" id="batchBar"><span>انتخاب: <b id="batchCount">۰</b></span>'+
    '<button class="btn sm p" type="button" onclick="batchSetAtt(\'present\')">حاضر</button>'+
    '<button class="btn sm ghost" type="button" onclick="batchSetAtt(\'delay\')">تأخیر</button>'+
    '<button class="btn sm ghost" type="button" onclick="batchSetAtt(\'absent\')">غایب</button>'+
    '<button class="btn sm ghost" type="button" onclick="openBatchPicker()">☑ انتخاب</button> <button class="btn sm ghost" type="button" onclick="clearBatch()">لغو</button></div>';
}
function heatmapHTML(){
  const d=Store.get();
  const keys=Object.keys(d.sessions||{}).sort().reverse().slice(0,8).reverse();
  if(keys.length<2)return"";
  let cells="";
  keys.forEach(k=>{
    const s=d.sessions[k]||{};
    let p=0,t=d.members.length||1;
    d.members.forEach(m=>{const st=(s[m.id]||{}).p2||(s[m.id]||{}).p1;if(st==="present"||st==="delay")p++;});
    const pct=p/t;
    let cls="h0";
    if(pct>=0.9)cls="h3";else if(pct>=0.75)cls="h2";else if(pct>=0.5)cls="h1";else if(pct>=0.3)cls="h4";else cls="h5";
    cells+='<i class="'+cls+'" title="'+Jalali.fmt(Jalali.fromKey(k))+' — '+Math.round(pct*100)+'%"></i>';
  });
  return'<div class="card noprint"><h3>🌡️ نقشه ۸ جلسه اخیر</h3><div class="heat">'+cells+'</div><p class="stat-line">سبز = حضور خوب · زرد/قرمز = نیاز توجه</p></div>';
}
function kpiRowHTML(){
  const d=Store.get();
  const key=curKey()||sessionSel();
  const s=key?(d.sessions[key]||{}):{};
  const f=key?(d.fees[key]||{}):{};
  let openA=0,openF=0,done=0;
  d.members.forEach(m=>{
    if(!((s[m.id]||{}).p1||(s[m.id]||{}).p2))openA++; else done++;
    if(!(f[m.id]&&f[m.id].paid))openF++;
  });
  return'<div class="kpi-row noprint"><div class="kpi"><div class="n">'+Jalali.toFa(openA)+'</div><div class="l">حضور باز</div></div>'+
    '<div class="kpi"><div class="n">'+Jalali.toFa(openF)+'</div><div class="l">شهریه باز</div></div>'+
    '<div class="kpi"><div class="n">'+Jalali.toFa(done)+'</div><div class="l">ثبت‌شده</div></div></div>';
}
function callCoach(m){
  const r=absenceRisk(m.id);
  if(r>=0.5)return'<div class="coach">💡 با لحن حمایتگر تماس بگیرید؛ سابقه عدم حضور اخیر دارد.</div>';
  if(r>=0.3)return'<div class="coach">💡 یادآوری ملایم کافی است؛ الگوی نامنظم داشته.</div>';
  if(isPinned(m.id))return'<div class="coach">📌 عضو پین‌شده — اولویت هماهنگی.</div>';
  return"";
}
function stampAtt(cur){
  cur.time=Date.now();
  cur.by=(currentUser()||{}).name||"";
  return cur;
}
function compactSyncExport(){
  const d=Store.get();
  const key=sessionSel()||curKey();
  const payload={
    v:17,key,className:d.settings.className,
    sessions:key?d.sessions[key]:null,
    fees:key?d.fees[key]:null,
    assignments:d.assignments,
    period:d.period,
    at:Date.now()
  };
  const text=btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const o=modal('<h3 style="font-weight:800">🔗 همگام‌سازی فشرده</h3><p class="role-hint">این کد را برای همکار بفرستید تا وضعیت جلسه و تقسیم کار را وارد کند.</p>'+
    '<textarea rows="6" id="syncOut" readonly>'+text+'</textarea>'+
    '<div class="row" style="margin-top:8px;gap:6px"><button class="btn p" style="flex:1" id="syC">📋 کپی</button><button class="btn ghost" id="syI">وارد کردن کد</button></div>');
  $("#syC",o).onclick=()=>copyTxt(text);
  $("#syI",o).onclick=()=>{
    o.remove();
    const o2=modal('<h3 style="font-weight:800">وارد کردن همگام</h3><textarea rows="6" id="syncIn" placeholder="کد را بچسبانید"></textarea>'+
      '<button class="btn p" style="width:100%;margin-top:8px" id="syGo">ادغام</button>');
    $("#syGo",o2).onclick=()=>{
      try{
        const raw=decodeURIComponent(escape(atob($("#syncIn",o2).value.trim())));
        const p=JSON.parse(raw);
        const d=Store.get();
        if(p.sessions&&p.key){
          d.sessions[p.key]=Object.assign({},d.sessions[p.key]||{},p.sessions);
        }
        if(p.fees&&p.key){
          d.fees[p.key]=Object.assign({},d.fees[p.key]||{},p.fees);
        }
        if(p.assignments){
          d.assignments=d.assignments||{attend:{},fee:{}};
          d.assignments.attend=Object.assign({},d.assignments.attend,p.assignments.attend||{});
          d.assignments.fee=Object.assign({},d.assignments.fee,p.assignments.fee||{});
        }
        if(p.period)d.period=Object.assign({},d.period,p.period);
        Store.save();o2.remove();toast("✅ همگام‌سازی انجام شد");logActivity("وارد کردن همگام فشرده");render();
      }catch(e){toast("کد نامعتبر است");}
    };
  };
}


/* ============ v18: مرکز ارتباطات + سلامت داده ============ */
function communicationHub(){
  const d=Store.get();
  const key=sessionSel()||curKey();
  const o=modal('<h3 style="font-weight:800">📡 مرکز ارتباطات</h3><p class="role-hint">گزارش‌ها و پیام‌ها با حفظ حریم خصوصی (بدون یادداشت محرمانه).</p>'+
    '<div class="share-grid">'+
    '<button class="btn p" id="c1">📤 نوبت ۱ → حامی</button>'+
    '<button class="btn p" id="c2">📤 نوبت ۲ → حامی</button>'+
    '<button class="btn g" id="c3">💰 شهریه → حامی</button>'+
    '<button class="btn ghost" id="c4">🤝 خلاصه انسانی</button>'+
    '<button class="btn ghost" id="c5">📊 هفتگی</button>'+
    '<button class="btn ghost" id="c6">📦 تحویل شیفت</button>'+
    '<button class="btn ghost" id="c7">📸 استوری</button>'+
    '<button class="btn ghost" id="c8">🔗 همگام فشرده</button>'+
    '<button class="btn ghost" id="c9">💬 یادآوری حضور</button>'+
    '<button class="btn ghost" id="c10">💚 یادآوری شهریه</button>'+
    '</div><button class="btn ghost" style="width:100%;margin-top:10px" id="cCl">بستن</button>');
  const map={c1:()=>reportRoundToHami(1),c2:()=>reportRoundToHami(2),c3:()=>reportFeesToHami(),c4:()=>humanHamiSummary(),c5:()=>weeklyDigest(),c6:()=>handoffPackage("attend"),c7:()=>shareStoryCard(),c8:()=>compactSyncExport(),c9:()=>attendRemindWA(),c10:()=>remindUnpaidWA()};
  Object.keys(map).forEach(id=>{const b=$("#"+id,o);if(b)b.onclick=()=>{o.remove();map[id]();};});
  $("#cCl",o).onclick=()=>o.remove();
}
function dataHealthHTML(){
  const d=Store.get();
  const issues=[];
  if(!d.members.length)issues.push("هنوز عضوی ثبت نشده");
  if(!(d.classes&&d.classes.length))issues.push("ساعت کلاس در تنظیمات خالی است");
  const noPhone=d.members.filter(m=>!(m.phones||[]).filter(Boolean).length).length;
  if(noPhone)issues.push(Jalali.toFa(noPhone)+" نفر بدون شماره");
  const leadsA=periodLeadIds("attend");
  if(!leadsA.length)issues.push("مسئول حضور دوره مشخص نشده");
  const last=d.settings.lastBackupAt;
  if(!last||(Date.now()-last)>7*864e5)issues.push("پشتیبان بیش از ۷ روز پیش (یا هرگز)");
  if(!issues.length)return'<div class="card noprint"><h3>✅ سلامت داده</h3><p class="stat-line">آماده کار — مورد بحرانی نیست.</p></div>';
  return'<div class="card noprint"><h3>🩺 سلامت داده</h3><ul style="margin:0;padding-right:18px;font-size:.88em;color:var(--tx2)">'+
    issues.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>'+
    '<div class="row" style="margin-top:8px;gap:6px;flex-wrap:wrap"><button class="btn sm p" onclick="go(\'settings\')">تنظیمات</button><button class="btn sm ghost" onclick="backup()">پشتیبان</button><button class="btn sm ghost" onclick="communicationHub()">ارتباطات</button></div></div>';
}
function workflowStripHTML(){
  return'<div class="card noprint"><h3>🧭 گردش کار جلسه</h3><p class="stat-line" style="line-height:1.7">① نوبت ۱ تماس قبلی → ② پیگیری شهریه تا یک روز قبل → ③ نوبت ۲ پشت در → ④ یادآور ۱۵/۸/۵/۳ به درمانگر → ⑤ گزارش به حامی‌ها</p>'+
    '<div class="row" style="flex-wrap:wrap;gap:6px">'+
    '<button class="btn sm p" onclick="go(\'attend\')">① حضور</button>'+
    '<button class="btn sm ghost" onclick="go(\'fees\')">② شهریه</button>'+
    '<button class="btn sm ghost" onclick="openEntry()">③ نوبت ۲</button>'+
    '<button class="btn sm ghost" onclick="communicationHub()">⑤ گزارش</button></div></div>';
}

function currentUser(){
  const d=Store.get();
  if(!d.users||!d.users.length)return{id:"u-admin",name:"مدیر",role:"admin",pin:"0000"};
  if(d.currentUserId){const u=d.users.find(x=>x.id===d.currentUserId);if(u)return u;}
  // if login not required, default first admin or first user
  if(!d.settings.requireLogin)return d.users.find(x=>x.role==="admin")||d.users[0];
  return null;
}
function can(perm){
  const u=currentUser();
  if(!u)return false;
  const p=ROLE_PERMS[u.role]||ROLE_PERMS.view;
  if(perm==="more"||perm==="reports")return !!(p.more||p.reports||p.home||p.help);
  return !!p[perm];
}
function requirePerm(perm,msg){
  if(can(perm))return true;
  toast("⛔ "+(msg||"دسترسی ندارید"));
  return false;
}
function logoutUser(){
  const d=Store.get();d.currentUserId=null;Store.save();
  if(d.settings.requireLogin){route="login";render();}
  else toast("از حساب خارج شدید");
}
function loginUser(userId,pin){
  const d=Store.get();
  const u=d.users.find(x=>x.id===userId);
  if(!u){toast("کاربر یافت نشد");return false;}
  if(String(u.pin||"")!==String(pin||"")){toast("⚠️ رمز نادرست");return false;}
  d.currentUserId=u.id;Store.save();
  route="home";resetUI();render();
  toast("سلام "+u.name+" 👋");
  return true;
}

/* ============ v10: راهنما ============ */
function Pages_help(el){
  el.innerHTML='<div class="page">'+
  '<div class="card"><h3>📖 راهنمای استفاده</h3>'+
  '<p class="role-hint">این اپ برای گروه درمانی است: پیگیری حضور (دو نوبت)، شهریه، تکالیف، و گزارش به حامی‌ها.</p></div>'+

  '<div class="card help-sec"><h4>۱) شروع سریع</h4>'+
  '<div class="help-step"><b>گام ۱:</b> از تنظیمات، نام کلاس و برنامه هفتگی (مثلاً سه‌شنبه ۱۹–۲۱) را ثبت کنید.</div>'+
  '<div class="help-step"><b>گام ۲:</b> در تب اعضا، همه افراد را با شماره تماس اضافه کنید. برای اعضای قدیمی نقش «حامی» را بزنید.</div>'+
  '<div class="help-step"><b>گام ۳:</b> در کارت «دوره» مسئولان حضور، شهریه و تکالیف این دوره را مشخص کنید.</div>'+
  '<div class="help-step"><b>گام ۴:</b> اگر چند نفر با یک دستگاه کار می‌کنند، در تنظیمات کاربر بسازید و «ورود با رمز» را روشن کنید.</div></div>'+

  '<div class="card help-sec"><h4>۲) نوبت ۱ — تماس قبلی</h4>'+
  '<p>چند ساعت یا یک روز قبل از کلاس:</p>'+
  '<ol><li>تب <b>حضور</b> را باز کنید.</li>'+
  '<li>برای هر نفر وضعیت را ثبت کنید (حاضر / تأخیر / بدون حضور / مشکل).</li>'+
  '<li>دکمه <b>گزارش به حامی</b> را بزنید و برای حامی‌ها بفرستید.</li></ol></div>'+

  '<div class="card help-sec"><h4>۳) نوبت ۲ — پشت در کلاس</h4>'+
  '<ol><li>حدود ۳۰ دقیقه قبل، از خانه یا حضور وارد <b>نوبت ۲ پشت در</b> شوید.</li>'+
  '<li>تک‌به‌تک تماس بگیرید و وضعیت را ثبت کنید.</li>'+
  '<li>چک‌لیست ۱۵ / ۸ / ۵ / ۳ دقیقه را برای اعلام به درمانگر تیک بزنید؛ در ۳ دقیقه در را باز کنید.</li>'+
  '<li>دوباره <b>گزارش این نوبت به حامی‌ها</b> را ارسال کنید.</li></ol></div>'+

  '<div class="card help-sec"><h4>۴) شهریه</h4>'+
  '<p>مهلت پیش‌فرض: <b>یک روز قبل از کلاس</b>. اعضا فیش را در واتساپ می‌فرستند؛ شما وضعیت را در اپ ثبت می‌کنید.</p>'+
  '<ol><li>تب شهریه → پرداخت‌شده را تیک بزنید.</li>'+
  '<li>خروجی اکسل بگیرید.</li>'+
  '<li>گزارش شهریه را برای حامی‌ها بفرستید.</li></ol></div>'+

  '<div class="card help-sec"><h4>۵) حامی کیست؟</h4>'+
  '<p>حامی = عضو قدیمی که قبلاً مسئول بوده و الان پشتیبان مسئولان جدید و رابط با درمانگر است. گزارش‌ها برای اوست؛ لازم نیست همیشه وارد اپ شود.</p></div>'+

  '<div class="card help-sec"><h4>۶) نقش‌های ورود به اپ</h4>'+
  '<ul><li><b>مدیر:</b> همه تنظیمات و دوره</li>'+
  '<li><b>پیگیر:</b> حضور و شهریه</li>'+
  '<li><b>حامی (کاربر):</b> مشاهده و گزارش بدون شهریه حساس</li>'+
  '<li><b>مشاهده‌گر:</b> فقط خواندن</li></ul></div>'+

  '<div class="card help-sec"><h4>۷) موبایل و کامپیوتر</h4>'+
  '<p><b>موبایل:</b> منوی پایین؛ دکمه‌های بزرگ؛ مناسب تماس سریع پشت در.</p>'+
  '<p><b>تبلت/کامپیوتر:</b> منوی کناری؛ صفحه عریض‌تر؛ مناسب ساخت گزارش و اکسل.</p>'+
  '<p>روی گوشی می‌توانید اپ را «Add to Home Screen» کنید تا مثل برنامه نصب شود.</p></div>'+

  '<div class="card help-sec"><h4>۸) نکات ایمنی داده</h4>'+
  '<ul><li>داده روی همین مرورگر/دستگاه است — مرتب <b>پشتیبان</b> بگیرید.</li>'+
  '<li>یادداشت محرمانه در گزارش حامی نمی‌آید.</li>'+
  '<li>حالت حریم خصوصی عکس و شماره را محو می‌کند.</li></ul></div>'+

  '<div class="card"><a class="btn p" style="width:100%;display:block;text-align:center;text-decoration:none" href="GUIDE.html" target="_blank">📖 راهنمای تصویری کامل</a><button class="btn ghost" style="width:100%;margin-top:8px" onclick="go(\'home\')">🏠 بازگشت به خانه</button></div>'+
  '</div>';
}
Pages.help=Pages_help;

function Pages_login(el){
  const d=Store.get();
  const users=d.users||[];
  let sel=users[0]?users[0].id:"";
  let pin="";
  const draw=()=>{
    el.innerHTML='<div class="login-wrap"><div class="login-card fade-up">'+
      '<div class="logo" style="margin:0 auto 12px;width:48px;height:48px;font-size:1.2em">M</div>'+
      '<h2 style="text-align:center">ورود به '+(esc(d.settings.className||"کلاس"))+'</h2>'+
      '<p class="stat-line" style="text-align:center">سطح دسترسی جدا برای مدیر، حامی، پیگیر و مشاهده‌گر</p>'+
      '<label>کاربر</label><select id="loginUser">'+users.map(u=>'<option value="'+u.id+'" '+(u.id===sel?"selected":"")+'>'+esc(u.name)+' — '+(ROLE_LABEL[u.role]||u.role)+'</option>').join("")+'</select>'+
      '<div class="pin-dots" id="pinDots">'+[0,1,2,3].map(i=>'<i class="'+(i<pin.length?"on":"")+'"></i>').join("")+'</div>'+
      '<div class="pin-pad" id="pinPad">'+
      [1,2,3,4,5,6,7,8,9,"",0,"⌫"].map(x=>{
        if(x==="")return'<span></span>';
        return'<button type="button" data-k="'+x+'">'+x+'</button>';
      }).join("")+'</div>'+
      '<p class="safe-tip">رمز پیش‌فرض مدیر: ۰۰۰۰ — از تنظیمات عوض کنید. داده روی همین دستگاه می‌ماند.</p></div></div>';
    $("#loginUser",el).onchange=e=>{sel=e.target.value;pin="";draw();};
    el.querySelectorAll("#pinPad button").forEach(b=>{
      b.onclick=()=>{
        const k=b.getAttribute("data-k");
        if(k==="⌫"){pin=pin.slice(0,-1);draw();return;}
        if(pin.length>=4)return;
        pin+=k;draw();
        if(pin.length===4){
          if(!loginUser(sel,pin)){pin="";
            const card=el.querySelector(".login-card");if(card){card.classList.add("err-shake");setTimeout(()=>card.classList.remove("err-shake"),400);}
            draw();
          }
        }
      };
    });
  };
  draw();
}
Pages.login=Pages_login;

function saveUserForm(id){
  if(!requirePerm("settings","فقط مدیر می‌تواند کاربر تعریف کند"))return;
  const d=Store.get();
  const name=($("#uName")&&$("#uName").value||"").trim();
  const pin=($("#uPin")&&$("#uPin").value||"").trim();
  const role=$("#uRole")?$("#uRole").value:"follow";
  if(!name){toast("نام کاربر را وارد کنید");return;}
  if(!/^\d{4}$/.test(pin)){toast("رمز باید ۴ رقم باشد");return;}
  if(id){
    const u=d.users.find(x=>x.id===id);if(!u)return;
    u.name=name;u.pin=pin;u.role=role;
  }else{
    d.users.push({id:Store.uid(),name,pin,role});
  }
  Store.save();render();toast("✅ کاربر ذخیره شد");
}
function delUser(id){
  if(!requirePerm("settings"))return;
  const d=Store.get();
  if(d.users.length<=1){toast("حداقل یک کاربر لازم است");return;}
  confirm2("این کاربر حذف شود؟",()=>{
    d.users=d.users.filter(x=>x.id!==id);
    if(d.currentUserId===id)d.currentUserId=d.users[0].id;
    Store.save();render();
  });
}
function userForm(id){
  if(!requirePerm("settings"))return;
  const d=Store.get();const u=id?d.users.find(x=>x.id===id):null;
  const o=modal('<h3 style="font-weight:800">'+(u?"✏️ ویرایش کاربر":"＋ کاربر جدید")+'</h3>'+
    '<label>نام</label><input id="uName" value="'+esc(u?u.name:"")+'">'+
    '<label>رمز ۴ رقمی</label><input id="uPin" inputmode="numeric" maxlength="4" dir="ltr" value="'+esc(u?u.pin:"0000")+'">'+
    '<label>نقش / سطح دسترسی</label><select id="uRole">'+
    Object.keys(ROLE_LABEL).map(r=>'<option value="'+r+'" '+(u&&u.role===r?"selected":"")+'>'+ROLE_LABEL[r]+'</option>').join("")+'</select>'+
    '<div class="safe-tip">مدیر: همه چیز · حامی: بدون شهریه و حذف · پیگیر: ثبت حضور/شهریه · مشاهده‌گر: فقط خواندن</div>'+
    '<div class="row" style="margin-top:12px"><button class="btn p" style="flex:1" id="uSave">💾 ذخیره</button><button class="btn ghost" id="uCl">انصراف</button></div>');
  $("#uCl",o).onclick=()=>o.remove();
  $("#uSave",o).onclick=()=>{saveUserForm(id);o.remove();};
}

/* گزارش امن برای حامی‌ها — بدون یادداشت محرمانه و بدون جزئیات حساس */
function reportForSupporters(){
  if(!requirePerm("shareSupport","اجازه ارسال گزارش به حامی را ندارید"))return;
  const d=Store.get();const key=sessionSel();
  const q=careQueue();
  let lines=[];
  lines.push("🤝 گزارش حمایتی — "+(d.settings.className||"کلاس"));
  lines.push("تاریخ: "+Jalali.fmt(Jalali.today()));
  if(key)lines.push("جلسه: "+Jalali.fmt(Jalali.fromKey(key)));
  lines.push("");
  if(q.length){
    lines.push("اولویت حمایت:");
    q.slice(0,8).forEach(({m,abs})=>{
      let t="• "+m.name;
      if(abs)t+=" — "+humanAbsLabel(abs);
      if((m.needs||[]).length)t+=" ["+(m.needs.map(n=>(NEEDS.find(x=>x[0]===n)||[n,n])[1]).join("، "))+"]";
      // never privateNote
      lines.push(t);
    });
  }else lines.push("مورد فوری در صف حمایت نیست.");
  lines.push("");
  lines.push("— بدون اطلاعات محرمانه پزشکی/خصوصی —");
  const txt=lines.join("\n");
  const o=modal('<h3 style="font-weight:800">📤 گزارش به حامی‌ها</h3><p class="role-hint">این متن برای اشتراک با حامی‌هاست و یادداشت محرمانه ندارد.</p><textarea id="supRep" rows="10" readonly style="font-size:.9em">'+esc(txt)+'</textarea><div class="row" style="margin-top:10px"><button class="btn p" style="flex:1" id="srCopy">📋 کپی</button><button class="btn g" style="flex:1" id="srShare">📤 ارسال</button></div>');
  $("#srCopy",o).onclick=()=>copyTxt(txt);
  $("#srShare",o).onclick=()=>shareTxt(txt);
}

/* جلوگیری از خطای انسانی: تأیید سریع برای عملیات حساس */
function safeConfirm(msg,fn){
  const d=Store.get();
  if(d.settings.quickConfirm===false){fn();return;}
  confirm2(msg,fn);
}

/* نوار اقدام سریع */
function quickBarHTML(){
  const u=currentUser();
  if(!u)return"";
  let h='<div class="quick-bar noprint">';
  if(can("attend"))h+='<button class="btn sm p" onclick="go(\'attend\')">✅ حضور</button>';
  if(can("attend"))h+='<button class="btn sm ghost" onclick="openEntry()">🎬 ثبت ورود</button>';
  if(can("fees"))h+='<button class="btn sm ghost" onclick="go(\'fees\')">💰 شهریه</button>';
  if(can("homework"))h+='<button class="btn sm ghost" onclick="go(\'homework\')">📚 تکلیف</button>';
  if(can("shareSupport"))h+='<button class="btn sm ghost" onclick="reportRoundToHami(1)">📤 گزارش نوبت۱</button>';
  if(can("shareSupport"))h+='<button class="btn sm ghost" onclick="reportRoundToHami(2)">📤 گزارش نوبت۲</button>';
  if(can("fees")&&can("shareSupport"))h+='<button class="btn sm ghost" onclick="reportFeesToHami()">💰 گزارش شهریه</button>';
  if(can("fees"))h+='<button class="btn sm ghost" onclick="remindUnpaidWA()">💚 یادآوری شهریه</button>';
  if(can("attend"))h+='<button class="btn sm ghost" onclick="attendRemindWA()">💬 یادآوری حضور</button>';
  if(can("shareSupport"))h+='<button class="btn sm ghost" onclick="humanHamiSummary()">🤝 خلاصه حامی</button>';
  if(can("shareSupport"))h+='<button class="btn sm ghost" onclick="weeklyDigest()">📊 هفتگی</button>';
  if(can("attend"))h+='<button class="btn sm ghost" onclick="handoffPackage()">📦 تحویل شیفت</button>';
  h+='<button class="btn sm ghost" onclick="communicationHub()">📡 ارتباطات</button>';
  if(can("report"))h+='<button class="btn sm ghost" onclick="shareStoryCard()">📸 استوری</button>';
  if(can("report"))h+='<button class="btn sm ghost" onclick="printAttendReport()">🖨 چاپ</button>';
  h+='<button class="btn sm ghost" onclick="go(\'help\')">📖 راهنما</button>';
  h+="</div>";
  return h;
}
function userBadgeHTML(){
  const u=currentUser();
  if(!u)return"";
  return'<div class="user-chip noprint" onclick="'+(can("settings")?"go(\'settings\')":"logoutUser()")+'">👤 <b>'+esc(u.name)+'</b> <span class="role-badge role-'+u.role+'">'+(ROLE_LABEL[u.role]||u.role)+'</span> '+onlineBadgeHTML()+'</div>';
}

function privacyOn(){return !!(Store.get().settings||{}).privacyMode;}
function applyPrivacy(){
  document.body.classList.toggle("privacy", privacyOn());
}
function maskPhone(p){
  if(!p)return"";
  if(!privacyOn())return p;
  const s=String(p).replace(/\s/g,"");
  if(s.length<6)return "•••";
  return s.slice(0,3)+"•••"+s.slice(-2);
}
function displayPhones(m){
  const ps=(m.phones||[]).filter(Boolean);
  if(!ps.length)return"";
  return ps.map(p=>'<span class="phone-mask mask-phone">'+esc(maskPhone(p))+"</span>").join(" · ");
}
function needTags(m){
  const ns=m.needs||[];
  if(!ns.length&&!m.careFlag)return"";
  let h="";
  if(m.careFlag)h+='<span class="need-tag support">نیازمند حمایت</span> ';
  ns.forEach(n=>{const lab=(NEEDS.find(x=>x[0]===n)||[n,n])[1];
    h+='<span class="need-tag'+(n==="sensitive"?" sensitive":"")+'">'+esc(lab)+"</span> ";});
  return h;
}
function supporterName(m){
  if(!m.supporterId)return"";
  const s=Store.get().members.find(x=>x.id===m.supporterId);
  return s?s.name:"";
}
function togglePrivacyMode(){
  const d=Store.get();d.settings.privacyMode=!d.settings.privacyMode;Store.save();
  applyPrivacy();render();
  toast(d.settings.privacyMode?"🔒 حالت حریم خصوصی روشن — عکس و شماره محو شد":"حالت حریم خصوصی خاموش");
}
function humanAbsLabel(n){
  if(n<=0)return"";
  if(n===1)return "یک جلسه بدون حضور اخیر";
  if(n<=3)return Jalali.toFa(n)+" جلسه بدون حضور — شاید نیاز به تماس حمایتی";
  return Jalali.toFa(n)+" جلسه بدون حضور — اولویت پیگیری با لحن حمایتگر";
}
function careQueue(){
  const d=Store.get();
  return d.members.filter(m=>m.careFlag||(m.needs||[]).length||absCount(m.id)>=2)
    .map(m=>({m,abs:absCount(m.id),prio:(m.careFlag?3:0)+((m.needs||[]).includes("sensitive")?2:0)+Math.min(absCount(m.id),5)}))
    .sort((a,b)=>b.prio-a.prio);
}
function roleDashboardHTML(){
  const d=Store.get();
  const supporters=d.members.filter(m=>(m.roles||[]).includes("support"));
  const followers=d.members.filter(m=>(m.roles||[]).includes("attend")||(m.roles||[]).includes("fee"));
  const q=careQueue();
  let h='<div class="card care-card fade-up"><h3>💛 هماهنگی با حامی‌ها</h3>';
  h+='<p class="role-hint">حامی‌ها = اعضای قدیمی پشتیبان مسئولان جدید و رابط با درمانگر. این بخش برای هماهنگی پیگیری‌هاست: اولویت با کرامت فرد است. یادداشت محرمانه هرگز در گزارش عمومی نمی‌آید.</p>';
  if(!q.length){h+='<div class="human-msg">همه در وضعیت پایدار به‌نظر می‌رسند. اگر کسی نیاز به حمایت دارد، از پروفایل عضو «نیازمند حمایت» را علامت بزنید.</div>';}
  else{
    h+='<div class="stagger">';
    q.slice(0,6).forEach(({m,abs})=>{
      h+='<div class="task-row" onclick="memberForm(\''+m.id+'\')"><div class="stat-ico">'+((m.needs||[]).includes("sensitive")?"🌸":"🤝")+'</div><div><div class="t-title">'+esc(m.name)+' '+needTags(m)+'</div><div class="t-sub">'+esc(humanAbsLabel(abs)||"پیگیری نرم پیشنهادی");
      const sn=supporterName(m);if(sn)h+=" · حامی: "+esc(sn);
      h+='</div></div><span class="t-go">‹</span></div>';
    });
    h+="</div>";
  }
  if(supporters.length)h+='<p class="stat-line" style="margin-top:8px">حامی‌های ثبت‌شده: '+supporters.map(s=>esc(s.name)).join("، ")+"</p>";
  h+='<div class="row" style="margin-top:8px"><button class="btn sm ghost" onclick="togglePrivacyMode()">'+(privacyOn()?"🔓 نمایش کامل":"🔒 حالت حریم خصوصی")+'</button></div></div>';
  return h;
}

function computeInsights(){
  const d=Store.get(),keys=Object.keys(d.sessions||{}).sort();
  const total=d.members.length||1;
  let presentRate=[],absentLeaders={},payRate=0,paidN=0,feeKeys=Object.keys(d.fees||{});
  keys.slice(-8).forEach(k=>{
    const s=d.sessions[k]||{};let p=0;
    d.members.forEach(m=>{const st=(s[m.id]||{}).p2||(s[m.id]||{}).p1;if(st==="present"||st==="delay")p++;if(st==="absent")absentLeaders[m.id]=(absentLeaders[m.id]||0)+1;});
    presentRate.push(Math.round(p/total*100));
  });
  const lastFee=feeKeys.sort().reverse()[0];
  if(lastFee){const f=d.fees[lastFee]||{};d.members.forEach(m=>{if(f[m.id]&&f[m.id].paid)paidN++;});payRate=Math.round(paidN/total*100);}
  const topAbs=Object.entries(absentLeaders).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id,n])=>{
    const m=d.members.find(x=>x.id===id);return m?{name:m.name,n}:null;}).filter(Boolean);
  const avg=presentRate.length?Math.round(presentRate.reduce((a,b)=>a+b,0)/presentRate.length):0;
  const trend=presentRate.length>=2?(presentRate[presentRate.length-1]-presentRate[0]):0;
  return{presentRate,avg,trend,topAbs,payRate,sessions:keys.length,spark:presentRate};
}
function ringSVG(pct,size=72){
  const r=28,c=2*Math.PI*r,off=c-(pct/100)*c;
  const col=pct>=80?"#10b981":pct>=50?"#f59e0b":"#ef4444";
  return'<div class="ring-wrap"><svg width="'+size+'" height="'+size+'" viewBox="0 0 72 72"><circle cx="36" cy="36" r="'+r+'" fill="none" stroke="var(--sf2)" stroke-width="7"/><circle cx="36" cy="36" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="7" stroke-linecap="round" stroke-dasharray="'+c+'" stroke-dashoffset="'+off+'" style="transition:stroke-dashoffset .6s"/></svg><div class="ring-val">'+Jalali.toFa(pct)+'٪</div></div>';
}
function sparkHTML(arr){
  if(!arr||!arr.length)return"";
  const mx=Math.max(100,...arr);
  return'<div class="spark">'+arr.map(v=>'<i style="height:'+Math.max(8,v/mx*100)+'%" title="'+v+'%"></i>').join("")+"</div>";
}

/* ============ v6: گفتار به متن (Web Speech API) ============ */
let _recog=null,_recActive=false;
function speechSupported(){return !!(window.SpeechRecognition||window.webkitSpeechRecognition);}
function startSpeech(targetId){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){toast("⚠️ مرورگر از تشخیص گفتار پشتیبانی نمی‌کند");return;}
  if(_recActive&&_recog){_recog.stop();return;}
  _recog=new SR();_recog.lang="fa-IR";_recog.interimResults=false;_recog.continuous=false;
  _recActive=true;
  const btn=document.querySelector("[data-speech=\""+targetId+"\"]");
  if(btn)btn.classList.add("rec");
  toast("🎤 صحبت کنید…");
  try{if(navigator.vibrate)navigator.vibrate(30);}catch(e){}
  _recog.onresult=e=>{
    const t=e.results[0][0].transcript;
    const el=document.getElementById(targetId);
    if(el){el.value=(el.value?el.value+" ":"")+t;el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}));}
    toast("✅ متن ثبت شد");
  };
  _recog.onerror=()=>toast("⚠️ تشخیص گفتار ناموفق");
  _recog.onend=()=>{_recActive=false;if(btn)btn.classList.remove("rec");};
  _recog.start();
}
function speechBtn(targetId){
  if(!speechSupported())return"";
  return'<button type="button" class="btn sm ghost chip-mic" data-speech="'+targetId+'" onclick="startSpeech(\''+targetId+'\')" aria-label="گفتار به متن">🎤</button>';
}

/* ============ v6: اعلان کلاس (Notification API) ============ */
async function enableNotifs(){
  if(!("Notification" in window)){toast("⚠️ مرورگر از اعلان پشتیبانی نمی‌کند");return;}
  let p=Notification.permission;
  if(p==="default")p=await Notification.requestPermission();
  if(p!=="granted"){toast("اجازه اعلان داده نشد");return;}
  const d=Store.get();d.settings.notif=true;Store.save();
  scheduleClassNotif();
  toast("✅ اعلان کلاس فعال شد");
}
function scheduleClassNotif(){
  const d=Store.get();
  if(!d.settings.notif||Notification.permission!=="granted")return;
  const nc=nextClass();if(!nc||!nc.t)return;
  const ms=nc.t-Date.now()-15*60e3; // 15 min before
  if(ms<0||ms>864e5*2)return;
  clearTimeout(window._notifT);
  window._notifT=setTimeout(()=>{
    try{
      new Notification(d.settings.className||"کلاس",{body:"۱۵ دقیقه تا شروع کلاس — ساعت "+(nc.c.start||""),icon:"icon.svg",tag:"mct-class"});
      if(navigator.vibrate)navigator.vibrate([80,40,80]);
    }catch(e){}
  },ms);
}

/* ============ v6: نقشه حرارتی حضور ============ */
function attendHeatmap(){
  const d=Store.get(),keys=Object.keys(d.sessions||{}).sort().slice(-28);
  if(!keys.length)return'<p class="stat-line">هنوز جلسه‌ای ثبت نشده</p>';
  const days=["ش","ی","د","س","چ","پ","ج"];
  let h='<div class="heat">'+days.map(x=>'<div class="hd">'+x+'</div>').join("");
  // pad start based on first session dow
  const first=Jalali.fromKey(keys[0]);const firstDow=Jalali.dow(first);
  for(let i=0;i<firstDow;i++)h+='<div class="c" style="opacity:.25"></div>';
  keys.forEach(k=>{
    const s=d.sessions[k]||{};let p=0,t=d.members.length||1;
    d.members.forEach(m=>{const st=(s[m.id]||{}).p2||(s[m.id]||{}).p1;if(st==="present"||st==="delay")p++;});
    const pct=p/t*100;let lv=pct>=90?"lv4":pct>=70?"lv3":pct>=40?"lv2":pct>0?"lv1":"";
    const j=Jalali.fromKey(k);
    h+='<div class="c '+lv+'" title="'+Jalali.fmt(j)+' — '+Math.round(pct)+'٪" onclick="setSel(\''+k+'\');go(\'attend\')"></div>';
  });
  h+="</div>";
  return h;
}

/* ============ v6: خروجی تقویم ICS ============ */
function exportICS(){
  const d=Store.get(),lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//MCT//My-Class-Track//FA","CALSCALE:GREGORIAN"];
  const name=d.settings.className||"کلاس";
  // next 8 weeks of regular classes
  const now=new Date();
  for(let i=0;i<56;i++){
    const dt=new Date(now);dt.setDate(now.getDate()+i);const dw=(dt.getDay()+1)%7;
    for(const c of d.classes){
      if(c.dow!==dw)continue;
      const[h,mi]=(c.start||"19:00").split(":").map(Number);
      const[eh,emi]=(c.end||"21:00").split(":").map(Number);
      const start=new Date(dt);start.setHours(h,mi,0,0);
      const end=new Date(dt);end.setHours(eh,emi,0,0);
      const fmt=x=>x.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
      lines.push("BEGIN:VEVENT","UID:mct-"+fmt(start)+"@mct","DTSTAMP:"+fmt(new Date()),"DTSTART:"+fmt(start),"DTEND:"+fmt(end),"SUMMARY:"+name,"DESCRIPTION:جلسه کلاس — My-Class-Track","END:VEVENT");
    }
  }
  (d.extra||[]).forEach(ex=>{
    const j=Jalali.fromKey(ex.key);const g=Jalali.toG(j.jy,j.jm,j.jd);
    const[h,mi]=(ex.start||"19:00").split(":").map(Number);
    const[eh,emi]=(ex.end||"21:00").split(":").map(Number);
    const start=new Date(g.gy,g.gm-1,g.gd,h,mi);const end=new Date(g.gy,g.gm-1,g.gd,eh,emi);
    const fmt=x=>{const p=n=>String(n).padStart(2,"0");return x.getFullYear()+p(x.getMonth()+1)+p(x.getDate())+"T"+p(x.getHours())+p(x.getMinutes())+"00";};
    lines.push("BEGIN:VEVENT","UID:mct-ex-"+ex.key+"@mct","DTSTAMP:"+fmt(new Date()),"DTSTART:"+fmt(start),"DTEND:"+fmt(end),"SUMMARY:"+name+" (جلسه خاص)","END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  const blob=new Blob([lines.join("\r\n")],{type:"text/calendar;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="mct-schedule.ics";a.click();
  toast("✅ تقویم دانلود شد — در تقویم گوشی Import کنید");
}

/* ============ v6: کد اشتراک کلاس (QR via API when online) ============ */
function shareClassCode(){
  const d=Store.get();
  const payload={v:1,name:d.settings.className||"کلاس",n:d.members.length,cls:d.classes};
  const text="My-Class-Track\n"+(d.settings.className||"کلاس")+"\nاعضا: "+d.members.length+"\nبرنامه: "+(d.classes.map(c=>Jalali.DN[c.dow]+" "+c.start).join(" | "));
  const o=modal('<h3 style="font-weight:800">📤 اشتراک کلاس</h3><p class="stat-line">کد یا لینک را برای همکار بفرستید</p><div style="text-align:center" id="qrWrap"><div class="skeleton" style="width:160px;height:160px;margin:8px auto"></div></div><textarea id="shareCode" rows="4" readonly style="margin-top:8px;font-size:.85em">'+esc(text)+'</textarea><div class="row" style="margin-top:10px"><button class="btn p" style="flex:1" id="shCopy">📋 کپی</button><button class="btn ghost" style="flex:1" id="shShare">📤 ارسال</button></div>');
  $("#shCopy",o).onclick=()=>copyTxt(text);
  $("#shShare",o).onclick=()=>shareTxt(text);
  // QR image when online
  const qrUrl="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data="+encodeURIComponent(text.slice(0,300));
  const img=new Image();img.alt="QR";img.className="qr-box";img.onload=()=>{const w=$("#qrWrap",o);if(w)w.innerHTML="";if(w)w.appendChild(img);};
  img.onerror=()=>{const w=$("#qrWrap",o);if(w)w.innerHTML='<p class="stat-line">QR در حالت آفلاین در دسترس نیست — از کپی متن استفاده کنید</p>';};
  img.src=qrUrl;
}

/* ============ v6: بینش کامل (مودال) ============ */
function showInsights(){
  const ins=computeInsights();
  const top=ins.topAbs.length?ins.topAbs.map(x=>esc(x.name)+" ("+Jalali.toFa(x.n)+" غیبت)").join("، "):"—";
  const trendTxt=ins.trend>0?"📈 روند صعودی (+"+Jalali.toFa(ins.trend)+"٪)":ins.trend<0?"📉 روند نزولی ("+Jalali.toFa(ins.trend)+"٪)":"➡️ روند پایدار";
  modal('<h3 style="font-weight:800">✨ بینش هوشمند <span class="badge-ai">AI</span></h3>'+
    '<div class="row" style="gap:14px;margin:12px 0;align-items:center">'+ringSVG(ins.avg)+'<div style="flex:1"><b>میانگین حضور</b><div class="stat-line">'+trendTxt+'</div>'+sparkHTML(ins.spark)+'</div></div>'+
    '<div class="insight"><div class="ic"><span>جلسات ثبت‌شده</span><b>'+Jalali.toFa(ins.sessions)+'</b></div><div class="ic"><span>پرداخت شهریه</span><b>'+Jalali.toFa(ins.payRate)+'٪</b></div></div>'+
    '<p class="stat-line" style="margin-top:8px"><b>بیشترین غیبت:</b> '+top+'</p>'+
    '<h3 style="margin-top:14px">🗓 نقشه حضور (۴ هفته)</h3>'+attendHeatmap()+
    '<div class="row" style="margin-top:14px;gap:8px"><button class="btn sm ghost" style="flex:1" onclick="exportICS()">📅 خروجی تقویم</button><button class="btn sm ghost" style="flex:1" onclick="shareClassCode()">📲 اشتراک</button></div>');
}

function printAttendReport(key){
  const d=Store.get();key=key||sessionSel();
  if(!key){toast("⚠️ جلسه‌ای انتخاب نشده");return;}
  const s=d.sessions[key]||{};
  const title=(d.settings.className||"کلاس")+" — گزارش حضور "+Jalali.fmt(Jalali.fromKey(key));
  let rows="";
  for(const m of d.members){
    const c=s[m.id]||{};
    const p1=ST.lbl[c.p1||"none"], p2=ST.lbl[c.p2||"none"];
    rows+="<tr><td>"+esc(m.name)+"</td><td>"+p1+(c.time?" ("+Jalali.toFa(c.time)+")":"")+"</td><td>"+p2+(c.time2?" ("+Jalali.toFa(c.time2)+")":"")+"</td><td>"+esc(c.note2||c.note||"")+"</td></tr>";
  }
  const html=`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>${esc(title)}</title>
  <style>
  body{font-family:Tahoma,sans-serif;padding:24px;color:#111;font-size:13px}
  h1{font-size:18px;margin:0 0 4px} .sub{color:#555;margin-bottom:16px}
  table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:8px;text-align:right}
  th{background:#f0f4ff} .foot{margin-top:20px;font-size:11px;color:#666}
  @media print{button{display:none}}
  </style></head><body>
  <button onclick="window.print()" style="padding:10px 16px;margin-bottom:12px;font-family:inherit;cursor:pointer">🖨 چاپ / ذخیره PDF</button>
  <h1>${esc(title)}</h1>
  <div class="sub">تعداد اعضا: ${Jalali.toFa(d.members.length)} — تاریخ چاپ: ${Jalali.fmt(Jalali.today())}</div>
  <table><thead><tr><th>نام</th><th>تماس قبلی</th><th>ثبت ورود</th><th>یادداشت</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <div class="foot">My-Class-Track — گزارش خودکار</div>
  <script>setTimeout(()=>window.print(),400)<\/script>
  </body></html>`;
  const w=window.open("","_blank");
  if(!w){toast("⚠️ پاپ‌آپ مسدود است");return;}
  w.document.write(html);w.document.close();
}


function setClassName(v){const d=Store.get();d.settings.className=(v||"").trim()||"کلاس من";Store.save();
document.querySelector(".htitle")&&(document.querySelector(".htitle").textContent=d.settings.className);
toast("✅ نام کلاس ذخیره شد");}
function addGroup(){
  const name=prompt("نام گروه جدید:");
  if(!name||!name.trim())return;
  const d=Store.get();
  if(d.groups.includes(name.trim())){toast("این گروه از قبل هست");return;}
  d.groups.push(name.trim());Store.save();render();toast("✅ گروه اضافه شد");
}
function delGroup(g){
  if(g==="عمومی"){toast("گروه «عمومی» قابل حذف نیست");return;}
  confirm2("گروه «"+g+"» حذف شود؟ اعضای آن به عمومی منتقل می‌شوند",()=>{
    const d=Store.get();
    d.groups=d.groups.filter(x=>x!==g);
    d.members.forEach(m=>{if(m.group===g)m.group="عمومی";});
    Store.save();render();
  });
}

/* ============ روتر ============ */
const NAV=[["home","خانه",ICONS.home],["attend","حضور",ICONS.check],["fees","شهریه",ICONS.coin],["members","اعضا",ICONS.users],["more","بیشتر","☰"]];
function render(){
try{const rp=document.querySelector(".route-progress");if(rp)rp.remove();const bar=document.createElement("div");bar.className="route-progress";document.body.appendChild(bar);setTimeout(()=>bar.remove(),400);}catch(e){}

try{applyAutoTheme();applyTheme();applyColor();applyFS();applyPrivacy();applyA11yFocus();applyOled();bindShortcuts();}catch(e){console.warn(e);}
const d0=Store.get();
if(d0.settings&&d0.settings.requireLogin&&!currentUser()&&route!=="login"){route="login";}
if(route==="login"){
  document.getElementById("hdr").style.display="none";
  document.getElementById("nav").style.display="none";
  const fabL=document.getElementById("fabAi");if(fabL)fabL.remove();
  const elL=$("#app");elL.className="page";
  try{Pages.login(elL);}catch(e){elL.innerHTML='<div class="card">خطا در ورود</div>';}
  return;
}
const ht=document.querySelector(".htitle");if(ht)ht.textContent=(Store.get().settings.className||"My-Class-Track");
const hs=document.querySelector(".hsub");if(hs)hs.textContent=(typeof pageTitleFor==="function"?pageTitleFor(route):"گروه درمانی");
let fab=document.getElementById("fabAi");
if(route==="entry"){if(fab)fab.remove();}
else if(!fab){fab=document.createElement("button");fab.id="fabAi";fab.className="fab-ai";fab.title="بینش هوشمند";fab.innerHTML="✨";fab.onclick=showInsights;document.body.appendChild(fab);}
try{scheduleClassNotif();}catch(e){}
document.getElementById("hdr").style.display=route==="entry"?"none":"";
document.getElementById("nav").style.display=route==="entry"?"none":"";
const bb=document.getElementById("backBtn");if(bb)bb.style.display=(route!=="home"&&route!=="login")?"":"none";
if(route==="entry"){try{renderEntry();}catch(e){console.warn(e);}return;}
 $("#nav").innerHTML=buildNavHTML();
const el=$("#app");el.className="page";
try{(Pages[route]||Pages.home)(el);wireHomeSplit();wireMineToggle(route==="fees"?"fee":"attend");}catch(err){console.warn(err);el.innerHTML='<div class="card"><h3>⚠️ خطا</h3><button class="btn p" onclick="go(\'home\')">خانه</button></div>';}
window.scrollTo(0,0);}
window.render=render;
window.openEntry=openEntry;window.exitEntry=exitEntry;window.toggleEntryFilter=toggleEntryFilter;
window.showReport=showReport;window.feeReport=feeReport;
window.togglePay=togglePay;window.exportCSV=exportCSV;
window.pickHWDate=pickHWDate;window.saveHW=saveHW;window.delHW=delHW;window.copyHW=copyHW;
window.memberForm=memberForm;window.delMember=delMember;window.renderMembers=renderMembers;
window.addClass=addClass;window.delClass=delClass;window.setTheme=setTheme;window.toggleTheme=toggleTheme;
window.setFS=setFS;window.backup=backup;window.restore=restore;window.wipeAll=wipeAll;
window.copyTxt=copyTxt;window.toggleCallFilter=toggleCallFilter;
window.setColor=setColor;window.toggleSound=toggleSound;window.shareBackup=shareBackup;
window.toggleFS=toggleFS;window.goBack=goBack;
window.printAttendReport=printAttendReport;window.showInsights=showInsights;window.togglePrivacyMode=togglePrivacyMode;window.logoutUser=logoutUser;window.userForm=userForm;window.delUser=delUser;window.reportForSupporters=reportForSupporters;window.reportRoundToHami=reportRoundToHami;window.reportFeesToHami=reportFeesToHami;window.periodForm=periodForm;window.toggleDoorCheck=toggleDoorCheck;window.loginUser=loginUser;window.remindUnpaidWA=remindUnpaidWA;window.attendRemindWA=attendRemindWA;window.shareStoryCard=shareStoryCard;window.humanHamiSummary=humanHamiSummary;window.toggleFocusMode=toggleFocusMode;window.toggleA11y=toggleA11y;window.tgShare=tgShare;window.celebrate=celebrate;window.autoSplitTasks=autoSplitTasks;window.clearSplit=clearSplit;window.openCommandPalette=openCommandPalette;window.weeklyDigest=weeklyDigest;window.copyPrevSession=copyPrevSession;window.transferMyTasks=transferMyTasks;window.toggleOled=toggleOled;window.togglePin=togglePin;window.reassignMember=reassignMember;window.performUndo=performUndo;window.handoffPackage=handoffPackage;window.showMemberTimeline=showMemberTimeline;window.teamBoardHTML=teamBoardHTML;window.setListFilter=setListFilter;window.toggleBatchPick=toggleBatchPick;window.batchSetAtt=batchSetAtt;window.clearBatch=clearBatch;window.openBatchPicker=openBatchPicker;window.communicationHub=communicationHub;window.hubTilesHTML=hubTilesHTML;window.celebrateConfetti=celebrateConfetti;window.compactSyncExport=compactSyncExport;window.editTemplates=editTemplates;window.toggleAutoTheme=toggleAutoTheme;window.logActivity=logActivity;window.careQueue=careQueue;window.startSpeech=startSpeech;window.enableNotifs=enableNotifs;window.exportICS=exportICS;window.shareClassCode=shareClassCode;window.scheduleClassNotif=scheduleClassNotif;window.pruneSessions=pruneSessions;window.storageInfo=storageInfo;
window.setClassName=setClassName;window.addGroup=addGroup;window.delGroup=delGroup;

if(Store.get().settings.requireLogin&&!currentUser())route="login";
render();
try{scheduleClassNotif();}catch(e){}

if("serviceWorker" in navigator&&location.protocol.indexOf("http")===0)
navigator.serviceWorker.register("sw.js").catch(()=>{});
window.addEventListener("online",()=>{toast("🟢 آنلاین شدید");render();});
window.addEventListener("offline",()=>{toast("🔴 آفلاین — داده محلی امن است");render();});