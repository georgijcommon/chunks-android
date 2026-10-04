/*@@CRE@@*/
/*@@ICONS@@*/
/*@@PICS@@*/
/*@@B2@@*/
/*@@AUDIO@@*/
const AVOICES=[['us_f','Американский · женский'],['us_m','Американский · мужской'],['uk_f','Британский · женский'],['uk_m','Британский · мужской']];
const STAGES=[
 {n:'Львёнок',cefr:'A1',w:0,gen:'Львёнка'},{n:'Молодой лев',cefr:'A2',w:500,gen:'Молодого льва'},
 {n:'Лев',cefr:'B1',w:1200,gen:'Льва'},{n:'Гривастый лев',cefr:'B1+',w:2200,gen:'Гривастого льва'},
 {n:'Крылатый лев',cefr:'B2',w:3500,gen:'Крылатого льва'},{n:'Грифон',cefr:'C1',w:5000,gen:'Грифона'},
 {n:'Королевский грифон',cefr:'C2',w:8000,gen:'Королевского грифона'},{n:'Повелитель зверей',cefr:'C2+',w:12000,gen:'Повелителя зверей'},
 {n:'Грифон в тёмных очках',cefr:'C2+',w:16000,gen:'Грифона в тёмных очках'},{n:'Тысячелетняя легенда',cefr:'—',w:20000,gen:'Тысячелетней легенды'}];
const COLLS=[
 {id:'travel',name:'Путешествия',kind:'w',icon:'suitcase',unit:['слово','слова','слов']},
 {id:'cafe',name:'Кафе и кухня',kind:'w',icon:'cup',unit:['слово','слова','слов']},
 {id:'talk',name:'Small talk',kind:'c',icon:'chat',unit:['чанк','чанка','чанков']}];
const WU=['слово','слова','слов'];
[['ch','Характер и поведение','p:conceit'],['em','Эмоции и чувства','p:forlorn'],['so','Общество и закон','p:condemn'],['na','Природа и погода','p:glacier'],['bo','Тело и здоровье','p:syringe'],['ho','Дом и вещи','p:valve'],['wk','Работа и деньги','p:entrepreneur'],['ac','Действия и движение','p:thrash'],['ta','Речь и мысль','p:cajole'],['pe','Люди и культура','p:sermon'],['sz','Размер и количество','p:pivot'],['tm','Время и логика','p:obsolete'],['ql','Свойства и состояния','p:blemish']].forEach(x=>COLLS.push({id:x[0],name:x[1],kind:'w',icon:x[2],unit:WU}));
const W=(id,coll,en,ipa,ru,ex,exr,icon)=>({id,coll,k:'w',en,ipa,ru,ex,exr,icon});
const C=(id,en,ru,ex,exr,d,icon)=>({id,coll:'talk',k:'c',en,ru,ex,exr,d,icon:icon||'chat'});
const SEED=[
 W('t1','travel','lighthouse','/ˈlaɪthaʊs/','маяк','The old lighthouse guided ships safely home.','Старый маяк безопасно направлял корабли домой.','lighthouse'),
 W('t2','travel','suitcase','/ˈsuːtkeɪs/','чемодан','She packed her suitcase the night before.','Она собрала чемодан накануне вечером.','suitcase'),
 W('t3','travel','ticket','/ˈtɪkɪt/','билет','I lost my train ticket at the station.','Я потерял билет на поезд на вокзале.','ticket'),
 W('t4','travel','map','/mæp/','карта','Check the map before we leave.','Посмотри на карту, прежде чем мы выедем.','map'),
 W('t5','travel','umbrella','/ʌmˈbrelə/','зонт','Take an umbrella, it might rain.','Возьми зонт, может пойти дождь.','umbrella'),
 W('t6','travel','key','/kiː/','ключ','I left the key at the hotel.','Я оставил ключ в отеле.','key'),
 W('t7','travel','sun','/sʌn/','солнце','The sun rises over the sea.','Солнце встаёт над морем.','sun'),
 W('t8','travel','moon','/muːn/','луна','We watched the moon from the deck.','Мы смотрели на луну с палубы.','moon'),
 W('t9','travel','home','/həʊm/','дом','It is good to be back home.','Хорошо вернуться домой.','house'),
 W('t10','travel','luggage','/ˈlʌɡɪdʒ/','багаж','Our luggage arrived late.','Наш багаж приехал поздно.'),
 W('t11','travel','passport','/ˈpɑːspɔːt/','паспорт','Keep your passport in a safe place.','Храни паспорт в надёжном месте.'),
 W('t12','travel','departure','/dɪˈpɑːtʃə/','отправление','Departure is at nine in the morning.','Отправление в девять утра.'),
 W('t13','travel','delay','/dɪˈleɪ/','задержка','There is a short delay at the gate.','У выхода небольшая задержка.'),
 W('c1','cafe','cup','/kʌp/','чашка','A cup of hot tea, please.','Чашку горячего чая, пожалуйста.','cup'),
 W('c2','cafe','bread','/bred/','хлеб','The bread here is still warm.','Хлеб здесь ещё тёплый.','bread'),
 W('c3','cafe','apple','/ˈæpl/','яблоко','I would like an apple pie.','Я бы хотел яблочный пирог.','apple'),
 W('c4','cafe','book','/bʊk/','книга','She reads a book over breakfast.','Она читает книгу за завтраком.','book'),
 W('c5','cafe','menu','/ˈmenjuː/','меню','Could we see the menu, please?','Можно нам посмотреть меню?'),
 W('c6','cafe','bill','/bɪl/','счёт','Can we have the bill, please?','Можно нам счёт, пожалуйста?'),
 W('c7','cafe','receipt','/rɪˈsiːt/','чек','Keep the receipt for the refund.','Сохрани чек для возврата денег.'),
 W('c8','cafe','tip','/tɪp/','чаевые','We left a generous tip.','Мы оставили щедрые чаевые.'),
 W('c9','cafe','sugar','/ˈʃʊɡə/','сахар','No sugar in my coffee, thanks.','Без сахара в моём кофе, спасибо.'),
 W('c10','cafe','napkin','/ˈnæpkɪn/','салфетка','Could I have a napkin?','Можно мне салфетку?'),
 C('s1','break the ice','разрядить обстановку','A joke helped us break the ice.','Шутка помогла нам разрядить обстановку.',['cold','wall','glass','snow'],'ice'),
 C('s2','how is it going','как дела','Hi Anna, how is it going?','Привет, Анна, как дела?',['was','doing','are']),
 C('s3','nice to meet you','приятно познакомиться','Nice to meet you, I am Max.','Приятно познакомиться, я Макс.',['see','glad','nicely']),
 C('s4','long time no see','давно не виделись','Hey Tom, long time no see!','Привет, Том, давно не виделись!',['short','ago','meet']),
 C('s5','what do you do','чем вы занимаетесь','So, what do you do?','Итак, чем вы занимаетесь?',['does','are','work']),
 C('s6','let me know','дай мне знать','Let me know when you arrive.','Дай мне знать, когда приедешь.',['tell','you','make']),
 C('s7','it is up to you','решать тебе','Pizza or pasta? It is up to you.','Пицца или паста? Решать тебе.',['on','down','me']),
 C('s8','no worries','без проблем','Sorry I am late. No worries!','Извини, я опоздал. Без проблем!',['worry','not','thanks']),
 C('s9','I am just looking','я просто смотрю','No, thanks, I am just looking.','Нет, спасибо, я просто смотрю.',['see','only','watching']),
 C('s10','sounds good to me','мне подходит','Six o’clock? Sounds good to me.','В шесть? Мне подходит.',['great','for','sound'])];

const A2S=new Set(['t1','t2','t3','t4','t5','t6','t7','t8','t9','t10','t11','c1','c2','c3','c4','c5','c6','s2','s3','s8']);
SEED.forEach(x=>x.lv=A2S.has(x.id)?'A2':'B1');
B2.forEach((r,i)=>SEED.push({id:'b'+i,coll:r[0],k:'w',en:r[1],ipa:'',ru:r[2],ex:'',exr:'',icon:'p:'+r[1],lv:'B2'}));
const LVLS=['A2','B1','B2'];
/* ---------- state ---------- */
const KEY='frost43.v1';
let P={lvl:{},added:[],bm:{},name:'',bonus:0,seen:0,voice:'app:us_f',srs:{},newToday:{d:'',n:0},cf:'',goal:10,today:null,anim:'calm'};
try{const r=localStorage.getItem(KEY);if(r)P=Object.assign(P,JSON.parse(r))}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(P))}catch(e){}};
const ALL=()=>SEED.concat(P.added);
const ITEMS=()=>ALL().filter(x=>!P.cf||(x.lv||'B1')===P.cf);
const ring=(ic,f)=>{const R=31,C=2*Math.PI*R;return `<span class="rw" role="img" aria-label="выучено ${Math.round(f*100)}%"><svg viewBox="0 0 68 68" width="68" height="68" aria-hidden="true"><circle cx="34" cy="34" r="${R}" fill="none" stroke="#D5E0E8" stroke-width="4"/><circle cx="34" cy="34" r="${R}" fill="none" stroke="${f>=1?'#F2C66B':'#5FCFC0'}" stroke-width="4" stroke-linecap="round" opacity="${f>0?1:0}" stroke-dasharray="${(C*f).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 34 34)" style="transition:stroke-dasharray .6s"/></svg><span class="cico">${icon(ic,36)}</span></span>`};
const lvChips=()=>`<div class="chips lvc"><button class="chip${P.cf?'':' on'}" data-act="cf" data-l="">Все уровни</button>${LVLS.map(l=>`<button class="chip${P.cf===l?' on':''}" data-act="cf" data-l="${l}">${l}</button>`).join('')}</div>`;
/*@@ANIMW@@*/
function smilGate(){let off=P.anim==='off';try{off=off||matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}document.querySelectorAll('.dome svg').forEach(s=>{try{off?s.pauseAnimations():s.unpauseAnimations()}catch(e){}})}
function applyAnim(){const a=document.getElementById('app');if(!a)return;['calm','lively','once','off'].forEach(k=>a.classList.remove('tempo-'+k));a.classList.add('tempo-'+(P.anim||'calm'))}
const lvl=id=>P.lvl[id]||0;
const learnedN=()=>ALL().filter(x=>lvl(x.id)>=2).length+P.bonus;
const stageOf=n=>{let s=0;STAGES.forEach((x,i)=>{if(n>=x.w)s=i});return s};
const plural=(n,[a,b,c])=>{const m=n%100,d=n%10;return m>10&&m<20?c:d===1?a:d>1&&d<5?b:c};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const sample=(a,n)=>shuffle(a).slice(0,n);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const nf=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'\u00A0');

/* ---------- svg helpers ---------- */
const cre=(i,s,vb)=>`<svg viewBox="${vb||'0 0 200 200'}" width="${s}" height="${s}" aria-hidden="true">${CRE[i]}</svg>`;
const headSvg=i=>cre(i,40,'28 14 144 144');
const icon=(k,s)=>`<svg viewBox="0 0 200 200" width="${s}" height="${s}" aria-hidden="true">${ICONS[k]}</svg>`;
const I={
 back:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
 close:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 next:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
 user:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="9" r="3.6"/><path d="M5 20c1.2-3.6 4-5 7-5s5.8 1.4 7 5"/></svg>',
 plus:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
 spk:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16.5 9a4 4 0 010 6"/></svg>',
 bm:f=>`<svg width="22" height="22" viewBox="0 0 24 24" fill="${f?'currentColor':'none'}" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M6 4h12v17l-6-4.5L6 21z"/></svg>`,
 ok:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
 okS:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
 x:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 search:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#56677A" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>',
 spark:(c,s)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1l2.2 8.8L23 12l-8.8 2.2L12 23l-2.2-8.8L1 12l8.8-2.2z" fill="${c}"/></svg>`
};
const TABS=[
 ['home','Главная','<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/></svg>'],
 ['today','Сегодня','<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 8 8" stroke-width="3"/><path d="M9 12l2 2 4-4"/></svg>'],
 ['dojo','Додзе','<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6.5h18M5.5 10h13M7 6.5V20M17 6.5V20M12 3.5v3"/></svg>'],
 ['train','Тренировка','<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/></svg>'],
 ['progress','Прогресс','<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="16" rx="3"/><path d="M9 9h6M9 13h6M9 17h3"/></svg>']];
const TINTS=['#EEF5FB','#F1EFFD','#E9F8F5','#FDEFF2','#FFF6DF'];
const tint=id=>TINTS[[...id].reduce((a,c)=>a+c.charCodeAt(0),0)%TINTS.length];
const tileHtml=(it,s)=>`<span class="tile" style="width:${s||44}px;height:${s||44}px;flex:0 0 ${s||44}px;background:${tint(it.id)}">${it.icon?icon(it.icon,Math.round((s||44)*.8)):`<b>${esc(it.en[0].toUpperCase())}</b>`}</span>`;
const collOf=id=>COLLS.find(c=>c.id===id);

/* ---------- greetings ---------- */
const HI=['привет','здравствуй','приветствую тебя','рад тебя видеть','добро пожаловать','салют'];
let greet=null;
function newGreet(){
  const s=STAGES[stageOf(learnedN())];
  const w2=(P.name&&Math.random()<.5)?P.name:s.n.toLowerCase();
  const w1=pick(HI);greet=w1[0].toUpperCase()+w1.slice(1)+', '+w2;
}
function timeHello(){const h=new Date().getHours();return h>=5&&h<12?'Доброе утро':h<18?'Добрый день':h<23?'Добрый вечер':'Доброй ночи'}

/* ---------- navigation ---------- */
const app=document.getElementById('app');
let nav=[{v:'home'}];let ov=null;let toastT=null;
const cur=()=>nav[nav.length-1];
const isTab=v=>TABS.some(t=>t[0]===v);
function go(v,p){nav.push(Object.assign({v},p||{}));render()}
function back(){if(nav.length>1)nav.pop();render()}
function tab(v){nav=[{v}];if(v==='home')newGreet();render()}
function toast(t){const o=document.querySelector('.toast');if(o)o.remove();const d=document.createElement('div');d.className='toast';d.setAttribute('role','status');d.textContent=t;app.appendChild(d);clearTimeout(toastT);toastT=setTimeout(()=>d.remove(),2200)}
const enVoices=()=>{try{return speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang))}catch(e){return[]}};
let curAudio=null;
function speak(t,id){
  try{if(curAudio){curAudio.pause();curAudio=null}}catch(e){}
  const pv=(!P.voice||P.voice.startsWith('app:'))?(P.voice||'app:us_f').slice(4):null;
  if(pv&&id&&AUDIO[pv]&&AUDIO[pv][id]){try{curAudio=new Audio('data:audio/mpeg;base64,'+AUDIO[pv][id]);curAudio.play().catch(()=>deviceSpeak(t));return}catch(e){}}
  deviceSpeak(t)}
function deviceSpeak(t){try{const u=new SpeechSynthesisUtterance(t);const v=enVoices().find(v=>v.voiceURI===P.voice);if(v){u.voice=v;u.lang=v.lang}else u.lang='en-US';u.rate=.9;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
try{speechSynthesis.onvoiceschanged=()=>{if(ov&&ov.n==='profile'){const keep=document.getElementById('nm');const val=keep?keep.value:'';renderOv();const n=document.getElementById('nm');if(n)n.value=val}}}catch(e){}
function tabbar(a){return `<nav class="tabs" aria-label="Разделы">${TABS.map(t=>`<button class="tab${t[0]===a?' on':''}" data-act="tab" data-v="${t[0]}" aria-label="${t[1]}"${t[0]===a?' aria-current="page"':''}>${t[2]}</button>`).join('')}</nav>`}

/* level-up */
let pending=false;
function checkLevel(){const s=stageOf(learnedN());if(s>P.seen){P.seen=s;save();pending=s}}
function flushLevel(){if(pending!==false){const s=pending;pending=false;ov={n:'lvl',s};renderOv()}}

/* ---------- screens ---------- */
function vHome(){
  const n=learnedN(),si=stageOf(n),s=STAGES[si],nx=STAGES[si+1];
  const colls=COLLS.map(c=>{const it=ITEMS().filter(x=>x.coll===c.id);if(!it.length)return '';const d=it.filter(x=>lvl(x.id)>=2).length;
    return `<button class="coll" data-act="coll" data-id="${c.id}">${ring(c.icon,it.length?d/it.length:0)}<span class="t"><b>${c.name}</b><span>${it.length} ${plural(it.length,c.unit)} · выучено ${d}</span></span><span class="pc">${it.length?Math.round(d/it.length*100):0}%</span></button>`}).join('');
  const cap=nx?`до «${nx.gen}» — ${nf(nx.w-n)} ${plural(nx.w-n,['слово','слова','слов'])}`:'высший этап пройден';
  const stars=[['#FFE29A',14,30,70],['#5FCFC0',6,22,100],['#9AA0F2',7,310,160],['#F3B6C0',6,320,76],['#FFE29A',12,300,40]].map(x=>`<span class="spark" style="left:${x[2]}px;top:${x[3]}px;animation-delay:${x[1]/10}s">${I.spark(x[0],x[1])}</span>`).join('');
  const pct=nx?Math.round((n-s.w)/(nx.w-s.w)*100):100;
  return `<div class="scr"><div class="pad row sp"><div><h1>${esc(greet)}</h1></div><button class="ibtn" data-act="profile" aria-label="Профиль">${I.user}</button></div>
  <div class="pager" id="pager">
   <section class="slide" aria-label="Твой этап"><div class="tl eyebrow">${s.cefr} · этап ${si+1} из 10</div><button class="ibtn go" data-act="tab" data-v="progress" aria-label="К прогрессу">${I.next}</button><div class="orb"></div><svg class="pring" viewBox="0 0 168 168" width="168" height="168" role="img" aria-label="До следующего этапа: ${pct}%"><circle cx="84" cy="84" r="80" fill="none" stroke="#D5E0E8" stroke-width="5"/><circle cx="84" cy="84" r="80" fill="none" stroke="${nx?'#5FCFC0':'#F2C66B'}" stroke-width="5" stroke-linecap="round" opacity="${pct>0?1:0}" stroke-dasharray="${(502.65*pct/100).toFixed(1)} 502.65" transform="rotate(-90 84 84)"/></svg><div class="hero">${cre(si,150)}</div><div class="cap">${cap}</div></section>
   <section class="slide" aria-label="Слов выучено" style="padding:22px 24px"><div class="eyebrow">Всего выучено</div><div class="row" style="align-items:baseline;gap:10px;margin-top:18px"><span class="big">${nf(n)}</span><span style="font-family:var(--serif);font-size:26px;color:var(--muted)">/ ${nf(nx?nx.w:s.w)}</span></div><div style="color:var(--muted);margin-top:4px">слов и чанков · уровень ${s.cefr}</div><div class="bar" style="margin-top:22px"><i style="width:${Math.max(pct,2)}%"></i></div><div class="row sp" style="margin-top:10px;font-size:13px;color:var(--muted)"><span>Этап ${si+1} из 10</span><span>${nx?'до следующего — '+nf(nx.w-n):'максимум'}</span></div>${stars}</section>
  </div><div class="dots" id="dots"><i class="on"></i><i></i></div>
  <div class="sec"><h2>Коллекции</h2><button class="link" data-act="tab" data-v="list">Все</button></div>${lvChips()}${colls}</div>${tabbar('home')}`}

function vColl(p){
  const c=collOf(p.id),items=ITEMS().filter(x=>x.coll===c.id),d=items.filter(x=>lvl(x.id)>=2).length;
  if(!p.n)p.n=40;
  const rows=items.slice(0,p.n).map((x,i)=>rowHtml(x,`data-act="study" data-id="${c.id}" data-i="${i}"`)).join('');
  return `<div class="scr"><div class="topbar"><button class="ibtn bare" data-act="back" aria-label="Назад">${I.back}</button><div class="eyebrow m">Коллекция</div><button class="ibtn bare" data-act="add" data-c="${c.id}" aria-label="Добавить">${I.plus}</button></div>
  <div class="pad" style="margin-top:8px"><h1>${c.name}</h1><div style="color:var(--muted);margin-top:6px">${items.length} ${plural(items.length,c.unit)} · выучено ${d}</div>
  <div class="bar" style="margin-top:14px"><i style="width:${items.length?Math.max(d/items.length*100,2):0}%"></i></div>
  <div class="btns" style="margin-top:20px"><button class="btn" data-act="study" data-id="${c.id}" data-i="-1">Учить</button><button class="btn dark" data-act="quiz" data-id="${c.id}">Тренировка</button></div></div>
  <div style="margin-top:12px">${rows}${items.length>p.n?`<button class="btn full more" data-act="more">Показать ещё (${items.length-p.n})</button>`:''}</div></div>${tabbar('home')}`}

function rowHtml(x,attr){const l=lvl(x.id);
  return `<button class="irow" ${attr}>${tileHtml(x)}<span class="t"><b>${esc(x.en)}</b><span>${esc(x.ru)}</span></span><em class="cf">${x.lv||'B1'}</em><span class="lv" aria-label="уровень ${l} из 3">${[1,2,3].map(n=>`<i class="${l>=n?'on':''}"></i>`).join('')}</span></button>`}

let listF={q:'',c:'',n:40};
function listRows(){
  const q=listF.q.trim().toLowerCase();
  const it=ITEMS().filter(x=>(!listF.c||x.coll===listF.c)&&(!q||x.en.toLowerCase().includes(q)||x.ru.toLowerCase().includes(q)));
  window.__list=it;
  if(!listF.n)listF.n=40;
  return it.length?it.slice(0,listF.n).map((x,i)=>rowHtml(x,`data-act="open" data-i="${i}"`)).join('')+(it.length>listF.n?`<button class="btn full more" data-act="lmore">Показать ещё (${it.length-listF.n})</button>`:''):'<p style="text-align:center;color:var(--muted);margin:40px 28px">Ничего не найдено. Добавь слово кнопкой «+».</p>'}
function vList(){
  return `<div class="scr"><div class="pad row sp"><div><div class="eyebrow">Весь словарь</div><h1 style="margin-top:6px">Слова</h1></div><button class="ibtn" data-act="add" aria-label="Добавить слово">${I.plus}</button></div>
  <label class="search">${I.search}<input id="q" type="search" placeholder="Найти слово или перевод" value="${esc(listF.q)}" autocomplete="off"></label>
  ${lvChips()}<div class="chips" style="padding-top:8px"><button class="chip${listF.c?'':' on'}" data-act="chip" data-c="">Все темы</button>${COLLS.map(c=>`<button class="chip${listF.c===c.id?' on':''}" data-act="chip" data-c="${c.id}">${c.name}</button>`).join('')}</div>
  <div id="rows" style="margin-top:8px">${listRows()}</div></div>${tabbar('list')}`}

function barTop(i,n,closeAct){
  const si=stageOf(learnedN());
  return `<div class="topbar" style="margin-top:0"><button class="ibtn bare" data-act="${closeAct}" aria-label="Закрыть">${closeAct==='back'?I.back:I.close}</button><div class="track" style="flex:1;margin:0 14px"><i style="width:${n?i/n*100:0}%"></i><span class="head" style="left:${n?i/n*100:0}%">${headSvg(si)}</span></div><span style="font-family:var(--serif);font-size:22px;min-width:52px;text-align:right">${Math.min(i+1,n)} / ${n}</span></div>`}

function vCard(p){
  const it=p.ids.map(id=>ALL().find(x=>x.id===id)),x=it[p.i],c=collOf(x.coll),si=stageOf(learnedN());
  const rx=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  let exh=esc(x.ex);const full=new RegExp('\\b('+rx(esc(x.en))+')','i'),first=new RegExp('\\b('+rx(esc(x.en.split(' ')[0]))+')','i');
  exh=full.test(exh)?exh.replace(full,'<u>$1</u>'):exh.replace(first,'<u>$1</u>');
  const stars='<svg class="st" viewBox="0 0 260 270" aria-hidden="true"><circle cx="206" cy="58" r="1.8" fill="#FFE29A"/><circle cx="188" cy="104" r="1.4" fill="#5FCFC0"/><circle cx="52" cy="128" r="1.4" fill="#F3B6C0"/><circle cx="130" cy="38" r="1.6" fill="#CBE3F1"/><path d="M214 150l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#FFE29A"/><path d="M44 168l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="#9AA0F2"/></svg>';
  const art=x.icon?icon(x.icon,x.k==='c'?170:200):`<span class="letter">${esc(x.en[0].toUpperCase())}</span>`;
  return `<div class="scr nopad" style="padding-bottom:150px"><div class="topbar"><button class="ibtn bare" data-act="back" aria-label="Назад">${I.back}</button><div class="eyebrow m">${c.name} · ${p.i+1} / ${it.length}</div><button class="ibtn bare" data-act="bm" data-id="${x.id}" aria-label="В закладки" aria-pressed="${!!P.bm[x.id]}">${I.bm(P.bm[x.id])}</button></div>
  <div class="track" style="margin-top:6px"><i style="width:${(p.i+1)/it.length*100}%"></i><span class="head" style="left:${(p.i+1)/it.length*100}%">${headSvg(si)}</span></div>
  <div class="dome">${stars}${art}</div>
  <div class="word${x.k==='c'?' ch':''}">${esc(x.en)}</div>
  ${x.k==='w'?`<div class="ipa"><span>${esc(x.ipa||x.lv||'')}</span><button class="sbtn" data-act="speak" data-id="${x.id}" data-t="${esc(x.en)}" aria-label="Произнести">${I.spk}</button></div>`:`<div class="ipa"><button class="sbtn" data-act="speak" data-id="${x.id}" data-t="${esc(x.en)}" aria-label="Произнести">${I.spk}</button></div>`}
  <div class="divd"><i></i><b></b><i></i></div><div class="ru">${esc(x.ru)}</div>
  ${x.ex?`<div class="ex">${exh}</div><div class="exr">${esc(x.exr)}</div>`:''}</div>
  <div class="foot btns"><button class="btn" data-act="repeat">Повторить</button><button class="btn dark" data-act="know">Знаю</button></div>`}

/* quiz */
function mkQ(it){
  if(it.k==='c'){const ans=it.en.split(' ');const toks=shuffle(ans.concat(it.d).map((w,i)=>({w,i})));return {t:'build',it,toks,ans,ch:[],hint:false}}
  const kinds=[...(it.icon?['img']:[]),'tr','rt'],t=pick(kinds);
  const same=ALL().filter(x=>x.k===it.k&&x.id!==it.id&&(!P.cf||(x.lv||'B1')===P.cf||x.coll===it.coll));
  let o;
  if(t==='img')o=same.filter(x=>x.icon&&x.icon!==it.icon);else o=same.filter(x=>x.ru!==it.ru&&x.en!==it.en);
  return {t,it,opts:shuffle([it].concat(sample(o,3)))}}
function startQuiz(scope){
  let pool=ITEMS().filter(x=>!scope||x.coll===scope);if(!pool.length)pool=ALL().filter(x=>!scope||x.coll===scope);
  pool=shuffle(pool).sort((a,b)=>lvl(a.id)-lvl(b.id)).slice(0,8);
  const qs=shuffle(pool).map(mkQ);
  nav=nav.filter(x=>x.v!=='quiz'&&x.v!=='result');
  go('quiz',{qs,i:0,ans:null,res:[],before:learnedN(),scope});
}
function applyAnswer(q,ok,hinted){
  const id=q.it.id,l=lvl(id);
  P.lvl[id]=ok?(hinted?l:Math.min(3,l+1)):(l>=2?(l>=3?2:l):Math.max(0,l-1));
  save();
}
function vQuiz(p){
  const q=p.qs[p.i],n=p.qs.length,a=p.ans;
  let body='';
  if(q.t==='img'){
    body=`<div class="pad" style="margin-top:18px"><div class="eyebrow">Выберите изображение</div><div class="row sp" style="margin-top:6px"><h1 class="it" style="font-size:52px">${esc(q.it.en)}</h1><button class="ibtn" data-act="speak" data-id="${q.it.id}" data-t="${esc(q.it.en)}" aria-label="Произнести">${I.spk}</button></div></div>
    <div class="opts">${q.opts.map((o,k)=>{let c='';if(a){if(o.id===q.it.id)c=' ok';else if(a.pick===o.id)c=' no'}return `<button class="opt${c}" style="background:${TINTS[k%4]}" ${a?'disabled':''} data-act="ans" data-id="${o.id}" aria-label="${esc(o.en)}">${icon(o.icon,118)}${a&&o.id===q.it.id?`<span class="chk">${I.okS}</span>`:''}</button>`}).join('')}</div>`}
  else if(q.t==='tr'||q.t==='rt'){
    const prompt=q.t==='tr'?q.it.en:q.it.ru;
    body=`<div class="pad" style="margin-top:18px"><div class="eyebrow">${q.t==='tr'?'Выберите перевод':'Выберите слово'}</div><div class="row sp" style="margin-top:6px"><h1 class="${q.t==='tr'?'it':''}" style="font-size:52px">${esc(prompt)}</h1>${q.t==='tr'?`<button class="ibtn" data-act="speak" data-id="${q.it.id}" data-t="${esc(q.it.en)}" aria-label="Произнести">${I.spk}</button>`:''}</div></div>
    <div class="tlist">${q.opts.map(o=>{let c='';if(a){if(o.id===q.it.id)c=' ok';else if(a.pick===o.id)c=' no'}return `<button class="topt${c}" ${a?'disabled':''} data-act="ans" data-id="${o.id}" style="${q.t==='rt'?'font-style:italic':''}">${esc(q.t==='tr'?o.ru:o.en)}</button>`}).join('')}</div>`}
  else{
    const chosen=new Set(q.ch);
    const slots=q.ch.map(k=>`<button class="pill ${a?(a.ok?'ok':'no'):'dk'}" ${a?'disabled':''} data-act="unpick" data-k="${k}">${esc(q.toks.find(t=>t.i===k).w)}</button>`).join('')+(a?'':'<span class="pill ph" aria-hidden="true"></span>');
    body=`<div style="text-align:center;margin-top:14px" class="eyebrow">Соберите чанк</div>
    <div class="dome lt" style="height:150px;width:160px;border-radius:80px 80px 20px 20px;margin-top:12px">${icon(q.it.icon,100)}</div>
    <h2 style="text-align:center;margin:12px 28px 0;font-size:34px;line-height:1.05">${esc(q.it.ru)}</h2>
    <div class="exr" style="margin-top:6px">Соберите английскую фразу из слов ниже</div>
    <div class="eyebrow" style="margin:18px 28px 8px">Ваш ответ</div><div class="slots" aria-live="polite">${slots}</div><div class="hr" style="margin:12px 28px"></div>
    <div class="eyebrow" style="margin:0 28px 8px">Слова</div><div class="slots">${q.toks.filter(t=>!chosen.has(t.i)).map(t=>`<button class="pill" ${a?'disabled':''} data-act="pick" data-k="${t.i}">${esc(t.w)}</button>`).join('')}</div>`}
  let foot='';
  if(a){
    const sub=q.t==='build'?(a.ok?esc(q.it.en)+' — '+esc(q.it.ru):'Правильно: '+esc(q.it.en)):(a.ok?esc(q.it.en)+' — '+esc(q.it.ru):esc(q.it.en)+' — '+esc(q.it.ru));
    foot=`<div class="fb${a.ok?'':' bad'}" role="status"><div class="h"><span class="c">${a.ok?I.ok:I.x}</span><div><b>${a.ok?'Верно':'Не совсем'}</b><span>${sub}</span></div></div><button class="btn dark full" data-act="next">${p.i+1>=n?'Результат':'Продолжить'}</button></div>`}
  else if(q.t==='build'){
    foot=`<div class="foot btns"><button class="btn" data-act="hint">Подсказка</button><button class="btn dark" data-act="check" ${q.ch.length?'':'disabled'}>Проверить</button></div>`}
  return `<div class="scr nopad" style="padding-bottom:${a?200:110}px">${barTop(p.i,n,'quitq')}${body}</div>${foot}`}

function vResult(p){
  const n=p.res.length,ok=p.res.filter(r=>r.ok).length,pct=n?ok/n:0,gain=learnedN()-p.before;
  const bad=p.res.filter(r=>!r.ok);
  const msg=pct===1?'Безупречно':pct>=.7?'Хорошая работа':pct>=.4?'Неплохо, продолжай':'Нужно ещё повторить';
  const si=stageOf(learnedN()),nx=STAGES[si+1];
  return `<div class="scr nopad" style="padding-bottom:130px"><div class="pad" style="text-align:center;margin-top:8px"><div class="eyebrow">Тренировка завершена</div></div>
  <div class="ring"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="86" fill="#fff"/><circle cx="100" cy="100" r="86" fill="none" stroke="#D5E0E8" stroke-width="2"/><circle cx="100" cy="100" r="86" fill="none" stroke="#2B6A92" stroke-width="3" stroke-linecap="round" stroke-dasharray="${(pct*540).toFixed(0)} 540" transform="rotate(-90 100 100)"/></svg><div><span class="big" style="font-size:64px">${ok}<span style="font-size:30px;color:var(--muted)"> / ${n}</span></span><span style="color:var(--muted);font-size:13px;margin-top:4px">верных ответов</span></div></div>
  <h2 style="text-align:center;margin-top:18px">${msg}</h2>
  <div style="text-align:center;color:var(--muted);margin-top:6px">${gain>0?`Выучено: +${gain} ${plural(gain,['слово','слова','слов'])}`:'Новых выученных слов нет'}${nx?` · до «${nx.gen}» ${nf(nx.w-learnedN())}`:''}</div>
  ${bad.length?`<div class="eyebrow" style="margin:26px 28px 6px">Стоит повторить</div><div style="padding:0 28px">${bad.map(r=>`<div class="mrow">${tileHtml(r.it)}<div><div style="font-family:var(--serif);font-style:italic;font-size:22px;line-height:1.1">${esc(r.it.en)}</div><div style="font-size:13px;color:var(--muted)">${esc(r.it.ru)}</div></div></div>`).join('')}</div>`:''}</div>
  <div class="foot btns"><button class="btn" data-act="home">На главную</button><button class="btn dark" data-act="again">Ещё раз</button></div>`}

/* ---- spaced repetition (Anki-like) ---- */
const MIN=60000,DAY=86400000,NEW_PER_DAY=10;
const SRS_L=['Не помню','Плохо','Хорошо','Отлично'];
const srsItems=()=>ITEMS().filter(x=>x.k==='w'&&x.icon);
function srsCalc(c,g){
  let ease=c?c.ease:2.5,iv=c?c.iv:0,n=c?c.n:0,ms,nn,ivd=iv;
  if(g===0){ms=MIN*(n?10:1);ease=c?Math.max(1.3,ease-.2):ease;nn=0}
  else if(n===0){ms=[0,10*MIN,DAY,4*DAY][g];nn=g>=2?1:0;ivd=g>=2?ms/DAY:0;if(g===3)ease+=.15}
  else{
    if(g===1){ivd=Math.max(iv+1,iv*1.2);ease=Math.max(1.3,ease-.15)}
    else if(g===2){ivd=Math.max(iv+1,iv*ease)}
    else{ivd=Math.max(iv+2,iv*ease*1.3);ease+=.15}
    ms=ivd*DAY;nn=n+1}
  return {ease,iv:ivd,n:nn,ms,due:Date.now()+ms}}
function fmtIv(ms){const m=ms/MIN;if(m<60)return Math.max(1,Math.round(m))+' мин';const h=m/60;if(h<24)return Math.round(h)+' ч';const d=h/24;if(d<30)return Math.round(d)+' дн';if(d<365)return (Math.round(d/30*10)/10).toString().replace('.',',')+' мес';return (Math.round(d/365*10)/10).toString().replace('.',',')+' г'}
const dayKey=()=>new Date().toDateString();
function srsStats(){
  const now=Date.now(),it=srsItems(),nt=P.newToday&&P.newToday.d===dayKey()?P.newToday.n:0;
  const due=it.filter(x=>P.srs[x.id]&&P.srs[x.id].due<=now);
  const fresh=it.filter(x=>!P.srs[x.id]);
  const nw=fresh.slice(0,Math.max(0,NEW_PER_DAY-nt));
  const next=it.filter(x=>P.srs[x.id]&&P.srs[x.id].due>now).map(x=>P.srs[x.id].due).sort((a,b)=>a-b)[0];
  return {due,nw,next,total:due.length+nw.length}}
const dj={f:'top',c:''};
const DJF=[['top','Сначала важное'],['due','К повтору'],['weak','Слабые'],['new','Новые'],['all','Все']];
function djBucket(x){const c=P.srs[x.id],now=Date.now();
  if(!c)return 'new';if(c.due<=now)return 'due';return lvl(x.id)<2?'weak':'ok'}
function djPool(topic){const it=srsItems().filter(x=>!topic||x.coll===topic),now=Date.now();
  const b={due:[],weak:[],new:[],ok:[]};it.forEach(x=>b[djBucket(x)].push(x));
  b.due.sort((a,c)=>P.srs[a.id].due-P.srs[c.id].due);
  b.weak.sort((a,c)=>P.srs[a.id].ease-P.srs[c.id].ease||lvl(a.id)-lvl(c.id));
  b.ok.sort((a,c)=>P.srs[a.id].due-P.srs[c.id].due);
  b.new=shuffle(b.new);return b}
function djQueue(){const b=djPool(dj.c);
  return dj.f==='due'?b.due:dj.f==='weak'?b.weak:dj.f==='new'?b.new:dj.f==='all'?b.due.concat(b.weak,b.new,b.ok):b.due.concat(b.weak,b.new)}
function vDojo(){
  const b=djPool(''),q=djQueue(),n=Math.min(q.length,20);
  const tc=COLLS.map(c=>{const p=djPool(c.id);return {c,p,t:p.due.length+p.weak.length+p.new.length+p.ok.length}}).filter(x=>x.t);
  const st=`<div class="srsn" style="margin-top:14px;gap:16px"><span><b>${b.due.length}</b>повтор</span><span><b>${b.weak.length}</b>слабых</span><span><b>${b.new.length}</b>новых</span><span><b>${b.ok.length}</b>освоено</span></div>`;
  const fl=DJF.map(f=>`<button class="chip${dj.f===f[0]?' on':''}" data-act="djf" data-f="${f[0]}">${f[1]}</button>`).join('');
  const rows=tc.map(x=>{const u=x.p.due.length,w=x.p.weak.length,nw=x.p.new.length;
    return `<button class="coll${dj.c===x.c.id?' sel':''}" data-act="djc" data-c="${x.c.id}"><span class="cico">${icon(x.c.icon,36)}</span><span class="t"><b>${x.c.name}</b><span>${u?u+' к повтору · ':''}${w?w+' слабых · ':''}${nw} новых</span></span><span class="pc" style="font-size:18px">${dj.c===x.c.id?'✓':''}</span></button>`}).join('');
  const nxt=(()=>{const f=srsItems().filter(x=>P.srs[x.id]&&P.srs[x.id].due>Date.now()).map(x=>P.srs[x.id].due).sort((a,c)=>a-c)[0];return f?' · ближайшее через '+fmtIv(f-Date.now()):''})();
  const tori='<svg viewBox="0 0 120 100" width="86" height="72" fill="none" stroke="#FFD9DF" stroke-width="7" stroke-linecap="round" aria-hidden="true"><path d="M8 24q52 12 104 0"/><path d="M20 42h80"/><path d="M32 24v68M88 24v68"/><path d="M60 26v16"/></svg>';
  return `<div class="scr"><div class="pad" style="padding-top:8px"><div class="dojo"><div class="dtop"><div><div class="deb">Повторение по картинкам</div><h1>Додзе</h1></div>${tori}</div>
  <div class="dst"><span><b>${b.due.length}</b>повтор</span><span><b>${b.weak.length}</b>слабых</span><span><b>${b.new.length}</b>новых</span><span><b>${b.ok.length}</b>освоено</span></div>
  <button class="dgo" data-act="srs" ${n?'':'disabled'}>${n?'Начать · '+n+' '+plural(n,['карточка','карточки','карточек']):'Нечего повторять'+nxt}</button></div>
  <button class="link dhelp" data-act="djh" aria-expanded="${!!dj.h}">Как это работает ${dj.h?'▴':'▾'}</button>
  ${dj.h?'<p class="dp">Карточка открывается с картинкой и озвучкой, без перевода. Вспомните значение и оцените, как хорошо вы его знаете, — чем лучше оценка, тем позже слово вернётся.</p>':''}</div>
  ${lvChips()}<div class="chips" style="padding-top:8px">${fl}</div>
  <div class="pad"><div class="sec" style="margin:22px 0 0"><h2>Темы</h2>${dj.c?'<button class="link" data-act="djc" data-c="">Все темы</button>':''}</div></div>${rows}</div>${tabbar('dojo')}`}
function startSrs(){
  const q=djQueue().slice(0,20).map(x=>x.id);
  if(!q.length){toast('Пока нечего повторять');return}
  nav=nav.filter(x=>x.v!=='srs');go('srs',{queue:q,shown:false,done:0,cnt:[0,0,0,0]});srsSpeak()}
function srsSpeak(){const c=cur();if(c.v!=='srs'||!c.queue.length||c.shown)return;const x=ALL().find(z=>z.id===c.queue[0]);if(x)speak(x.en,x.id)}
function vSrs(p){
  const n=p.done+p.queue.length;
  if(!p.queue.length){
    const st=srsStats(),tot=p.cnt.reduce((a,b)=>a+b,0);
    return `<div class="scr nopad"><div class="topbar"><span style="width:44px"></span><div class="eyebrow m">Додзе</div><span style="width:44px"></span></div>
    <div class="pad" style="text-align:center;margin-top:40px"><div style="display:flex;justify-content:center">${cre(stageOf(learnedN()),150)}</div><h1 style="margin-top:14px">${tot?'Готово на сегодня':'Нечего повторять'}</h1>
    <p style="color:var(--muted);line-height:1.5;margin:10px 0 0">${tot?`Повторено карточек: ${tot}. Не помню — ${p.cnt[0]}, плохо — ${p.cnt[1]}, хорошо — ${p.cnt[2]}, отлично — ${p.cnt[3]}.`:''}${st.next?` Следующее повторение через ${fmtIv(st.next-Date.now())}.`:''}</p></div></div>
    <div class="foot btns"><button class="btn" data-act="home">На главную</button><button class="btn dark" data-act="tab" data-v="${p.from||'dojo'}">${p.from==='today'?'Сегодня':'В додзе'}</button></div>`}
  const x=ALL().find(z=>z.id===p.queue[0]);
  const stars='<svg class="st" viewBox="0 0 260 270" aria-hidden="true"><circle cx="206" cy="58" r="1.8" fill="#FFE29A"/><circle cx="188" cy="104" r="1.4" fill="#5FCFC0"/><circle cx="52" cy="128" r="1.4" fill="#F3B6C0"/><circle cx="130" cy="38" r="1.6" fill="#CBE3F1"/><path d="M214 150l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#FFE29A"/></svg>';
  const isNew=!P.srs[x.id];
  const cl=collOf(x.coll);
  let body=`<div style="text-align:center;margin-top:12px" class="eyebrow">${isNew?'Новое слово':'Повторение'} · ${cl?cl.name:''} · ${x.lv||'B1'}</div>
   <div class="dome sm">${stars}${icon(x.icon,150)}</div>
   <div class="word" style="font-size:46px;margin-top:10px">${esc(x.en)}</div><div class="ipa"><span>${esc(x.ipa||'')}</span><button class="sbtn" data-act="speak" data-id="${x.id}" data-t="${esc(x.en)}" aria-label="Произнести">${I.spk}</button></div>`;
  if(p.shown){
    const rx=esc(x.en).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const exh=esc(x.ex||'').replace(new RegExp('\\b('+rx+')','i'),'<u>$1</u>');
    body+=`<div class="divd"><i></i><b></b><i></i></div><div class="ru" style="font-size:32px">${esc(x.ru)}</div>${x.ex?`<div class="ex" style="font-size:20px;margin-top:10px">${exh}</div>`:''}`}
  else body+=`<button class="link" style="display:block;margin:18px auto 0" data-act="srsshow">Показать перевод</button>`;
  const c=P.srs[x.id];
  const foot=`<div class="foot"><div style="text-align:center;font-size:12px;color:var(--muted);margin-bottom:8px">Как хорошо вы это знаете?</div><div class="grades">${[0,1,2,3].map(g=>`<button class="gr g${g}" data-act="srsgrade" data-g="${g}">${SRS_L[g]}<small>${fmtIv(srsCalc(c,g).ms)}</small></button>`).join('')}</div></div>`;
  return `<div class="scr nopad" style="padding-bottom:170px">${barTop(p.done,n,'srsq')}${body}</div>${foot}`}
/* ---------- lesson: 4 stages (знакомство → практика → свободное → повторение) ---------- */
const LS_ST=['Знакомство','Практика','Свободное употребление','Повторение'];
const ls={c:''};
const lsWords=()=>ALL().filter(x=>x.k==='w'&&x.icon);
const lsHit=(tok,en)=>{const t=tok.replace(/[^A-Za-z'’-]/g,'').toLowerCase(),e=en.toLowerCase().split(' ')[0];const k=Math.min(e.length,Math.max(3,e.length-2));return t.length>1&&t.startsWith(e.slice(0,k))};
const lsOthers=(w,n,f)=>sample(lsWords().filter(x=>x.id!==w.id&&(!f||f(x))),n);
function lsTasks(ws,old){
  const T=[];
  ws.forEach(w=>T.push({st:1,t:'intro',w}));
  shuffle(ws).forEach(w=>T.push({st:1,t:'w2p',w,opts:shuffle([w].concat(lsOthers(w,3,x=>x.icon!==w.icon)))}));
  T.push({st:1,t:'match',ws:ws.slice(0,5),L:shuffle(ws.slice(0,5).map(x=>x.id)),R:shuffle(ws.slice(0,5).map(x=>x.id)),got:[],sel:null,miss:0});
  ws.filter(w=>w.ex).slice(0,2).forEach(w=>{const toks=w.ex.split(/\s+/),a=toks.findIndex(t=>lsHit(t,w.en));if(a>=0)T.push({st:1,t:'find',w,toks,a})});
  shuffle(ws).forEach(w=>{
    const toks=(w.ex||'').split(/\s+/),a=w.ex?toks.findIndex(t=>lsHit(t,w.en)):-1;
    const o=shuffle([w].concat(lsOthers(w,3,x=>x.en!==w.en)));
    if(a>=0){const gap=toks.map((t,i)=>i===a?'____'+(t.match(/[^A-Za-z'’-]+$/)||[''])[0]:t).join(' ');T.push({st:2,t:'gap',w,gap,opts:o})}
    else T.push({st:2,t:'rt',w,opts:o})});
  for(let k=0;k<2;k++){const w=ws[k%ws.length];const same=lsWords().filter(x=>x.coll===w.coll&&x.id!==w.id),diff=lsWords().filter(x=>x.coll!==w.coll);
    if(same.length>=3&&diff.length){const odd=pick(diff);T.push({st:2,t:'odd',w:odd,opts:shuffle(sample(same,3).concat([odd]))})}}
  shuffle(ws).filter(w=>!/\s/.test(w.en)).slice(0,4).forEach(w=>T.push({st:3,t:'type',w}));
  T.push({st:3,t:'write',ws:sample(ws,2)});
  old.forEach(w=>T.push({st:4,t:'rt',w,old:true,opts:shuffle([w].concat(lsOthers(w,3,x=>x.en!==w.en)))}));
  sample(ws,3).forEach(w=>T.push({st:4,t:'tr',w,opts:shuffle([w].concat(lsOthers(w,3,x=>x.ru!==w.ru)))}));
  return T}
function startLesson(){
  let pool=ITEMS().filter(x=>x.k==='w'&&x.icon&&(!ls.c||x.coll===ls.c));
  const fresh=shuffle(pool.filter(x=>!P.srs[x.id]&&lvl(x.id)<2)),rest=shuffle(pool.filter(x=>P.srs[x.id]||lvl(x.id)>=2));
  const ws=fresh.concat(rest).slice(0,6);
  if(ws.length<4){toast('В этой теме мало слов — выберите другую');return}
  const ids=new Set(ws.map(x=>x.id));
  const old=lsWords().filter(x=>!ids.has(x.id)&&P.srs[x.id]).sort((a,b)=>P.srs[a.id].due-P.srs[b.id].due).slice(0,2);
  nav=nav.filter(x=>x.v!=='lesson');
  go('lesson',{tasks:lsTasks(ws,old),i:0,res:[],ws,fin:false});lsAfter()}
function lsAfter(){const c=cur();if(c.v!=='lesson')return;const t=c.tasks[c.i];if(t&&!t.done&&(t.t==='intro'||t.t==='w2p'))speak(t.w.en,t.w.id);if(t&&t.t==='type'&&!t.done)setTimeout(()=>{const e=document.getElementById('ls-in');if(e)e.focus()},50)}
function lsRec(c,w,ok){c.res.push({it:w,ok});applyAnswer({it:w},ok,false)}
function vLesson(p){
  const n=p.tasks.length;
  if(p.i>=n){
    if(!p.fin){p.fin=true;const miss={};p.res.forEach(r=>{if(!r.ok)miss[r.it.id]=(miss[r.it.id]||0)+1});
      p.ws.forEach(w=>{if(!P.srs[w.id]){const m=miss[w.id]||0,r=srsCalc(undefined,m===0?2:m===1?1:0);P.srs[w.id]={ease:r.ease,iv:r.iv,n:r.n,due:r.due};todayInc('new')}});p.tasks.filter(t=>t.old).forEach(()=>todayInc('rev'));save();checkLevel()}
    const ok=p.res.filter(r=>r.ok).length,bad=[...new Map(p.res.filter(r=>!r.ok).map(r=>[r.it.id,r.it])).values()];
    return `<div class="scr nopad"><div class="topbar"><span style="width:44px"></span><div class="eyebrow m">Урок пройден</div><span style="width:44px"></span></div>
    <div class="pad" style="text-align:center;margin-top:26px"><div style="display:flex;justify-content:center">${cre(stageOf(learnedN()),130)}</div><h1 style="margin-top:12px">${ok} из ${p.res.length}</h1>
    <p style="color:var(--muted);line-height:1.5;margin:8px 0 0">Слова урока: ${p.ws.map(w=>esc(w.en)).join(', ')}.${bad.length?`<br>Стоит повторить: ${bad.map(w=>esc(w.en)).join(', ')}.`:'<br>Без ошибок!'}<br>Все слова добавлены в Додзе и вернутся в нужное время.</p></div></div>
    <div class="foot btns"><button class="btn" data-act="lstart">Ещё урок</button><button class="btn dark" data-act="lsend">В додзе</button></div>`}
  const t=p.tasks[p.i],a=t.done,w=t.w||t.ws[0];
  const head=`${barTop(p.i,n,'lsq')}<div class="lsteps">${LS_ST.map((s,k)=>`<i class="${k+1<t.st?'d':k+1===t.st?'on':''}"></i>`).join('')}</div><div style="text-align:center;margin-top:8px" class="eyebrow">Этап ${t.st} из 4 · ${LS_ST[t.st-1]}${t.old?' · из прошлых':''}</div>`;
  const spk=x=>`<button class="ibtn" data-act="speak" data-id="${x.id}" data-t="${esc(x.en)}" aria-label="Произнести">${I.spk}</button>`;
  const cls=o=>{let c='';if(a){if(o.id===w.id)c=' ok';else if(a.pick===o.id)c=' no'}return c};
  let body='',foot='',pad=110;
  const fb=(ok,sub)=>`<div class="fb${ok?'':' bad'}" role="status"><div class="h"><span class="c">${ok?I.ok:I.x}</span><div><b>${ok?'Верно':'Не совсем'}</b><span>${sub}</span></div></div><button class="btn dark full" data-act="lsnext">Дальше</button></div>`;
  const ans=`${esc(w.en)} — ${esc(w.ru)}`;
  switch(t.t){
  case 'intro':{
    const rx=esc(w.en).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const exh=w.ex?esc(w.ex).replace(new RegExp('\\b('+rx+')','i'),'<u>$1</u>'):'';
    body=`<div class="dome sm" style="margin-top:14px">${icon(w.icon,150)}</div><div class="word" style="font-size:46px;margin-top:10px">${esc(w.en)}</div><div class="ipa"><span>${esc(w.ipa||w.lv||'')}</span><button class="sbtn" data-act="speak" data-id="${w.id}" data-t="${esc(w.en)}" aria-label="Произнести">${I.spk}</button></div><div class="divd"><i></i><b></b><i></i></div><div class="ru" style="font-size:32px">${esc(w.ru)}</div>${exh?`<div class="ex" style="font-size:20px;margin-top:10px">${exh}</div>`:''}`;
    foot=`<div class="foot"><div style="text-align:center;font-size:12px;color:var(--muted);margin-bottom:8px">Посмотрите, послушайте, запомните</div><button class="btn dark full" data-act="lsnext">Дальше</button></div>`;pad=170;break}
  case 'w2p':
    body=`<div class="pad" style="margin-top:14px"><div class="eyebrow">Найдите картинку</div><div class="row sp" style="margin-top:6px"><h1 class="it" style="font-size:48px">${esc(w.en)}</h1>${spk(w)}</div></div><div class="opts">${t.opts.map((o,k)=>`<button class="opt${cls(o)}" style="background:${TINTS[k%4]}" ${a?'disabled':''} data-act="lsans" data-id="${o.id}" aria-label="${esc(o.en)}">${icon(o.icon,118)}</button>`).join('')}</div>`;break;
  case 'tr':case 'rt':case 'gap':case 'odd':{
    const lab={tr:'Выберите перевод',rt:'Выберите слово',gap:'Вставьте слово',odd:'Какое слово лишнее?'}[t.t];
    const prompt=t.t==='tr'?esc(w.en):t.t==='rt'?esc(w.ru):t.t==='gap'?esc(t.gap):'';
    body=`<div class="pad" style="margin-top:14px"><div class="eyebrow">${lab}</div>${prompt?`<div class="row sp" style="margin-top:6px"><h1 class="${t.t==='tr'?'it':''}" style="font-size:${t.t==='gap'?30:48}px">${prompt}</h1>${t.t==='tr'?spk(w):''}</div>`:''}</div>
    <div class="tlist">${t.opts.map(o=>`<button class="topt${cls(o)}" ${a?'disabled':''} data-act="lsans" data-id="${o.id}" style="${t.t==='tr'?'':'font-style:italic'}">${esc(t.t==='tr'?o.ru:o.en)}${t.t==='odd'?`<small style="display:block;font-style:normal;color:var(--muted);font-size:12px">${esc(o.ru)}</small>`:''}</button>`).join('')}</div>`;break}
  case 'find':
    body=`<div class="pad" style="margin-top:14px"><div class="eyebrow">Найдите слово в тексте</div><div class="row sp" style="margin-top:6px"><h1 class="it" style="font-size:44px">${esc(w.en)}</h1>${spk(w)}</div></div>
    <div class="slots" style="margin-top:18px">${t.toks.map((k,i)=>{let c='';if(a){if(i===t.a)c=' ok';else if(a.pick===i)c=' no'}return `<button class="pill${c}" ${a?'disabled':''} data-act="lsans" data-k="${i}">${esc(k)}</button>`}).join('')}</div><div class="exr" style="margin-top:14px">${esc(w.exr||'')}</div>`;break;
  case 'match':
    body=`<div class="pad" style="margin-top:14px"><div class="eyebrow">Соедините слово и перевод</div></div><div class="mt"><div>${t.L.map(id=>{const x=ALL().find(z=>z.id===id);return `<button class="pill${t.got.includes(id)?' ok':t.sel===id?' dk':''}" ${t.got.includes(id)?'disabled':''} data-act="lsm" data-s="l" data-id="${id}">${esc(x.en)}</button>`}).join('')}</div><div>${t.R.map(id=>{const x=ALL().find(z=>z.id===id);return `<button class="pill${t.got.includes(id)?' ok':''}" ${t.got.includes(id)?'disabled':''} data-act="lsm" data-s="r" data-id="${id}">${esc(x.ru.split(/[,;(]/)[0].trim())}</button>`}).join('')}</div></div>${t.miss?`<div class="exr" style="margin-top:12px">Ошибок: ${t.miss}</div>`:''}`;break;
  case 'type':
    body=`<div class="pad" style="margin-top:14px"><div class="eyebrow">Напишите по-английски</div><div style="display:flex;justify-content:center;margin-top:10px"><div class="dome sm" style="margin:0">${icon(w.icon,130)}</div></div><h2 style="text-align:center;margin:12px 0 0;font-size:34px">${esc(w.ru)}</h2>
    <input id="ls-in" class="lsin" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="${esc(w.en[0]+'·'.repeat(Math.max(0,w.en.length-1)))}" ${a?'disabled value="'+esc(a.val)+'"':''}></div>`;
    if(!a){foot=`<div class="foot btns"><button class="btn" data-act="lshint">Подсказка</button><button class="btn dark" data-act="lscheck">Проверить</button></div>`}break;
  case 'write':
    body=`<div class="pad" style="margin-top:14px"><div class="eyebrow">Используйте слова сами</div><h2 style="margin:8px 0 0;font-size:30px;line-height:1.15">Расскажите вслух или напишите 1–2 предложения о себе, где есть оба слова:</h2>
    <div class="slots" style="padding:0;margin-top:14px">${t.ws.map(x=>`<button class="pill dk" data-act="speak" data-id="${x.id}" data-t="${esc(x.en)}">${esc(x.en)} · ${esc(x.ru)}</button>`).join('')}</div>
    <textarea id="ls-tx" class="lsin" rows="4" placeholder="I think… / My… (по желанию — можно просто сказать вслух)" style="margin-top:14px"></textarea></div>`;
    foot=`<div class="foot btns"><button class="btn" data-act="lswrite" data-ok="0">Пропустить</button><button class="btn dark" data-act="lswrite" data-ok="1">Готово</button></div>`;pad=170;break}
  if(a&&t.t!=='intro'){
    let sub=ans;if(t.t==='gap')sub=esc(w.ex)+'<br>'+ans;if(t.t==='find')sub=esc(w.ex);if(t.t==='match')sub=a.ok?'Все пары найдены':'Есть ошибки — повторите слова позже';
    foot=fb(a.ok,sub);pad=210}
  return `<div class="scr nopad" style="padding-bottom:${pad}px">${head}${body}</div>${foot}`}

/* ---------- today ---------- */
const GOALS=[5,10,15,20,30];
function ensureToday(){const d=dayKey();if(!P.today||P.today.d!==d){P.today={d,newDone:0,revDone:0,revPlan:srsItems().filter(x=>P.srs[x.id]&&P.srs[x.id].due<=Date.now()).length};save()}return P.today}
function todayInc(k){const t=ensureToday();if(k==='new')t.newDone++;else t.revDone++;save()}
function todayInfo(){const t=ensureToday(),goal=P.goal||10,dueNow=srsItems().filter(x=>P.srs[x.id]&&P.srs[x.id].due<=Date.now()).length;
  const rev=Math.max(t.revPlan,t.revDone+dueNow),total=goal+rev,done=Math.min(t.newDone,goal)+Math.min(t.revDone,rev);
  return {goal,rev,total,done,nd:Math.min(t.newDone,goal),rd:Math.min(t.revDone,rev),dueNow,pct:total?done/total:1}}
function startToday(){
  const i=todayInfo(),left=Math.max(0,i.goal-ensureToday().newDone);
  const due=srsItems().filter(x=>P.srs[x.id]&&P.srs[x.id].due<=Date.now()).sort((a,b)=>P.srs[a.id].due-P.srs[b.id].due);
  const nw=shuffle(srsItems().filter(x=>!P.srs[x.id])).slice(0,left);
  const q=due.concat(nw).map(x=>x.id);
  if(!q.length){toast('На сегодня всё сделано');return}
  nav=nav.filter(x=>x.v!=='srs');go('srs',{queue:q,shown:false,done:0,cnt:[0,0,0,0],from:'today'});srsSpeak()}
function vToday(){
  const i=todayInfo(),R=88,C=2*Math.PI*R,fin=i.pct>=1&&i.total>0,si=stageOf(learnedN());
  const left=i.total-i.done;
  const ring=`<div class="tring"><svg viewBox="0 0 200 200" width="230" height="230" role="img" aria-label="Прогресс на сегодня: ${Math.round(i.pct*100)}%"><circle cx="100" cy="100" r="${R}" fill="none" stroke="#D5E0E8" stroke-width="10"/><circle cx="100" cy="100" r="${R}" fill="none" stroke="${fin?'#F2C66B':'#5FCFC0'}" stroke-width="10" stroke-linecap="round" opacity="${i.pct>0?1:0}" stroke-dasharray="${(C*Math.min(1,i.pct)).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 100 100)" style="transition:stroke-dasharray .6s"/></svg><div class="tcen">${cre(si,100,"28 14 144 144")}<b>${i.done}<small> / ${i.total}</small></b></div></div>`;
  const row=(t,a,b,c)=>`<div class="trow"><div class="row sp"><span>${t}</span><b>${a} / ${b}</b></div><div class="bar" style="margin-top:8px"><i style="width:${b?Math.max(a/b*100,a?3:0):0}%;background:${c}"></i></div></div>`;
  return `<div class="scr"><div class="pad"><div class="eyebrow">${new Date().toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})}</div><h1 style="margin-top:6px">Сегодня</h1></div>
  <div style="display:flex;justify-content:center;margin-top:10px">${ring}</div>
  <p style="text-align:center;color:var(--muted);margin:6px 28px 0">${fin?'Цель на сегодня выполнена!':`Осталось ${left} ${plural(left,['карточка','карточки','карточек'])}: ${Math.max(0,i.goal-i.nd)} новых и ${Math.max(0,i.rev-i.rd)} на повторение`}</p>
  <div class="pad" style="margin-top:16px">${row('Новые слова',i.nd,i.goal,'#5FCFC0')}${row('Повторение',i.rd,i.rev,'#9AA0F2')}
  <div class="btns" style="margin-top:20px"><button class="btn dark" data-act="today" ${left?'':'disabled'}>${fin?'Готово':'Начать'}</button><button class="btn" data-act="lstart">Урок</button></div>
  <div class="eyebrow" style="margin-top:22px">Новых слов в день</div></div>
  <div class="chips" style="padding-top:8px">${GOALS.map(g=>`<button class="chip${(P.goal||10)===g?' on':''}" data-act="goal" data-g="${g}">${g}</button>`).join('')}</div>${lvChips()}
  <div class="pad"><button class="link" style="margin-top:14px" data-act="tab" data-v="list">Весь словарь →</button></div></div>${tabbar('today')}`}

function vTrain(){
  const due=ITEMS().filter(x=>lvl(x.id)<2).length;
  return `<div class="scr"><div class="pad"><div class="eyebrow">Практика</div><h1 style="margin-top:6px">Тренировка</h1><p style="color:var(--muted);margin:10px 0 0;line-height:1.45">8 вопросов: выбери картинку, перевод или собери чанк. Сначала идут слова, которые ты знаешь хуже всего.</p>
  ${(()=>{const cs=COLLS.filter(c=>ITEMS().some(x=>x.coll===c.id&&x.k==='w'&&x.icon));return `<div class="srsc" style="flex-direction:column;align-items:stretch;margin-top:18px"><div class="eyebrow">Урок</div><div style="font-size:14px;margin-top:6px;line-height:1.45">6 слов за 4 этапа: знакомство и узнавание → контролируемая практика → свободное употребление → повторение.</div><div class="chips" style="padding:12px 0 4px"><button class="chip${ls.c?'':' on'}" data-act="lsc" data-c="">Все темы</button>${cs.map(c=>`<button class="chip${ls.c===c.id?' on':''}" data-act="lsc" data-c="${c.id}">${c.name}</button>`).join('')}</div><button class="btn dark full" style="margin-top:10px" data-act="lstart">Начать урок</button></div>`})()}
  <div class="row" style="gap:10px;margin-top:18px"><span class="tile" style="background:#E9F8F5;width:44px;height:44px">${icon('book',34)}</span><span><b style="font-family:var(--serif);font-weight:400;font-size:26px">${due}</b> <span style="color:var(--muted)">${plural(due,['слово','слова','слов'])} ещё не выучено</span></span></div>
  <button class="btn dark full" style="margin-top:20px" data-act="quiz" data-id="">Начать тренировку</button>
  <button class="srsc" style="width:100%;text-align:left" data-act="tab" data-v="dojo"><div style="flex:1;min-width:0"><div class="eyebrow">Додзе</div><div style="font-size:13px;color:var(--muted);margin-top:6px;line-height:1.4">Повторение по картинкам с озвучкой теперь в отдельном режиме.</div></div><span style="color:var(--glacier)">${I.next}</span></button></div>
  <div class="sec" style="margin-bottom:0"><h2>По коллекциям</h2></div>
  ${lvChips()}${COLLS.filter(c=>ITEMS().some(x=>x.coll===c.id)).map(c=>`<button class="coll" data-act="quiz" data-id="${c.id}"><span class="cico">${icon(c.icon,36)}</span><span class="t"><b>${c.name}</b><span>${ITEMS().filter(x=>x.coll===c.id).length} вопросов в запасе</span></span><span style="color:var(--glacier)">${I.next}</span></button>`).join('')}</div>${tabbar('train')}`}

function vProgress(){
  const n=learnedN(),si=stageOf(n),s=STAGES[si],nx=STAGES[si+1];
  const pct=nx?Math.round((n-s.w)/(nx.w-s.w)*100):100;
  const rows=STAGES.map((x,i)=>{const cls=i===si?'cur':i<si?'done':'lock';
    return `<div class="st-row ${cls}"><span class="th">${cre(i,40)}</span><span class="nm">${x.n}</span><span class="mt">${x.cefr} · ${nf(x.w)}</span></div>`}).join('');
  return `<div class="scr"><div class="pad"><div class="eyebrow">Весь путь</div><h1 style="margin-top:6px">Прогресс</h1></div>
  <div class="pcard"><div class="row" style="align-items:baseline;gap:8px"><span class="big" style="font-size:68px">${nf(n)}</span><span style="font-family:var(--serif);font-size:26px;color:var(--muted)">/ ${nf(nx?nx.w:s.w)}</span></div>
  <div style="color:var(--muted);margin-top:2px">слов и чанков · уровень ${s.cefr}</div>
  <div style="position:absolute;right:10px;top:22px;opacity:.95">${cre(si,92)}</div>
  <div class="bar" style="margin-top:22px"><i style="width:${Math.max(pct,2)}%"></i></div><div class="row sp" style="margin-top:10px;font-size:13px;color:var(--muted)"><span>Этап ${si+1} из 10</span><span>${nx?'до следующего — '+nf(nx.w-n):'максимум'}</span></div></div>
  <div class="ladder">${rows}</div>
  <div style="text-align:center"><button class="demo" data-act="demo">Демо: добавить 500 слов, чтобы увидеть новый этап</button></div></div>${tabbar('progress')}`}

function vAdd(p){
  const f=p.form||{kind:p.c==='talk'?'c':'w',c:p.c||'travel',en:'',ru:'',ex:''};p.form=f;
  const cs=COLLS.filter(c=>c.kind===f.kind);
  if(!cs.find(c=>c.id===f.c))f.c=cs[0].id;
  return `<div class="scr nopad"><div class="topbar"><button class="ibtn bare" data-act="back" aria-label="Назад">${I.back}</button><div class="eyebrow m">Новая запись</div><span style="width:44px"></span></div>
  <div class="pad"><h1 style="margin-top:6px">Добавить</h1>
  <div class="row" style="justify-content:center;margin-top:12px"><div class="tile" style="width:86px;height:86px;border-radius:26px;background:#E4EEF4">${f.kind==='c'?icon('chat',70):icon('ice',70)}</div></div>
  <div class="seg" role="tablist"><button class="${f.kind==='w'?'on':''}" data-act="kind" data-k="w">Слово</button><button class="${f.kind==='c'?'on':''}" data-act="kind" data-k="c">Чанк</button></div>
  <div class="fld"><label for="f-en">${f.kind==='c'?'Фраза по-английски':'Слово по-английски'}</label><input id="f-en" data-f="en" value="${esc(f.en)}" autocomplete="off" autocapitalize="none"></div>
  <div class="fld"><label for="f-ru">Перевод</label><input id="f-ru" data-f="ru" value="${esc(f.ru)}" autocomplete="off"></div>
  <div class="fld"><label for="f-ex">Пример (по желанию)</label><input id="f-ex" data-f="ex" value="${esc(f.ex)}" autocomplete="off"></div>
  <div class="fld"><label for="f-lv">Уровень</label><select id="f-lv" data-f="lv">${LVLS.map(l=>`<option${(f.lv||'B1')===l?' selected':''}>${l}</option>`).join('')}</select></div>
  <div class="fld"><label for="f-c">Коллекция</label><select id="f-c" data-f="c">${cs.map(c=>`<option value="${c.id}"${f.c===c.id?' selected':''}>${c.name}</option>`).join('')}</select></div>
  <button class="btn dark full" style="margin-top:24px" data-act="saveadd">Добавить</button></div></div>`}

/* ---------- render ---------- */
function render(){
  const c=cur();let h='';
  switch(c.v){case'home':h=vHome();break;case'coll':h=vColl(c);break;case'list':h=vList();break;case'card':h=vCard(c);break;case'quiz':h=vQuiz(c);break;case'result':h=vResult(c);break;case'srs':h=vSrs(c);break;case'train':h=vTrain();break;case'dojo':h=vDojo();break;case'today':h=vToday();break;case'lesson':h=vLesson(c);break;case'progress':h=vProgress();break;case'add':h=vAdd(c);break}
  const key=c.v+(c.i!=null?c.i:'');const keepScroll=app.__lastKey===key;
  const old=app.querySelector('.scr'),st=old?old.scrollTop:0;
  app.querySelectorAll('.tabs,.foot,.fb,.scr').forEach(e=>e.remove());
  app.insertAdjacentHTML('afterbegin',h);
  if(keepScroll){const s=app.querySelector('.scr');if(s){s.style.animation='none';s.scrollTop=st}}
  app.__lastKey=key;
  const pg=document.getElementById('pager');
  if(pg)pg.addEventListener('scroll',()=>{const d=document.querySelectorAll('#dots i');const k=pg.scrollLeft>pg.scrollWidth/4?1:0;d.forEach((e,i)=>e.classList.toggle('on',i===k))},{passive:true});
  const q=document.getElementById('q');
  if(q)q.addEventListener('input',()=>{listF.q=q.value;document.getElementById('rows').innerHTML=listRows()});
  if(c.v==='card'||c.v==='quiz'||c.v==='result'){/* no tab bar */}
  smilGate()
}
function renderOv(){
  let o=document.getElementById('ov');if(o)o.remove();
  if(!ov)return;
  let h='';
  if(ov.n==='profile'){
    h=`<div class="ov" id="ov"><div class="scrim" data-act="closeov"></div><div class="sheet" role="dialog" aria-label="Профиль"><div class="row sp"><h2>Профиль</h2><button class="ibtn bare" data-act="closeov" aria-label="Закрыть">${I.close}</button></div>
    <div class="fld"><label for="nm">Как тебя называть</label><input id="nm" value="${esc(P.name)}" maxlength="24" placeholder="Имя" autocomplete="off"></div>
    <p style="color:var(--muted);font-size:13px;margin:8px 0 0;line-height:1.4">Имя иногда появляется в приветствии на главной.</p>
    ${(()=>{const vs=enVoices(),cv=P.voice||'app:us_f';return `<div class="fld"><label for="vc">Голос озвучки</label><div class="row" style="gap:10px"><select id="vc" style="flex:1;min-width:0"><optgroup label="Встроенные в приложение">${AVOICES.map(v=>`<option value="app:${v[0]}"${cv==='app:'+v[0]?' selected':''}>${v[1]}</option>`).join('')}</optgroup>${vs.length?`<optgroup label="Голоса устройства">${vs.map(v=>`<option value="${esc(v.voiceURI)}"${v.voiceURI===cv?' selected':''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</optgroup>`:''}</select><button class="ibtn" data-act="testvoice" aria-label="Проверить голос">${I.spk}</button></div><p style="color:var(--muted);font-size:13px;margin:8px 0 0;line-height:1.4">Встроенные голоса звучат одинаково на любом устройстве. Для слов, которые ты добавил сам, используется голос устройства.</p></div>`})()}
    <div class="fld"><label for="an">Анимация картинок</label><select id="an">${[['calm','Спокойная'],['lively','Живая'],['once','Два раза при показе'],['off','Выключена']].map(a=>`<option value="${a[0]}"${(P.anim||'calm')===a[0]?' selected':''}>${a[1]}</option>`).join('')}</select><button class="link" style="margin-top:8px" data-act="animdemo">Посмотреть анимированные слова</button></div>
    <button class="btn dark full" style="margin-top:18px" data-act="savename">Сохранить</button>
    <div style="text-align:center;margin-top:8px">${ov.confirm?`<span style="font-size:14px">Стереть весь прогресс и свои слова?</span> <button class="reset" data-act="reset2">Да, стереть</button>`:`<button class="reset" data-act="reset1">Сбросить прогресс</button>`}</div></div></div>`}
  else if(ov.n==='lvl'){
    const s=STAGES[ov.s];
    const sp=[[8,30,40,.0],[14,320,90,.6],[10,50,520,1.1],[12,330,560,.3],[8,200,70,.9],[10,290,430,1.4],[6,70,300,.5]].map(x=>`<span class="spark" style="left:${x[1]}px;top:${x[2]}px;animation-delay:${x[3]}s">${I.spark(['#FFE29A','#5FCFC0','#9AA0F2','#F3B6C0'][x[0]%4],x[0]*2)}</span>`).join('');
    h=`<div class="ov lvl" id="ov" role="dialog" aria-label="Новый этап">${sp}<div class="eyebrow" style="color:var(--gold-l)">Новый этап · ${ov.s+1} из 10</div><div class="disc">${cre(ov.s,210)}</div><h1 style="color:#fff;font-size:42px">${s.n}</h1><div style="color:#9FB2C4;margin-top:10px">${s.cefr==='—'?'Легенда':'Уровень '+s.cefr} · от ${nf(s.w)} слов</div><button class="btn full" style="background:#EAF3F9;border-color:#EAF3F9;color:var(--midnight);margin-top:34px;max-width:320px" data-act="closeov">Продолжить</button></div>`}
  app.insertAdjacentHTML('beforeend',h);
}

/* ---------- actions ---------- */
let autoT=null;
function autoNext(act){clearTimeout(autoT);const c=cur(),i=c.i,k=c.v,ok=k==='lesson'?c.tasks[i].done&&c.tasks[i].done.ok:c.ans&&c.ans.ok;
  autoT=setTimeout(()=>{const n=cur();if(n===c&&n.i===i&&n.v===k&&(k==='lesson'?n.tasks[i].done:n.ans))A[act]()},ok?1300:2800)}
const A={
  tab:d=>tab(d.v),back:()=>back(),
  coll:d=>go('coll',{id:d.id}),
  profile:()=>{ov={n:'profile'};renderOv()},
  closeov:()=>{ov=null;renderOv()},
  savename:()=>{P.name=(document.getElementById('nm').value||'').trim();const vc=document.getElementById('vc');if(vc)P.voice=vc.value;const an=document.getElementById('an');if(an){P.anim=an.value;applyAnim()}save();ov=null;renderOv();newGreet();render();toast(P.name?'Привет, '+P.name+'!':'Имя убрано')},
  testvoice:()=>{const vc=document.getElementById('vc');if(vc){P.voice=vc.value;save()}speak('Nice to meet you','s3')},
  srs:()=>startSrs(),
  srsshow:()=>{const c=cur();c.shown=true;render()},
  srsgrade:d=>{const c=cur(),id=c.queue[0],g=+d.g,old=P.srs[id],r=srsCalc(old,g);
    if(!old){if(!P.newToday||P.newToday.d!==dayKey())P.newToday={d:dayKey(),n:0};P.newToday.n++}
    todayInc(old?'rev':'new');P.srs[id]={ease:r.ease,iv:r.iv,n:r.n,due:r.due};
    const l=lvl(id);P.lvl[id]=g===0?Math.min(l,1):g===1?l:g===2?Math.max(l,2):3;
    save();checkLevel();c.cnt[g]++;c.queue.shift();
    if(r.ms<20*MIN)c.queue.push(id);else c.done++;
    c.shown=false;render();flushLevel();srsSpeak()},
  srsq:()=>{nav=[{v:cur().from||'dojo'}];render();flushLevel()},
  djf:d=>{dj.f=d.f;render()},
  animdemo:()=>{const ids=ANIMW.map(w=>(SEED.find(x=>x.en===w)||{}).id).filter(Boolean);ov=null;renderOv();go('card',{ids,i:0,q:[]})},
  today:()=>startToday(),
  goal:d=>{P.goal=+d.g;save();render()},
  lstart:()=>startLesson(),
  lsc:d=>{ls.c=d.c;render()},
  lsq:()=>{nav=[{v:'train'}];render();flushLevel()},
  lsend:()=>{nav=[{v:'dojo'}];render();flushLevel()},
  lsnext:()=>{const c=cur();c.i++;render();lsAfter();flushLevel()},
  lsans:d=>{const c=cur(),t=c.tasks[c.i];if(t.done)return;const f=t.t==='find',pk=f?+d.k:d.id,ok=f?pk===t.a:pk===t.w.id;t.done={ok,pick:pk};lsRec(c,t.w,ok);render();autoNext('lsnext')},
  lsm:d=>{const c=cur(),t=c.tasks[c.i];if(t.done)return;
    if(d.s==='l'){t.sel=d.id}else if(t.sel!=null){if(d.id===t.sel){t.got.push(d.id);t.sel=null;
      if(t.got.length===t.ws.length){t.done={ok:t.miss===0};t.ws.forEach(w=>lsRec(c,w,t.miss<2))}}else{t.miss++;t.sel=null}}
    render();if(t.done)autoNext('lsnext')},
  lscheck:()=>{const c=cur(),t=c.tasks[c.i];if(t.done)return;const el=document.getElementById('ls-in'),v=(el.value||'').trim();if(!v){toast('Введите слово');return}
    const ok=v.toLowerCase()===t.w.en.toLowerCase();t.done={ok,val:v};lsRec(c,t.w,ok);render();autoNext('lsnext')},
  lshint:()=>{const el=document.getElementById('ls-in'),t=cur().tasks[cur().i];if(el){el.value=t.w.en.slice(0,2);el.focus()}},
  lswrite:()=>{const c=cur();c.i++;render();lsAfter()},
  djh:()=>{dj.h=!dj.h;render()},
  djc:d=>{dj.c=d.c;render()},
  reset1:()=>{ov.confirm=true;renderOv()},
  reset2:()=>{P={lvl:{},added:[],bm:{},name:'',bonus:0,seen:0,voice:'app:us_f',srs:{},newToday:{d:'',n:0},cf:''};save();ov=null;renderOv();nav=[{v:'home'}];newGreet();render();toast('Прогресс сброшен')},
  chip:d=>{listF.c=d.c;listF.n=40;render()},
  cf:d=>{P.cf=d.l;save();listF.n=40;const c=cur();if(c.v==='coll')c.n=40;render()},
  more:()=>{const c=cur();c.n=(c.n||40)+60;render()},
  lmore:()=>{listF.n+=60;render()},
  open:d=>{const it=window.__list;go('card',{ids:it.map(x=>x.id),i:+d.i,q:[]})},
  study:d=>{const it=ITEMS().filter(x=>x.coll===d.id);let ids,i=+d.i;
    if(i<0){ids=it.filter(x=>lvl(x.id)<2).map(x=>x.id);if(!ids.length)ids=it.map(x=>x.id);i=0}else ids=it.map(x=>x.id);
    go('card',{ids,i})},
  bm:d=>{P.bm[d.id]=!P.bm[d.id];save();render();toast(P.bm[d.id]?'Добавлено в закладки':'Убрано из закладок')},
  speak:d=>speak(d.t,d.id),
  know:()=>{const c=cur(),id=c.ids[c.i];P.lvl[id]=Math.max(lvl(id),2);save();checkLevel();nextCard(true)},
  repeat:()=>{const c=cur(),id=c.ids[c.i];P.lvl[id]=Math.min(lvl(id),1);save();c.ids.push(id);nextCard(false)},
  quiz:d=>startQuiz(d.id||null),
  quitq:()=>{nav=nav.filter(x=>x.v!=='quiz');if(!nav.length)nav=[{v:'home'}];render();flushLevel()},
  ans:d=>{const c=cur(),q=c.qs[c.i];if(c.ans)return;const ok=d.id===q.it.id;c.ans={ok,pick:d.id};applyAnswer(q,ok,false);c.res.push({it:q.it,ok});render();autoNext('next')},
  pick:d=>{const c=cur(),q=c.qs[c.i];if(c.ans)return;q.ch.push(+d.k);render()},
  unpick:d=>{const c=cur(),q=c.qs[c.i];if(c.ans)return;q.ch=q.ch.filter(k=>k!==+d.k);render()},
  hint:()=>{const c=cur(),q=c.qs[c.i];if(c.ans)return;
    let pre=0;while(pre<q.ch.length&&q.toks.find(t=>t.i===q.ch[pre]).w===q.ans[pre])pre++;
    q.ch=q.ch.slice(0,pre);const used=new Set(q.ch);
    const t=q.toks.find(t=>!used.has(t.i)&&t.w===q.ans[pre]);if(t){q.ch.push(t.i);q.hint=true}render()},
  check:()=>{const c=cur(),q=c.qs[c.i];if(c.ans)return;
    const got=q.ch.map(k=>q.toks.find(t=>t.i===k).w).join(' ');const ok=got===q.ans.join(' ');
    c.ans={ok};applyAnswer(q,ok,q.hint);c.res.push({it:q.it,ok});render();autoNext('next')},
  next:()=>{const c=cur();
    if(c.i+1>=c.qs.length){checkLevel();nav.pop();nav.push({v:'result',res:c.res,before:c.before,scope:c.scope});render();return}
    c.i++;c.ans=null;render()},
  home:()=>{nav=[{v:'home'}];newGreet();render();flushLevel()},
  again:()=>{const s=cur().scope;startQuiz(s);flushLevel()},
  add:d=>go('add',{c:d.c}),
  kind:d=>{const c=cur();c.form.kind=d.k;c.form.c=d.k==='c'?'talk':'travel';render()},
  saveadd:()=>{const c=cur(),f=c.form,en=f.en.trim(),ru=f.ru.trim();
    if(!en||!ru){toast('Заполни слово и перевод');return}
    const id='u'+Date.now();
    let it;
    if(f.kind==='c'){const ws=en.split(/\s+/);if(ws.length<2){toast('В чанке должно быть минимум два слова');return}
      const others=[...new Set(ALL().filter(x=>x.k==='c').flatMap(x=>x.en.split(' ')).filter(w=>!ws.includes(w)))];
      it={id,coll:f.c,k:'c',en:ws.join(' '),ru,ex:f.ex.trim()||en,exr:ru,d:sample(others,3),icon:'chat',lv:f.lv||'B1'}}
    else it={id,coll:f.c,k:'w',en,ipa:'',ru,ex:f.ex.trim()||en,exr:ru,lv:f.lv||'B1'};
    P.added.push(it);save();back();toast('Добавлено: '+en)},
  demo:()=>{P.bonus+=500;save();checkLevel();render();flushLevel()}
};
function nextCard(known){
  const c=cur();
  if(c.i+1>=c.ids.length){nav.pop();render();toast(known?'Набор пройден':'Повтори позже в тренировке');flushLevel();return}
  c.i++;render();flushLevel();
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||!app.contains(b))return;const f=A[b.dataset.act];if(f)f(b.dataset)});
document.addEventListener('input',e=>{const t=e.target;if(t.dataset&&t.dataset.f){const c=cur();if(c.form)c.form[t.dataset.f]=t.value}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='ls-in')A.lscheck()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov){A.closeov()}});
P.seen=Math.max(P.seen,stageOf(learnedN()));
newGreet();applyAnim();render();
