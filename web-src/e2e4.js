const { chromium } = require('playwright-core');
const fs=require('fs');
const exe=require('child_process').execSync('ls -d /opt/pw-browsers/chromium*/chrome-linux*/chrome 2>/dev/null | head -1').toString().trim();
const TEXT=`The meeting was a disaster. Nobody had read the report, so we had to start from scratch. In the end, we decided to call it a day and try again on Monday.\n\nМы решили попробовать ещё раз в понедельник.`;
const errors=[]; const dir='/tmp/pw4-'+Date.now();
async function open(offset,mock,d=dir,pre){
  const ctx=await chromium.launchPersistentContext(d,{executablePath:exe,viewport:{width:390,height:844},acceptDownloads:true});
  const page=ctx.pages()[0];
  await page.addInitScript(([off,mock,pre])=>{const R=Date,dd=off*864e5; class D extends R{constructor(...a){ if(a.length) super(...a); else super(R.now()+dd);} static now(){return R.now()+dd;}}; window.Date=D;
    if(pre&&!localStorage.getItem('chunks.v2')&&!localStorage.getItem('chunk-trainer/v1')) localStorage.setItem('chunk-trainer/v1',pre);
    if(mock) window.Android={translate:(id,text,from,to)=>setTimeout(()=>window.onTranslated(id,true,(to==='ru'?'ПЕРЕВОД: ':'TRANSLATION: ')+text),40),speak:()=>{}}; else { try{ delete self.Translator; }catch(e){} }},[offset,mock,pre||'']);
  page.on('pageerror',e=>errors.push(String(e))); page.on('console',m=>{if(m.type()==='error')errors.push(m.text());}); page.on('dialog',d=>d.accept());
  await page.goto('file://'+__dirname+'/chunks.html'); await page.waitForTimeout(400); return {ctx,page};
}
const act=(page,a,extra='')=>page.locator(`[data-act=${a}]${extra}`).first().click();
const shot=(page,n)=>page.waitForTimeout(450).then(()=>page.screenshot({path:`m-${n}.png`}));
async function lesson(page,shots){
  const seen={}; let guard=0, wrongDone=false;
  while(true){
    if(++guard>120) throw new Error('lesson loop');
    const st=await page.evaluate(()=>{const c=cur(); if(c.v!=='lesson') return {v:c.v}; if(c.i>=c.tasks.length) return {end:true,n:c.tasks.length};
      const t=c.tasks[c.i]; const w=t.w||t.ws[0];
      return {t:t.t,st:t.st,id:w.id,a:t.a,L:t.L,hit:t.hit,en:w.en,g:t.g&&t.g.a[0],form:!!w.form&&t.t==='gap',
        order:t.t==='build'?t.ans.map((x,k)=>{const used=[];return null;}):null,
        build:t.t==='build'?(()=>{const used=new Set();return t.ans.map(x=>{const k=t.toks.find(z=>z.w===x&&!used.has(z.i));used.add(k.i);return k.i})})():null,
        opts:t.opts?t.opts.map(o=>o.id):null}});
    if(st.end){ console.log('  lesson tasks:',st.n,JSON.stringify(seen)); return; }
    if(st.v) throw new Error('left lesson: '+st.v);
    seen[st.t]=(seen[st.t]||0)+1;
    const snap=async()=>{ if(shots&&!shots[st.t]){shots[st.t]=1; await shot(page,'ls-'+st.t);} };
    if(st.t==='intro'){ await snap(); await act(page,'lsnext'); }
    else if(['w2p','tr','rt','gap','odd'].includes(st.t)){
      const wrong=st.form&&!wrongDone; if(wrong) wrongDone=true;
      await page.locator(`[data-act=lsans][data-id="${wrong?st.opts.find(o=>o!==st.id):st.id}"]`).click(); await snap();
      if(wrong){ const fb=await page.locator('.fb').innerText(); if(!/Не совсем/.test(fb)) throw new Error('expected wrong fb'); await shot(page,'ls-gap-wrong'); }
      await act(page,'lsnext'); }
    else if(st.t==='find'){ await page.locator(`[data-act=lsans][data-k="${st.a}"]`).click(); await snap(); await act(page,'lsnext'); }
    else if(st.t==='match'){ await snap(); for(const id of st.L){ await page.locator(`[data-act=lsm][data-s=l][data-id="${id}"]`).click(); await page.locator(`[data-act=lsm][data-s=r][data-id="${id}"]`).click(); } await act(page,'lsnext'); }
    else if(st.t==='span'){ for(let i=0;i<st.hit.length;i++) if(st.hit[i]) await page.locator(`[data-act=lsspan][data-k="${i}"]`).click(); await snap(); await act(page,'lsspanok');
      if(!/Верно/.test(await page.locator('.fb').innerText())) throw new Error('span not ok'); await act(page,'lsnext'); }
    else if(st.t==='build'){ for(const k of st.build) await page.locator(`[data-act=lsbp][data-k="${k}"]`).click(); await snap(); await act(page,'lsbc');
      if(!/Верно/.test(await page.locator('.fb').innerText())) throw new Error('build not ok'); await act(page,'lsnext'); }
    else if(st.t==='type'||st.t==='gapt'){ await page.fill('#ls-in',st.t==='gapt'?st.g.toUpperCase()+'.':st.en); await act(page,'lscheck'); await snap();
      if(!/Верно/.test(await page.locator('.fb').innerText())) throw new Error(st.t+' not ok: '+st.en); await act(page,'lsnext'); }
    else if(st.t==='write'){ await snap(); await page.locator('[data-act=lswrite][data-ok="1"]').click(); }
    else throw new Error('unknown task '+st.t);
  }
}
async function srs(page,shots,label){
  const modes={}; let guard=0;
  while(true){
    if(++guard>80) throw new Error('srs loop');
    const st=await page.evaluate(()=>{const c=cur(); if(c.v!=='srs') return {v:c.v}; if(!c.queue.length) return {end:true,cnt:c.cnt};
      const x=ALL().find(z=>z.id===c.queue[0]); const ap=canApply(x); return {ap,kind:c.ex&&c.ex.id===x.id?c.ex.kind:null,id:x.id,ans:ap&&gapsOf(x)[0]?gapsOf(x).map(g=>g.a[0]):null}});
    if(st.end){ console.log('  '+label+' grades:',JSON.stringify(st.cnt),JSON.stringify(modes)); return; }
    if(st.v) throw new Error('left srs: '+st.v);
    if(!st.ap){ modes.card=(modes.card||0)+1; if(shots&&!shots.card){shots.card=1; await shot(page,'srs-card');} await act(page,'srsshow'); await page.locator('[data-act=srsgrade][data-g="2"]').click(); continue; }
    const kind=await page.evaluate(()=>cur().ex.kind); modes[kind.replace(/\d/,'')]=(modes[kind.replace(/\d/,'')]||0)+1;
    if(kind.startsWith('gap')){ const wrong=!modes.wrong&&modes.gap===2; if(wrong) modes.wrong=1;
      await page.fill('#sx-in',wrong?'nonsense':st.ans[+kind.slice(3)]||st.ans[0]); await act(page,'sxcheck');
      const sug=await page.locator('.gr.sug').innerText(); if(wrong?!/Не помню/.test(sug):!/Хорошо/.test(sug)) throw new Error('bad suggestion: '+sug+' for '+st.id);
      if(shots&&!shots['gap'+wrong]){shots['gap'+wrong]=1; await shot(page,'srs-gap-'+(wrong?'wrong':'right'));}
      await page.locator('.gr.sug').click(); }
    else { await page.fill('#sx-tx','My answer.'); if(shots&&!shots[kind+'q']){shots[kind+'q']=1; await shot(page,'srs-'+kind+'-q');} await act(page,'sxshow'); if(shots&&!shots[kind]){shots[kind]=1; await shot(page,'srs-'+kind);} await page.locator('[data-act=srsgrade][data-g="2"]').click(); }
  }
}
(async()=>{
  const shots={};
  let {ctx,page}=await open(0,false);
  await shot(page,'home');
  console.log('home h1:',await page.locator('h1').first().innerText(),'| collections:',await page.locator('.coll').count());
  const P0=await page.evaluate(()=>({items:ALL().length,colls:COLLS.map(c=>c.id).join(','),chunks:ALL().filter(x=>x.k==='c').length,icons:Object.keys(ICONS).filter(k=>k.startsWith('q:')).length}));
  console.log('data:',JSON.stringify(P0));
  await page.locator('[data-act=coll][data-id=time]').click(); await shot(page,'coll'); await page.locator('[data-act=study]').nth(1).click(); await shot(page,'card'); await page.evaluate(()=>window.appBack()); await page.evaluate(()=>window.appBack());
  // урок по теме «Время»
  await act(page,'tab','[data-v=train]'); await shot(page,'train'); await page.locator('[data-act=lsc][data-c=time]').click(); await act(page,'lstart');
  console.log('lesson 1 (chunks):'); await lesson(page,shots); await shot(page,'ls-end');
  let st=await page.evaluate(()=>({srs:Object.entries(P.srs).map(([k,c])=>k+' s='+c.s.toFixed(2)+' +'+Math.round((c.due-new Date().setHours(0,0,0,0))/864e5)+'d'),log:P.log.length,today:P.today}));
  console.log('  after lesson:',JSON.stringify(st));
  await act(page,'lsend'); await shot(page,'dojo');
  // урок по словам
  await act(page,'tab','[data-v=train]'); await page.locator('[data-act=lsc][data-c=travel]').click(); await act(page,'lstart'); console.log('lesson 2 (words):'); await lesson(page,null); await act(page,'lsend');
  // быстрая тренировка по коллекции выражений
  await act(page,'tab','[data-v=home]'); await page.locator('[data-act=coll][data-id=agree]').click(); await page.locator('[data-act=quiz]').click();
  for(let i=0;i<8;i++){ const q=await page.evaluate(()=>{const c=cur();if(c.v!=='quiz')return null;const q=c.qs[c.i];return {t:q.t,id:q.it.id,build:q.t==='build'?(()=>{const u=new Set();return q.ans.map(x=>{const k=q.toks.find(z=>z.w===x&&!u.has(z.i));u.add(k.i);return k.i})})():null}});
    if(!q) break; if(q.t==='build'){ for(const k of q.build) await page.locator(`[data-act=pick][data-k="${k}"]`).click(); if(i===0) await shot(page,'quiz-build'); await act(page,'check'); } else await page.locator(`[data-act=ans][data-id="${q.id}"]`).click(); await act(page,'next'); }
  console.log('quiz result:',(await page.locator('.ring').innerText()).replace(/\s+/g,' ')); await shot(page,'result'); await act(page,'home');
  await act(page,'tab','[data-v=today]'); await shot(page,'today'); await act(page,'tab','[data-v=progress]'); await shot(page,'progress');
  // профиль: экспорт
  await act(page,'tab','[data-v=home]'); await act(page,'profile'); await shot(page,'profile');
  const [dl]=await Promise.all([page.waitForEvent('download'),act(page,'exp')]); await dl.saveAs('exp.json'); console.log('export:',JSON.parse(fs.readFileSync('exp.json')).format);
  await ctx.close();
  // через 3 дня: Додзе с применением
  ({ctx,page}=await open(3,false)); await act(page,'tab','[data-v=dojo]'); console.log('day3 dojo:',(await page.locator('.dst').innerText()).replace(/\s+/g,' ')); await act(page,'srs'); await srs(page,shots,'day3'); await shot(page,'srs-end'); await ctx.close();
  ({ctx,page}=await open(30,false)); await act(page,'tab','[data-v=today]'); console.log('day30 today:',(await page.locator('p').first().innerText())); await act(page,'today'); await srs(page,shots,'day30'); 
  await act(page,'home'); await act(page,'profile');
  let [fc]=await Promise.all([page.waitForEvent('filechooser'),act(page,'imp')]); await fc.setFiles('exp.json'); await page.waitForTimeout(700);
  console.log('after import: srs',await page.evaluate(()=>Object.keys(P.srs).length),'log',await page.evaluate(()=>P.log.length));
  const d2=JSON.parse(fs.readFileSync('/home/claude/trainer/deck.json')); d2.id='second'; d2.title='Вторая колода'; d2.chunks=d2.chunks.slice(0,5); fs.writeFileSync('deck2.json',JSON.stringify(d2));
  await act(page,'profile'); [fc]=await Promise.all([page.waitForEvent('filechooser'),act(page,'deckimp')]); await fc.setFiles('deck2.json'); await page.waitForTimeout(700);
  console.log('deck import: coll',await page.evaluate(()=>COLLS.some(c=>c.id==='d:second')),'items',await page.evaluate(()=>ALL().filter(x=>x.coll==='d:second').length));
  await ctx.close();
  // тексты с переводчиком
  ({ctx,page}=await open(0,true,dir+'b')); await act(page,'texts'); await shot(page,'texts'); await page.fill('#tx-new',TEXT); await act(page,'txadd');
  console.log('sentences:',await page.locator('.rd .s').count()); await page.locator('.rd .s',{hasText:'start from scratch'}).click(); await page.waitForTimeout(250);
  console.log('tr:',await page.locator('.sntr').innerText());
  const toks=page.locator('[data-act=sntok]'); const n=await toks.count(); let i0=-1; for(let i=0;i<n;i++) if((await toks.nth(i).innerText())==='start') i0=i;
  await toks.nth(i0).click(); await toks.nth(i0+2).click(); await page.waitForTimeout(250);
  console.log('learn:',await page.inputValue('#sn-en'),'| mean:',await page.inputValue('#sn-ru')); await page.fill('#sn-ru','начать с нуля'); await shot(page,'sheet'); await act(page,'snadd');
  for(let i=0;i<n;i++) if((await toks.nth(i).innerText())==='report,'){ await toks.nth(i).click(); break; }
  await page.waitForTimeout(250); await page.fill('#sn-ru','отчёт'); await act(page,'snadd'); await page.evaluate(()=>window.appBack());
  await page.locator('.rd .s',{hasText:'понедельник'}).click(); await page.waitForTimeout(300); console.log('ru whole learn:',await page.inputValue('#sn-en')); await page.fill('#sn-en','We decided to try again on Monday.'); await act(page,'snadd'); await page.evaluate(()=>window.appBack());
  console.log('added:',JSON.stringify(await page.evaluate(()=>P.added.map(a=>[a.en,a.k,a.ctx?'ctx':'-',a.coll]))));
  await page.evaluate(()=>{window.appBack();window.appBack();}); console.log('home mine coll:',await page.locator('[data-act=coll][data-id=mine]').count());
  await act(page,'tab','[data-v=today]'); await act(page,'today'); const first=await page.evaluate(()=>cur().queue.slice(0,3).map(id=>ALL().find(x=>x.id===id).en)); console.log('today queue starts with:',JSON.stringify(first));
  await srs(page,null,'own'); 
  await ctx.close();
  // перенос данных прежней версии
  const old=JSON.parse(fs.readFileSync('/home/claude/trainer/progress.json')).state; old.my=[{id:'m1',en:'report',ru:'отчёт',type:'word',ctx:'Nobody had read the [report,] so we had to start.',src:'T',srcId:'t1'}]; old.cards['my/m1']={s:9,d:5,last:20000,due:20010,reps:3,lapses:0}; old.texts=[{id:'t1',title:'T',body:'Hello there.',page:0}];
  ({ctx,page}=await open(0,false,dir+'c',JSON.stringify(old)));
  console.log('migrated:',JSON.stringify(await page.evaluate(()=>({srs:Object.keys(P.srs),added:P.added.map(a=>a.en),texts:P.texts.length,goal:P.goal,ret:P.ret,lvl:P.lvl}))));
  await act(page,'texts'); await page.locator('[data-act=rdopen]').first().click(); await page.locator('.rd .s').first().click(); await page.waitForTimeout(200); console.log('no translator:',(await page.locator('.sheet .exr').first().innerText()).slice(0,50)); await shot(page,'read');
  console.log('back x3:',await page.evaluate(()=>[window.appBack(),window.appBack(),window.appBack(),window.appBack()].join()));
  await ctx.close();
  console.log('JS errors:',errors.length?errors.slice(0,5):'none');
})().catch(e=>{console.error('FAIL',e);console.log('errors so far',errors.slice(0,5));process.exit(1);});
