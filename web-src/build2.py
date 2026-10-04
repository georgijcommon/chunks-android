#!/usr/bin/env python3
"""Собирает объединённое приложение: код и данные «Инея» + наш слой (FSRS, выражения, тексты, файлы)."""
import json, re, base64, os, sys

T = '/home/claude/trainer/'
code = open('code.js').read()
data = open('data.js').read()

def rep(old, new, count=1):
    global code
    n = code.count(old)
    assert n == count, f'ожидалось {count}, найдено {n}: {old[:90]!r}'
    code = code.replace(old, new)

def rex(pattern, new):
    global code
    code, n = re.subn(pattern, lambda m: new, code, flags=re.S)
    assert n == 1, f'regex: найдено {n}: {pattern[:80]!r}'

# метки больших данных остаются в data.js
for name in ['CRE', 'ICONS', 'PICS', 'B2', 'AUDIO', 'ANIMW']:
    rep(f'/*@@{name}@@*/\n', '')

# 1. наши выражения и коллекции
rep("icon:'p:'+r[1],lv:'B2'}));",
    "icon:'p:'+r[1],lv:'B2'}));\n"
    "const CU=['выражение','выражения','выражений'];\n"
    "COLLS.splice(3,0,{id:'time',name:'Время',kind:'c',icon:'q:run-out-of-time',unit:CU},{id:'speak',name:'Разговор',kind:'c',icon:'q:make-small-talk',unit:CU},"
    "{id:'agree',name:'Согласие',kind:'c',icon:'q:totally-agree',unit:CU},{id:'decide',name:'Решения',kind:'c',icon:'q:make-a-decision',unit:CU});\n"
    "COLLS.unshift({id:'mine',name:'Из моих текстов',kind:'w',icon:'book',unit:['карточка','карточки','карточек']});\n"
    "Object.keys(KPICS).forEach(k=>ICONS['q:'+k]=kPic(KPICS[k]));\n"
    "KDECK.chunks.forEach(c=>SEED.push(kItem(c,KTOP[c.topic]||'speak','k:'+c.id,'q:'+c.id)));")

# 2. состояние
rep("const KEY='frost43.v1';\nlet P={lvl:{},added:[],bm:{},name:'',bonus:0,seen:0,voice:'app:us_f',srs:{},newToday:{d:'',n:0},cf:'',goal:10,today:null,anim:'calm'};",
    "const KEY='chunks.v2';\n"
    "const defP=()=>({lvl:{},added:[],bm:{},name:'',bonus:0,seen:0,voice:'app:us_f',srs:{},newToday:{d:'',n:0},cf:'',goal:10,today:null,anim:'calm',texts:[],xdecks:{},log:[],ret:.9,migrated:false});\n"
    "let P=defP();")
rep("try{const r=localStorage.getItem(KEY);if(r)P=Object.assign(P,JSON.parse(r))}catch(e){}",
    "try{const r=localStorage.getItem(KEY);if(r)P=Object.assign(P,JSON.parse(r))}catch(e){}\n"
    "for(const k of ['added','texts','log'])if(!Array.isArray(P[k]))P[k]=[];for(const k of ['lvl','bm','srs','xdecks'])if(!P[k]||typeof P[k]!=='object')P[k]={};\n"
    "for(const [id,dk] of Object.entries(P.xdecks)){if(validDeck(dk))continue;COLLS.push({id:'d:'+id,name:dk.title||id,kind:'c',icon:'chat',unit:CU});dk.chunks.forEach(c=>SEED.push(kItem(c,'d:'+id,'x:'+id+':'+c.id,'chat')))}")
rep("P={lvl:{},added:[],bm:{},name:'',bonus:0,seen:0,voice:'app:us_f',srs:{},newToday:{d:'',n:0},cf:''};",
    "P=Object.assign(defP(),{texts:P.texts,xdecks:P.xdecks,voice:P.voice,anim:P.anim,ret:P.ret,migrated:true});")

# 3. расписание: FSRS вместо множителя лёгкости
rep("const srsItems=()=>ITEMS().filter(x=>x.k==='w'&&x.icon);", "const srsItems=()=>ITEMS();")
rex(r"function srsCalc\(c,g\)\{.*?\n(?=function fmtIv)",
    "function dayN(ms){const d=new Date(ms);return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/DAY)}\n"
    "// Оценки 0..3 («Не помню» … «Отлично») соответствуют оценкам FSRS 1..4. Срок считается в целых днях от начала сегодняшнего дня.\n"
    "function srsCalc(c,g){\n"
    "  const now=Date.now(),has=c&&typeof c.s==='number',t=has&&c.last!=null?Math.max(0,dayN(now)-c.last):0;\n"
    "  const o=FSRS.options(has?{s:c.s,d:c.d}:null,t,P.ret||.9)[g],sod=new Date();sod.setHours(0,0,0,0);\n"
    "  return {s:o.s,d:o.d,last:dayN(now),n:(c&&c.n||0)+1,lapses:(c&&c.lapses||0)+(has&&g===0?1:0),ms:o.ivl*DAY,due:sod.getTime()+o.ivl*DAY}}\n"
    "const srsKeep=(r,ex)=>({s:r.s,d:r.d,last:r.last,n:r.n,lapses:r.lapses,due:r.due,ex:ex||''});\n"
    "const mineFirst=a=>a.filter(x=>x.coll==='mine').concat(a.filter(x=>x.coll!=='mine'));\n")
rep("NEW_PER_DAY-nt", "(P.goal||10)-nt")
rep("b.weak.sort((a,c)=>P.srs[a.id].ease-P.srs[c.id].ease||lvl(a.id)-lvl(c.id));",
    "b.weak.sort((a,c)=>(P.srs[c.id].d||0)-(P.srs[a.id].d||0)||lvl(a.id)-lvl(c.id));")
rep("Повторение по картинкам</div><h1>Додзе</h1>", "Повторение по расписанию</div><h1>Додзе</h1>")
rex(r"<p class=\"dp\">.*?</p>",
    "<p class=\"dp\">Слово открывается с картинкой и озвучкой, без перевода: вспомните значение и оцените себя. Выражение нужно применить: вписать в пропуск, перевести или использовать в своём ответе. Чем лучше оценка, тем позже карточка вернётся. Сроки считает алгоритм FSRS, как в Anki.</p>")

# 4. экран повторения
rep("  const x=ALL().find(z=>z.id===p.queue[0]);\n  const stars=",
    "  const x=ALL().find(z=>z.id===p.queue[0]);\n"
    "  if(canApply(x)){if(!p.ex||p.ex.id!==x.id)p.ex={id:x.id,kind:pickApply(x)};const r=srsApplyBody(p,x);\n"
    "    return `<div class=\"scr nopad\" style=\"padding-bottom:${r.pad}px\">${barTop(p.done,n,'srsq')}${r.body}</div>${r.foot}`}\n"
    "  const stars=")
rep("<div class=\"dome sm\">${stars}${icon(x.icon,150)}</div>\n   <div class=\"word\" style=\"font-size:46px;margin-top:10px\">",
    "<div class=\"dome sm\">${stars}${artOf(x,150)}</div>\n   <div class=\"word\" style=\"font-size:${x.en.length>22?30:x.en.length>14?36:46}px;margin-top:10px\">")
rep("margin-top:10px\">${exh}</div>`:''}`}", "margin-top:10px\">${exh}</div>`:''}${x.exr?`<div class=\"exr\">${esc(x.exr)}</div>`:''}${noteOf(x)}`}")
rep("const x=ALL().find(z=>z.id===c.queue[0]);if(x)speak(x.en,x.id)}", "const x=ALL().find(z=>z.id===c.queue[0]);if(x&&!canApply(x))speak(x.en,x.id)}")
rex(r"  srsgrade:d=>\{.*?c\.shown=false;render\(\);flushLevel\(\);srsSpeak\(\)\},",
    "  srsgrade:d=>{const c=cur(),id=c.queue[0],g=+d.g,old=P.srs[id],r=srsCalc(old,g);c.rq=c.rq||{};const rep=!!c.rq[id],mine=c.ex&&c.ex.id===id;\n"
    "    if(!old){if(!P.newToday||P.newToday.d!==dayKey())P.newToday={d:dayKey(),n:0};P.newToday.n++}\n"
    "    if(!rep)todayInc(old?'rev':'new');P.srs[id]=srsKeep(r,mine?c.ex.kind:(old&&old.ex));\n"
    "    P.log.push({t:Date.now(),id,g,ex:mine?c.ex.kind:'card',ans:mine?String(c.ex.val||'').slice(0,300):''});if(P.log.length>5000)P.log.splice(0,P.log.length-5000);\n"
    "    const l=lvl(id);P.lvl[id]=g===0?Math.min(l,1):g===1?l:g===2?Math.max(l,2):3;\n"
    "    save();checkLevel();c.cnt[g]++;c.queue.shift();\n"
    "    if(g===0&&(c.rq[id]=(c.rq[id]||0)+1)<=2)c.queue.push(id);else c.done++;\n"
    "    c.shown=false;c.ex=null;render();flushLevel();srsSpeak()},")

# 5. урок
rep("const lsWords=()=>ALL().filter(x=>x.k==='w'&&x.icon);", "const lsWords=()=>ALL().filter(x=>x.k==='w');")
rep("const lsOthers=(w,n,f)=>sample(lsWords().filter(x=>x.id!==w.id&&(!f||f(x))),n);",
    "const lsOthers=(w,n,f)=>sample(ALL().filter(x=>x.id!==w.id&&x.k===w.k&&(!f||f(x))),n);\nconst hasPic=x=>!!(x.icon&&x.icon!=='chat'&&ICONS[x.icon]);")
rep("shuffle(ws).forEach(w=>T.push({st:1,t:'w2p',w,opts:shuffle([w].concat(lsOthers(w,3,x=>x.icon!==w.icon)))}));",
    "shuffle(ws).filter(hasPic).forEach(w=>T.push({st:1,t:'w2p',w,opts:shuffle([w].concat(lsOthers(w,3,x=>hasPic(x)&&x.icon!==w.icon)))}));")
rep("ws.filter(w=>w.ex).slice(0,2).forEach(w=>{const toks=w.ex.split", "ws.filter(w=>w.ex&&w.k==='w'&&!w.ctx).slice(0,2).forEach(w=>{const toks=w.ex.split")
rep("  shuffle(ws).forEach(w=>{\n    const toks=(w.ex||'').split(/\\s+/)",
    "  shuffle(ws).forEach(w=>{\n"
    "    if(w.form){T.push({st:2,t:'gap',w,gap:w.form.s.replace('___','____'),opts:shuffle([{id:w.id,en:w.form.a},{id:'_a',en:w.form.d[0]},{id:'_b',en:w.form.d[1]}])});return}\n"
    "    if(w.k==='c'){T.push({st:2,t:'rt',w,opts:shuffle([w].concat(lsOthers(w,3,x=>x.en!==w.en)))});return}\n"
    "    const toks=(w.ex||'').split(/\\s+/)")
rep("sample(ws,3).forEach(w=>T.push({st:4,t:'tr',w,opts:shuffle([w].concat(lsOthers(w,3,x=>x.ru!==w.ru)))}));\n  return T}",
    "sample(ws,3).forEach(w=>T.push({st:4,t:'tr',w,opts:shuffle([w].concat(lsOthers(w,3,x=>x.ru!==w.ru)))}));\n  lsChunkTasks(ws,T);\n  return T}")
rep("let pool=ITEMS().filter(x=>x.k==='w'&&x.icon&&(!ls.c||x.coll===ls.c));", "let pool=ITEMS().filter(x=>!ls.c||x.coll===ls.c);")
rep("const fresh=shuffle(pool.filter(x=>!P.srs[x.id]&&lvl(x.id)<2)),", "const fresh=mineFirst(shuffle(pool.filter(x=>!P.srs[x.id]&&lvl(x.id)<2))),")
rep("const old=lsWords().filter(x=>!ids.has(x.id)&&P.srs[x.id])", "const old=ALL().filter(x=>!ids.has(x.id)&&P.srs[x.id])")
rep("(t.t==='intro'||t.t==='w2p'))speak(t.w.en,t.w.id);if(t&&t.t==='type'&&!t.done)", "(t.t==='intro'||t.t==='w2p'))speak(t.w.en,t.w.id);if(t&&(t.t==='type'||t.t==='gapt')&&!t.done)")
rep("P.srs[w.id]={ease:r.ease,iv:r.iv,n:r.n,due:r.due};todayInc('new')", "P.srs[w.id]=srsKeep(r);P.log.push({t:Date.now(),id:w.id,g:m===0?2:m===1?1:0,ex:'lesson',ans:''});todayInc('new')")
rep("<div class=\"dome sm\" style=\"margin-top:14px\">${icon(w.icon,150)}</div><div class=\"word\" style=\"font-size:46px;margin-top:10px\">",
    "<div class=\"dome sm\" style=\"margin-top:14px\">${artOf(w,150)}</div><div class=\"word\" style=\"font-size:${w.en.length>22?30:w.en.length>14?36:46}px;margin-top:10px\">")
rep("margin-top:10px\">${exh}</div>`:''}`;", "margin-top:10px\">${exh}</div>`:''}${w.exr?`<div class=\"exr\">${esc(w.exr)}</div>`:''}${noteOf(w)}`;")
rep("<div class=\"dome sm\" style=\"margin:0\">${icon(w.icon,130)}</div>", "<div class=\"dome sm\" style=\"margin:0\">${artOf(w,130)}</div>")
rep("  case 'write':",
    "  case 'span':case 'build':case 'gapt':body=lsExtraBody(t,a,w);\n"
    "    if(!a)foot=t.t==='span'?`<div class=\"foot\"><button class=\"btn dark full\" data-act=\"lsspanok\" ${t.sel.length?'':'disabled'}>Проверить</button></div>`\n"
    "      :`<div class=\"foot btns\"><button class=\"btn\" data-act=\"${t.t==='build'?'lsbh':'lshint'}\">Подсказка</button><button class=\"btn dark\" data-act=\"${t.t==='build'?'lsbc':'lscheck'}\">Проверить</button></div>`;break;\n"
    "  case 'write':")
rep("let sub=ans;if(t.t==='gap')sub=esc(w.ex)+'<br>'+ans;", "let sub=ans;if(t.t==='gap')sub=esc(w.form?w.form.s.replace('___',w.form.a):w.ex)+'<br>'+ans;")
rep("'Есть ошибки — повторите слова позже';", "'Есть ошибки — повторите слова позже';if(t.t==='gapt')sub=esc(fillGap(t.g.s,t.g.a[0]));if(!a.ok&&w.err&&t.t!=='match')sub+='<br>Типичная ошибка: '+esc(w.err);")
rep("const ok=v.toLowerCase()===t.w.en.toLowerCase();", "const ok=t.t==='gapt'?t.g.a.some(x=>normA(x)===normA(v)):v.toLowerCase()===t.w.en.toLowerCase();")
rep("if(el){el.value=t.w.en.slice(0,2);el.focus()}", "if(el){el.value=(t.t==='gapt'?t.g.a[0]:t.w.en).slice(0,2);el.focus()}")
rep("ITEMS().some(x=>x.coll===c.id&&x.k==='w'&&x.icon)", "ITEMS().some(x=>x.coll===c.id)")
rep("6 слов за 4 этапа", "6 карточек за 4 этапа")
rep("const nw=shuffle(srsItems().filter(x=>!P.srs[x.id])).slice(0,left);", "const nw=mineFirst(shuffle(srsItems().filter(x=>!P.srs[x.id]))).slice(0,left);")

# 6. тренировка и карточка
rep("if(it.k==='c'){const ans=it.en.split(' ');", "if(it.k==='c'&&it.d&&it.d.length){const ans=it.en.split(' ');")
rep("${icon(q.it.icon,100)}</div>", "${artOf(q.it,100)}</div>")
rep("${x.ex?`<div class=\"ex\">${exh}</div><div class=\"exr\">${esc(x.exr)}</div>`:''}</div>",
    "${x.ex?`<div class=\"ex\">${exh}</div><div class=\"exr\">${esc(x.exr)}</div>`:''}${x.ex2?`<div class=\"ex\" style=\"font-size:20px\">${esc(x.ex2)}</div>`:''}${noteOf(x)}${x.src?`<div class=\"exr\">Из текста «${esc(x.src)}»</div>`:''}</div>")

# 7. входы в тексты, профиль, прочее
TEXTS_CARD = ("<button class=\"srsc\" style=\"width:100%;text-align:left\" data-act=\"texts\"><div style=\"flex:1;min-width:0\"><div class=\"eyebrow\">Мои тексты</div>"
    "<div style=\"font-size:13px;color:var(--muted);margin-top:6px;line-height:1.4\">${P.texts.length?P.texts.length+' '+plural(P.texts.length,['текст','текста','текстов'])+' · слов из них: '+P.added.filter(x=>x.srcId).length:'Загрузите свой текст, переводите предложения и выбирайте слова для изучения.'}</div></div>"
    "<span style=\"color:var(--glacier)\">${I.next}</span></button>")
rep("  <div class=\"sec\"><h2>Коллекции</h2>", "  <div class=\"pad\">" + TEXTS_CARD + "</div>\n  <div class=\"sec\"><h2>Коллекции</h2>")
rep("  <button class=\"srsc\" style=\"width:100%;text-align:left\" data-act=\"tab\" data-v=\"dojo\">", "  " + TEXTS_CARD + "\n  <button class=\"srsc\" style=\"width:100%;text-align:left\" data-act=\"tab\" data-v=\"dojo\">")
rep("Повторение по картинкам с озвучкой теперь в отдельном режиме.", "Повторение по расписанию: слова по картинкам, выражения через применение.")
rep("<div style=\"text-align:center\"><button class=\"demo\" data-act=\"demo\">Демо: добавить 500 слов, чтобы увидеть новый этап</button></div>", "")
rep("    <button class=\"btn dark full\" style=\"margin-top:18px\" data-act=\"savename\">Сохранить</button>",
    "    <div class=\"fld\"><label for=\"rt\">Желаемое удержание</label><select id=\"rt\">${[.85,.9,.95].map(v=>`<option value=\"${v}\"${Math.abs((P.ret||.9)-v)<.001?' selected':''}>${Math.round(v*100)}%</option>`).join('')}</select>"
    "<p style=\"color:var(--muted);font-size:13px;margin:8px 0 0;line-height:1.4\">С какой вероятностью вы должны помнить карточку к моменту повторения. 85%: меньше повторений. 95%: надёжнее, но повторений заметно больше.</p></div>\n"
    "    <button class=\"btn dark full\" style=\"margin-top:18px\" data-act=\"savename\">Сохранить</button>\n"
    "    <div class=\"fld\"><label>Данные</label><div class=\"btns\"><button class=\"btn\" style=\"flex:1;padding:0 8px\" data-act=\"exp\">В файл</button><button class=\"btn\" style=\"flex:1;padding:0 8px\" data-act=\"imp\">Из файла</button></div>"
    "<p style=\"color:var(--muted);font-size:13px;margin:8px 0 0;line-height:1.4\">Прогресс, тексты и свои слова хранятся на этом устройстве. Сохраняйте их файлом, чтобы перенести или не потерять.</p></div>\n"
    "    <div class=\"fld\"><label>Колоды выражений</label>${Object.entries(P.xdecks).map(([id,k])=>`<div class=\"row sp\" style=\"font-size:15px\"><span>${esc(k.title||id)} · ${k.chunks.length}</span><button class=\"reset\" data-act=\"deckdel\" data-id=\"${esc(id)}\">Удалить</button></div>`).join('')}"
    "<div class=\"btns\"><button class=\"btn\" style=\"flex:1;padding:0 8px\" data-act=\"deckimp\">Добавить</button><button class=\"btn\" style=\"flex:1;padding:0 8px\" data-act=\"decksample\">Образец</button></div></div>")
rep("const an=document.getElementById('an');if(an){P.anim=an.value;applyAnim()}save();", "const an=document.getElementById('an');if(an){P.anim=an.value;applyAnim()}const rt=document.getElementById('rt');if(rt)P.ret=+rt.value;save();")
rep("function deviceSpeak(t){try{", "function deviceSpeak(t){if(window.Android&&Android.speak){Android.speak(t);return}try{")
rep("  closeov:()=>{ov=null;renderOv()},", "  closeov:()=>{const s=ov&&ov.n==='sent';ov=null;renderOv();if(s&&cur().v==='read'){cur().on=null;render()}},")
rep("  if(ov.n==='profile'){\n", "  if(ov.n==='sent'){h=sentSheet()}\n  else if(ov.n==='profile'){\n")
rep("case'add':h=vAdd(c);break}", "case'add':h=vAdd(c);break;case'texts':h=vTexts();break;case'read':h=vRead(c);break}")

# 8. запуск: наш слой и перенос данных прежней версии
extra = open('extra.js').read()
rep("P.seen=Math.max(P.seen,stageOf(learnedN()));",
    extra + "\n"
    "if(!P.migrated){try{const r=localStorage.getItem('chunk-trainer/v1');if(r){const o=cleanP(fromOld(JSON.parse(r)));Object.assign(P.srs,o.srs);Object.assign(P.lvl,o.lvl);"
    "P.added=P.added.concat(o.added);P.texts=P.texts.concat(o.texts);P.ret=o.ret;P.goal=o.goal}}catch(e){}P.migrated=true;save()}\n"
    "P.seen=Math.max(P.seen,stageOf(learnedN()));")

# ---------- шрифты ----------
def faces():
    out = []
    for pkg, fam, files in [('cormorant-garamond', 'Cormorant Garamond', ['wght.css', 'wght-italic.css']), ('onest', 'Onest', ['wght.css'])]:
        base = T + f'node_modules/@fontsource-variable/{pkg}/'
        for cf in files:
            for block in re.findall(r'/\* [\w-]+ \*/\s*@font-face \{.*?\}', open(base + cf).read(), re.S):
                name = re.match(r'/\* ([\w-]+) \*/', block).group(1)
                if not re.search(r'-(latin|cyrillic)-wght', name): continue
                m = re.search(r'url\(\./files/([\w.-]+\.woff2)\)', block)
                b64 = base64.b64encode(open(base + 'files/' + m.group(1), 'rb').read()).decode()
                block = re.sub(r'src:.*?;', f"src:url(data:font/woff2;base64,{b64}) format('woff2');", block, flags=re.S)
                block = re.sub(r"font-family:\s*'[^']+';", f"font-family:'{fam}';", block)
                block = re.sub(r'/\*.*?\*/\s*', '', block).replace('font-display: swap;', 'font-display:block;')
                out.append(re.sub(r'\s+', ' ', block))
    return '\n'.join(out)

CSS_ADD = """
.gr.sug{box-shadow:0 0 0 2px var(--glacier) inset;border-color:var(--glacier)}
.note{margin:14px 28px 0;padding:10px 14px;border-radius:16px;background:#FFF6DF;font-size:13px;color:var(--muted);line-height:1.4;text-align:left}
.note b{color:var(--ink);font-weight:600}
.pad .note{margin-inline:0}
.model{margin-top:14px;padding:12px 16px;border-radius:18px;background:#E9F8F5;border:1px solid var(--aqua);font-family:var(--serif);font-style:italic;font-size:22px;line-height:1.25}
.model span{display:block;font:500 12px var(--sans);letter-spacing:.18em;text-transform:uppercase;color:var(--glacier);margin-bottom:4px}
.lsin.okf{border-color:var(--aqua);background:#E9F8F5}
.lsin.nof{border-color:var(--rose);background:#FDEFF2}
.rd p{font-family:var(--serif);font-size:21px;line-height:1.55;margin:0 28px 16px}
.rd .s{cursor:pointer;border-radius:4px}
.rd .s.on{background:#DCEBF5;box-shadow:0 2px 0 var(--glacier)}
.pill.sm{height:38px;padding:0 14px;font-size:19px;border-radius:19px}
.sntr{font-family:var(--serif);font-size:22px;line-height:1.2;margin-top:12px}
.sheet{max-height:92%;overflow-y:auto}
"""

deck = json.load(open(T + 'deck.json')); pics = json.load(open(T + 'pics.json'))
fsrs = open(T + 'fsrs.js').read().replace("if (typeof module !== 'undefined') module.exports = FSRS;", '')
J = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
pre = open('pre.js').read().replace('/*__FSRS__*/', fsrs).replace('/*__DECK__*/', J(deck)).replace('/*__PICS__*/', J(pics))

html = ('<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="color-scheme" content="light">\n<title>Чанки</title>\n'
        '<style>\n' + faces() + '\n[hidden]{display:none!important}\n' + open('style1.css').read() + CSS_ADD + '</style>\n</head>\n<body>\n'
        '<div class="stage"><div class="app" id="app"></div></div>\n'
        '<script>\n' + data.replace('</', '<\\/') + '\n</script>\n<script>\n' + pre + '\n' + code + '\n</script>\n</body>\n</html>\n')
assert '@@' not in code
open('chunks.html', 'w').write(html)
print('ok; html', len(html.encode()) // 1024, 'KB; code', len(code) // 1024, 'KB')
