/* pages part 3/3 */
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

window.addEventListener("popstate",e=>{
route=(e.state&&e.state.route)||"home";
if(Store.get().settings.requireLogin&&!currentUser())route="login";
resetUI();window._t&&clearInterval(window._t);window._tick=null;render();});
