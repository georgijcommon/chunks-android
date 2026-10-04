/* ===== Объединяющий слой, часть 2: чтение текстов, упражнения на применение, файлы ===== */
const normA = s => String(s).toLowerCase().replace(/[’‘`]/g, "'").replace(/[.,!?;:—–-]+$/g, '').replace(/\s+/g, ' ').trim();
const coreW = s => s.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
const isRuS = s => { const l = s.match(/\p{L}/gu) || []; return l.length > 0 && l.filter(ch => /[а-яё]/i.test(ch)).length / l.length > 0.5; };
const artOf = (x, s) => x.icon && ICONS[x.icon] ? icon(x.icon, s) : `<span class="letter" style="font-size:${Math.round(s * .72)}px">${esc(x.en[0].toUpperCase())}</span>`;
const noteOf = x => x.err ? `<div class="note"><b>Типичная ошибка:</b> ${esc(x.err)}</div>` : '';
// Пропуски для упражнения «впиши»: у встроенных выражений заданы, у своих строятся из предложения.
function gapsOf(x) {
  if (x.gaps && x.gaps.length) return x.gaps;
  const b = x.ctx && x.ctx.match(/^(.*?)\[(.+?)\](.*)$/);
  if (!b || !(b[1].trim() || b[3].trim())) return [];
  const inner = coreW(b[2]);
  return [{ s: b[1] + b[2].replace(inner, '___') + b[3], ru: x.ru, a: [inner, x.en] }];
}
const fillGap = (s, a) => s.replace(/(^|[.!?—]\s+)?___/, (m, pre) => pre !== undefined ? pre + a[0].toUpperCase() + a.slice(1) : a);
const canApply = x => !!P.srs[x.id] && (gapsOf(x).length > 0 || (x.k === 'c' && !!x.tr));
// Какое упражнение дать на повторении: молодым карточкам пропуск или перевод, зрелым свободный ответ.
function pickApply(x) {
  const c = P.srs[x.id], g = gapsOf(x);
  let pool = (c.s || 0) >= 7 ? [...(x.free ? ['free'] : []), 'tr'] : g.map((_, i) => 'gap' + i).concat(x.tr || x.k === 'c' ? ['tr'] : []);
  if (!pool.length) pool = ['tr'];
  const alt = pool.filter(k => k !== c.ex);
  return pick(alt.length ? alt : pool);
}
function srsApplyBody(p, x) {
  const e = p.ex, cl = collOf(x.coll);
  let body = `<div style="text-align:center;margin-top:12px" class="eyebrow">Повторение · ${cl ? cl.name : ''}</div>`, foot = '', pad = 120;
  const grades = sug => `<div class="foot"><div style="text-align:center;font-size:12px;color:var(--muted);margin-bottom:8px">${sug != null ? 'Предложенная оценка выделена, её можно сменить' : 'Сравните с образцом и оцените сами'}</div><div class="grades">${[0, 1, 2, 3].map(g => `<button class="gr g${g}${sug === g ? ' sug' : ''}" data-act="srsgrade" data-g="${g}">${SRS_L[g]}<small>${fmtIv(srsCalc(P.srs[x.id], g).ms)}</small></button>`).join('')}</div></div>`;
  if (e.kind.startsWith('gap')) {
    const g = gapsOf(x)[+e.kind.slice(3)] || gapsOf(x)[0];
    body += `<div class="pad" style="margin-top:16px"><div class="eyebrow">Впишите пропущенное</div><h2 class="it" style="margin:8px 0 0;font-size:30px;line-height:1.2">${esc(g.s.replace('___', '_____'))}</h2>
      <div class="exr" style="text-align:left;margin:10px 0 0">«${esc(g.ru)}»</div>
      <input id="sx-in" class="lsin${e.done ? (e.ok ? ' okf' : ' nof') : ''}" autocomplete="off" autocapitalize="none" spellcheck="false" ${e.done ? 'disabled value="' + esc(e.val) + '"' : ''}>
      ${e.hint && !e.done ? `<div class="exr" style="text-align:left;margin:10px 0 0">Первые буквы: ${esc(g.a[0].split(' ').map(w => w[0] + '…').join(' '))}</div>` : ''}
      ${e.done ? `<div class="model"><span>${e.ok ? 'Верно' : 'Не совсем'}</span>${esc(fillGap(g.s, g.a[0]))}</div>${e.ok ? '' : noteOf(x)}` : ''}</div>`;
    if (e.done) { foot = grades(e.ok ? (e.hint ? 1 : 2) : 0); pad = 190; }
    else foot = `<div class="foot btns"><button class="btn" data-act="sxhint">Подсказка</button><button class="btn dark" data-act="sxcheck">Проверить</button></div>`;
  } else {
    const free = e.kind === 'free';
    body += `<div class="pad" style="margin-top:16px"><div class="eyebrow">${free ? 'Свободный ответ' : 'Скажите по-английски'}</div>
      <h2 style="margin:8px 0 0;font-size:30px;line-height:1.15">${esc(free ? x.free.q : (x.tr ? x.tr.ru : x.ru))}</h2>
      ${free ? `<div class="exr" style="text-align:left;margin:10px 0 0">Понадобится выражение со значением «${esc(x.ru)}»</div>` : ''}
      <textarea id="sx-tx" class="lsin" rows="3" placeholder="Напишите ответ или скажите вслух" ${e.done ? 'disabled' : ''}>${esc(e.val || '')}</textarea>
      ${e.done ? `<div class="model"><span>${free ? 'Возможный ответ' : 'Образец'}</span>${esc(free ? x.free.sample : (x.tr ? x.tr.en : x.en))}</div>
        <div class="exr" style="text-align:left;margin:10px 0 0">Нужное выражение: <b>${esc(x.en)}</b></div>${noteOf(x)}` : ''}</div>`;
    if (e.done) { foot = grades(null); pad = 190; }
    else foot = `<div class="foot"><button class="btn dark full" data-act="sxshow">Показать образец</button></div>`;
  }
  return { body, foot, pad };
}

/* ---------- урок: задания для выражений ---------- */
function lsExtraBody(t, a, w) {
  if (t.t === 'span') {
    return `<div class="pad" style="margin-top:14px"><div class="eyebrow">Найдите выражение в предложении</div><h2 style="margin:8px 0 0;font-size:28px;line-height:1.15">${esc(w.ru)}</h2></div>
      <div class="slots" style="margin-top:18px">${t.toks.map((k, i) => { let c = ''; if (a) { if (t.hit[i]) c = ' ok'; else if (t.sel.includes(i)) c = ' no'; } else if (t.sel.includes(i)) c = ' dk'; return `<button class="pill${c}" ${a ? 'disabled' : ''} data-act="lsspan" data-k="${i}">${esc(k)}</button>`; }).join('')}</div>`;
  }
  if (t.t === 'build') {
    const chosen = new Set(t.ch);
    const slots = t.ch.map(k => `<button class="pill ${a ? (a.ok ? 'ok' : 'no') : 'dk'}" ${a ? 'disabled' : ''} data-act="lsbu" data-k="${k}">${esc(t.toks.find(x => x.i === k).w)}</button>`).join('') + (a ? '' : '<span class="pill ph" aria-hidden="true"></span>');
    return `<div style="text-align:center;margin-top:14px" class="eyebrow">Соберите выражение</div>
      <h2 style="text-align:center;margin:12px 28px 0;font-size:32px;line-height:1.05">${esc(w.ru)}</h2>
      <div class="eyebrow" style="margin:18px 28px 8px">Ваш ответ</div><div class="slots" aria-live="polite">${slots}</div><div class="hr" style="margin:12px 28px"></div>
      <div class="eyebrow" style="margin:0 28px 8px">Слова</div><div class="slots">${t.toks.filter(x => !chosen.has(x.i)).map(x => `<button class="pill" ${a ? 'disabled' : ''} data-act="lsbp" data-k="${x.i}">${esc(x.w)}</button>`).join('')}</div>`;
  }
  if (t.t === 'gapt') {
    return `<div class="pad" style="margin-top:14px"><div class="eyebrow">Впишите пропущенное</div><h2 class="it" style="margin:8px 0 0;font-size:30px;line-height:1.2">${esc(t.g.s.replace('___', '_____'))}</h2>
      <div class="exr" style="text-align:left;margin:10px 0 0">«${esc(t.g.ru)}»</div>
      <input id="ls-in" class="lsin${a ? (a.ok ? ' okf' : ' nof') : ''}" autocomplete="off" autocapitalize="none" spellcheck="false" ${a ? 'disabled value="' + esc(a.val) + '"' : ''}></div>`;
  }
  return '';
}
// Дополнительные задания урока для выражений и слов из своих текстов.
function lsChunkTasks(ws, T) {
  const at = st => { let i = T.length; while (i > 0 && T[i - 1].st > st) i--; return i; };
  const add = t => T.splice(at(t.st), 0, t);
  ws.filter(w => w.ctx && gapsOf(w).length).slice(0, 3).forEach(w => {
    const m = w.ctx.match(/^(.*?)\[(.+?)\](.*)$/), toks = [], hit = [];
    [[m[1], false], [m[2], true], [m[3], false]].forEach(([s, h]) => s.split(/\s+/).filter(Boolean).forEach(k => {
      if (toks.length && !/[\p{L}\p{N}]/u.test(k)) { toks[toks.length - 1] += (/^[.,!?;:…]+$/.test(k) ? '' : ' ') + k; return; }
      toks.push(k); hit.push(h); }));
    add({ st: 1, t: 'span', w, toks, hit, sel: [] });
  });
  ws.filter(w => w.mean).forEach(w => add({ st: 1, t: 'tr', w, opts: shuffle([w, { id: '_a', ru: w.mean[0] }, { id: '_b', ru: w.mean[1] }]) }));
  ws.filter(w => w.k === 'c' && w.d && w.d.length).slice(0, 3).forEach(w => {
    const ans = w.en.split(' ');
    add({ st: 2, t: 'build', w, ans, toks: shuffle(ans.concat(w.d).map((x, i) => ({ w: x, i }))), ch: [], hint: false });
  });
  shuffle(ws.filter(w => gapsOf(w).length)).slice(0, 4).forEach(w => add({ st: 3, t: 'gapt', w, g: pick(gapsOf(w)) }));
}

/* ---------- тексты ---------- */
const trCache = new Map(), trWait = new Map();
let trSeq = 0;
window.onTranslated = (id, ok, text) => { const f = trWait.get(id); if (f) { trWait.delete(id); f(ok ? text : null); } };
const canTranslate = () => !!(window.Android && Android.translate) || ('Translator' in self);
function translate(text, from, to) {
  const key = from + '>' + to + '|' + text;
  if (trCache.has(key)) return Promise.resolve(trCache.get(key));
  let p;
  if (window.Android && Android.translate) {
    p = new Promise(res => { const id = ++trSeq; trWait.set(id, res); setTimeout(() => { if (trWait.has(id)) { trWait.delete(id); res(null); } }, 120000); Android.translate(id, text, from, to); });
  } else if ('Translator' in self) {
    p = self.Translator.create({ sourceLanguage: from, targetLanguage: to }).then(t => t.translate(text)).catch(() => null);
  } else p = Promise.resolve(null);
  return p.then(r => { if (r) trCache.set(key, r); return r; });
}
function autoTitle(body) { const f = body.split('\n')[0].trim(); return f.length <= 44 ? f : f.slice(0, 44).replace(/\s+\S*$/, '') + '…'; }
function addText(title, body) {
  body = String(body).replace(/\r\n?/g, '\n').replace(/[\[\]]/g, m => m === '[' ? '(' : ')').trim();
  if (!body) { toast('Текст пустой'); return; }
  let cut = false; if (body.length > 300000) { body = body.slice(0, 300000); cut = true; }
  const t = { id: 't' + Date.now().toString(36), title: (title || autoTitle(body)).trim().slice(0, 80), body, page: 0 };
  P.texts.unshift(t);
  try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { P.texts.shift(); toast('Не хватило места: текст слишком большой'); return; }
  go('read', { id: t.id }); toast(cut ? 'Добавлено. Сохранено начало текста' : 'Текст добавлен');
}
const RD_PAGE = 25;
const rdSent = par => par.match(/[^.!?…]+[.!?…]+["'”’»)]*\s*|[^.!?…]+$/g) || [par];
function vTexts() {
  const rows = P.texts.map(t => { const n = P.added.filter(x => x.srcId === t.id).length;
    return `<div class="coll"><button class="t" style="border:none;background:none;text-align:left;padding:0" data-act="rdopen" data-id="${t.id}"><b>${esc(t.title)}</b><span>${t.body.split(/\s+/).length} слов${n ? ' · в изучении ' + n : ''}</span></button><button class="link" data-act="rddel" data-id="${t.id}">Удалить</button></div>`; }).join('');
  return `<div class="scr nopad" style="padding-bottom:40px"><div class="topbar"><button class="ibtn bare" data-act="back" aria-label="Назад">${I.back}</button><div class="eyebrow m">Чтение</div><span style="width:44px"></span></div>
  <div class="pad"><h1 style="margin-top:6px">Тексты</h1><p style="color:var(--muted);margin:10px 0 0;line-height:1.45">Добавьте свой текст на английском или русском. Нажмите на предложение, чтобы увидеть перевод, и выберите слова для изучения.</p></div>
  ${rows}
  <div class="pad"><div class="eyebrow" style="margin-top:26px">Новый текст</div><textarea id="tx-new" class="lsin" rows="5" placeholder="Вставьте текст"></textarea>
  <div class="btns" style="margin-top:14px"><button class="btn" style="flex:1" data-act="txfile">Из файла</button><button class="btn dark" style="flex:1" data-act="txadd">Добавить</button></div></div></div>`;
}
function vRead(p) {
  const t = P.texts.find(x => x.id === p.id);
  if (!t) return vTexts();
  const pars = t.body.split(/\n\s*\n|\n/).map(x => x.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const pages = Math.max(1, Math.ceil(pars.length / RD_PAGE)); t.page = Math.min(t.page || 0, pages - 1);
  p.sents = [];
  const html = pars.slice(t.page * RD_PAGE, (t.page + 1) * RD_PAGE).map(par => '<p>' + rdSent(par).map(s => { p.sents.push(s.trim()); const i = p.sents.length - 1; return `<span class="s${p.on === i ? ' on' : ''}" role="button" tabindex="0" data-act="rdsent" data-i="${i}">${esc(s)}</span>`; }).join('') + '</p>').join('');
  return `<div class="scr nopad" style="padding-bottom:60vh"><div class="topbar"><button class="ibtn bare" data-act="back" aria-label="Назад">${I.back}</button><div class="eyebrow m">Чтение${pages > 1 ? ' · ' + (t.page + 1) + ' / ' + pages : ''}</div><span style="width:44px"></span></div>
  <div class="track" style="margin-top:6px"><i style="width:${(t.page + 1) / pages * 100}%"></i></div>
  <div class="pad"><h2 style="margin:18px 0 6px;font-size:26px;line-height:1.15">${esc(t.title)}</h2></div><div class="rd">${html}</div>
  ${pages > 1 ? `<div class="pad btns" style="margin-top:10px"><button class="btn" style="flex:1" data-act="rdpage" data-d="-1" ${t.page ? '' : 'disabled'}>Назад</button><button class="btn dark" style="flex:1" data-act="rdpage" data-d="1" ${t.page < pages - 1 ? '' : 'disabled'}>Дальше</button></div>` : ''}</div>`;
}
// Панель предложения: перевод, выбор слов, добавление в изучение.
function sentSheet() {
  const o = ov, whole = o.a < 0;
  const toks = o.words.map((w, i) => `<button class="pill sm${i >= o.a && i <= o.b ? ' dk' : ''}" data-act="sntok" data-i="${i}">${esc(w)}</button>`).join('');
  const trLine = o.tr ? `<div class="sntr">${esc(o.tr)}</div>` : o.trFail ? `<div class="exr" style="text-align:left;margin:10px 0 0">Перевести не удалось. При первом переводе нужен интернет: скачивается языковая модель.</div>`
    : canTranslate() ? `<div class="exr" style="text-align:left;margin:10px 0 0">Перевожу</div>`
    : `<div class="exr" style="text-align:left;margin:10px 0 0">Автоперевод работает в приложении для Android. Здесь впишите перевод сами или <a href="https://translate.google.com/?sl=${o.from}&tl=${o.to}&text=${encodeURIComponent(o.s)}" target="_blank" rel="noopener">откройте переводчик</a>.</div>`;
  return `<div class="ov" id="ov"><div class="scrim" style="background:rgba(10,21,33,.06)" data-act="closeov"></div><div class="sheet" role="dialog" aria-label="Перевод предложения" style="max-height:76%;overflow-y:auto">
    <div class="row sp"><div class="eyebrow">${o.ru ? 'Русский → английский' : 'Английский → русский'}</div><button class="ibtn bare" data-act="closeov" aria-label="Закрыть">${I.close}</button></div>
    <div class="slots" style="padding:0;margin-top:10px;gap:8px">${toks}</div>${trLine}
    <p style="color:var(--muted);font-size:13px;margin:12px 0 0;line-height:1.4">${whole ? 'Нажмите на слова, чтобы выбрать слово или выражение. Первое и последнее нажатие задают границы.' : 'Проверьте перевод и поправьте, если нужно.'}</p>
    <div class="fld"><label for="sn-en">Учить</label><input id="sn-en" value="${esc(o.en)}" placeholder="${o.ru ? 'По-английски' : ''}" autocomplete="off" autocapitalize="none"></div>
    <div class="fld"><label for="sn-ru">Значение</label><input id="sn-ru" value="${esc(o.rus)}" placeholder="Перевод" autocomplete="off"></div>
    <button class="btn dark full" style="margin-top:18px" data-act="snadd">${whole ? 'Учить всё предложение' : 'Добавить в изучение'}</button></div></div>`;
}
function sentFill() {
  const o = ov, whole = o.a < 0, sel = whole ? o.s : coreW(o.words.slice(o.a, o.b + 1).join(' '));
  o.sel = sel;
  if (o.ru) { o.rus = sel; o.en = whole ? (o.tr || '') : ''; } else { o.en = sel; o.rus = whole ? (o.tr || '') : ''; }
  if (!(o.ru ? o.en : o.rus) && canTranslate() && sel) {
    translate(sel, o.from, o.to).then(r => { if (ov !== o || o.sel !== sel || !r) return; if (o.ru) { if (!o.en) o.en = r; } else if (!o.rus) o.rus = r; renderOv(); });
  }
}
function openSent(s) {
  const ru = isRuS(s);
  ov = { n: 'sent', s, ru, from: ru ? 'ru' : 'en', to: ru ? 'en' : 'ru', words: s.split(/\s+/).filter(Boolean), a: -1, b: -1, tr: '', en: '', rus: '' };
  const o = ov; sentFill(); renderOv();
  if (canTranslate()) translate(s, o.from, o.to).then(r => { if (ov !== o) return; if (r) { o.tr = r; if (o.a < 0) sentFill(); } else o.trFail = true; renderOv(); });
}

/* ---------- файлы ---------- */
function download(name, obj) {
  if (window.Android && Android.saveFile) { Android.saveFile(name, JSON.stringify(obj, null, 1)); return; }
  const url = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 1)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function pickFile(accept, cb, asText) {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = accept; inp.style.display = 'none';
  inp.addEventListener('change', () => { const f = inp.files && inp.files[0]; if (!f) return; const r = new FileReader();
    r.onload = () => { if (asText) { cb(String(r.result), f.name); return; } try { cb(JSON.parse(String(r.result))); } catch (e) { toast('Файл не читается: это не JSON'); } };
    r.onerror = () => toast('Файл не читается'); r.readAsText(f); });
  document.body.append(inp); inp.click(); setTimeout(() => inp.remove(), 60000);
}
// Проверка данных из файла: оставляем только поля ожидаемого вида.
function cleanP(x) {
  const d = defP(), o = Object.assign(d, x || {});
  for (const k of ['lvl', 'bm', 'srs', 'xdecks']) if (!o[k] || typeof o[k] !== 'object' || Array.isArray(o[k])) o[k] = {};
  o.added = (Array.isArray(o.added) ? o.added : []).filter(a => a && typeof a.id === 'string' && typeof a.en === 'string' && a.en && typeof a.ru === 'string')
    .map(a => ({ id: a.id, coll: typeof a.coll === 'string' ? a.coll : 'mine', k: a.k === 'c' ? 'c' : 'w', en: a.en, ipa: '', ru: a.ru, ex: String(a.ex || ''), exr: String(a.exr || ''),
      d: Array.isArray(a.d) ? a.d.filter(w => typeof w === 'string').slice(0, 4) : [], lv: LVLS.includes(a.lv) ? a.lv : 'B1', ctx: typeof a.ctx === 'string' ? a.ctx : '', src: String(a.src || ''), srcId: String(a.srcId || ''), icon: a.k === 'c' && a.icon === 'chat' ? 'chat' : undefined }));
  o.texts = (Array.isArray(o.texts) ? o.texts : []).filter(t => t && typeof t.id === 'string' && typeof t.title === 'string' && typeof t.body === 'string').map(t => ({ id: t.id, title: t.title, body: t.body, page: +t.page || 0 }));
  o.log = (Array.isArray(o.log) ? o.log : []).slice(-5000);
  for (const [id, dk] of Object.entries(o.xdecks)) if (validDeck(dk)) delete o.xdecks[id];
  for (const [id, c] of Object.entries(o.srs)) if (!c || typeof c !== 'object' || typeof c.due !== 'number') delete o.srs[id];
  o.name = String(o.name || '').slice(0, 24); o.goal = GOALS.includes(+o.goal) ? +o.goal : 10; o.ret = [.85, .9, .95].includes(+o.ret) ? +o.ret : .9;
  o.cf = LVLS.includes(o.cf) ? o.cf : ''; o.bonus = 0; o.seen = +o.seen || 0; o.voice = String(o.voice || 'app:us_f'); o.anim = ['calm', 'lively', 'once', 'off'].includes(o.anim) ? o.anim : 'calm';
  return o;
}
// Перенос данных из прежней версии приложения (до объединения с «Инеем»).
function fromOld(st) {
  const o = defP();
  if (!st || typeof st !== 'object') return o;
  const sod = new Date(); sod.setHours(0, 0, 0, 0); const today = dayN(Date.now());
  const idMap = {};
  (Array.isArray(st.my) ? st.my : []).forEach((m, i) => { if (!m || typeof m.en !== 'string' || typeof m.ru !== 'string') return;
    const id = 'u' + (m.id || i), b = (m.ctx || '').match(/^(.*?)\[(.+?)\](.*)$/), sent = b ? b[1] + b[2] + b[3] : '';
    idMap['my/' + m.id] = id;
    o.added.push({ id, coll: 'mine', k: /\s/.test(m.en.trim()) ? 'c' : 'w', en: m.en, ipa: '', ru: m.ru, ex: sent === m.en ? '' : sent, exr: '', d: [], lv: 'B1', ctx: m.ctx || '', src: m.src || '', srcId: m.srcId || '' }); });
  for (const [k, c] of Object.entries(st.cards || {})) {
    const id = k.startsWith(KDECK.id + '/') ? 'k:' + k.slice(KDECK.id.length + 1) : idMap[k];
    if (!id || !c || typeof c.s !== 'number') continue;
    o.srs[id] = { s: c.s, d: c.d, last: c.last, n: c.reps || 1, lapses: c.lapses || 0, due: sod.getTime() + ((c.due || today) - today) * DAY };
    o.lvl[id] = c.s >= 21 ? 3 : c.s >= 7 ? 2 : 1;
  }
  o.texts = (Array.isArray(st.texts) ? st.texts : []).filter(t => t && typeof t.body === 'string').map(t => ({ id: String(t.id), title: String(t.title || ''), body: t.body, page: +t.page || 0 }));
  if (st.settings) { if ([.85, .9, .95].includes(st.settings.retention)) o.ret = st.settings.retention; const g = GOALS.reduce((a, b) => Math.abs(b - st.settings.newPerDay) < Math.abs(a - st.settings.newPerDay) ? b : a, 10); o.goal = g; }
  return o;
}
function importData(d) {
  let np;
  if (d && d.format === 'chunks-progress/2' && d.P) np = cleanP(d.P);
  else if (d && d.format === 'chunk-progress/1' && d.state) np = cleanP(fromOld(d.state));
  else { toast('Это не файл прогресса'); return; }
  if (!confirm('Заменить текущий прогресс данными из файла?')) return;
  np.migrated = true; P = np; save(); location.reload();
}

/* ---------- действия ---------- */
Object.assign(A, {
  texts: () => go('texts'),
  rdopen: d => go('read', { id: d.id }),
  rddel: d => { const t = P.texts.find(x => x.id === d.id); if (t && confirm('Удалить текст «' + t.title + '»? Добавленные из него слова останутся.')) { P.texts = P.texts.filter(x => x.id !== d.id); save(); render(); } },
  txadd: () => addText('', document.getElementById('tx-new').value),
  txfile: () => pickFile('.txt,.md,.srt,text/plain', (txt, name) => addText(name.replace(/\.[^.]+$/, ''), txt), true),
  rdpage: d => { const c = cur(), t = P.texts.find(x => x.id === c.id); if (!t) return; t.page += +d.d; c.on = null; save(); app.__lastKey = ''; render(); },
  rdsent: d => { const c = cur(); c.on = +d.i; render(); openSent(c.sents[+d.i]); },
  sntok: d => { const o = ov, i = +d.i;
    if (o.a < 0 || (i >= o.a && i <= o.b && o.a !== o.b)) o.a = o.b = i; else if (i === o.a && o.a === o.b) o.a = o.b = -1; else { o.a = Math.min(o.a, i); o.b = Math.max(o.b, i); }
    sentFill(); renderOv(); },
  snadd: () => { const o = ov, en = o.en.trim(), ru = o.rus.trim();
    if (!en || !ru) { toast('Заполните оба поля'); return; }
    if (ALL().some(x => normA(x.en) === normA(en))) { toast('Это уже есть в словаре'); return; }
    const whole = o.a < 0, c = cur(), t = P.texts.find(x => x.id === c.id) || {}, kind = /\s/.test(en) ? 'c' : 'w';
    const ctx = o.ru || whole ? '' : o.words.slice(0, o.a).concat(['[' + o.words.slice(o.a, o.b + 1).join(' ') + ']'], o.words.slice(o.b + 1)).join(' ');
    const ws = en.split(/\s+/), others = [...new Set(ALL().filter(x => x.k === 'c').flatMap(x => x.en.split(' ')).filter(w => !ws.includes(w)))];
    P.added.push({ id: 'u' + Date.now().toString(36), coll: 'mine', k: kind, en, ipa: '', ru, ex: o.ru ? '' : (whole ? '' : o.s), exr: o.ru ? '' : (whole ? '' : o.tr || ''), d: kind === 'c' ? sample(others, 3) : [], lv: 'B1', ctx, src: t.title || '', srcId: t.id || '' });
    save(); toast(kind === 'c' ? 'Выражение добавлено' : 'Слово добавлено'); o.a = o.b = -1; sentFill(); renderOv(); },
  lsspan: d => { const t = cur().tasks[cur().i]; if (t.done) return; const i = +d.k; t.sel = t.sel.includes(i) ? t.sel.filter(x => x !== i) : t.sel.concat(i); render(); },
  lsspanok: () => { const c = cur(), t = c.tasks[c.i]; if (t.done || !t.sel.length) return; const ok = t.hit.every((h, i) => h === t.sel.includes(i)); t.done = { ok }; lsRec(c, t.w, ok); render(); autoNext('lsnext'); },
  lsbp: d => { const t = cur().tasks[cur().i]; if (t.done) return; t.ch.push(+d.k); render(); },
  lsbu: d => { const t = cur().tasks[cur().i]; if (t.done) return; t.ch = t.ch.filter(k => k !== +d.k); render(); },
  lsbh: () => { const t = cur().tasks[cur().i]; if (t.done) return; let pre = 0; while (pre < t.ch.length && t.toks.find(x => x.i === t.ch[pre]).w === t.ans[pre]) pre++;
    t.ch = t.ch.slice(0, pre); const used = new Set(t.ch), n = t.toks.find(x => !used.has(x.i) && x.w === t.ans[pre]); if (n) { t.ch.push(n.i); t.hint = true; } render(); },
  lsbc: () => { const c = cur(), t = c.tasks[c.i]; if (t.done || !t.ch.length) return; const ok = t.ch.map(k => t.toks.find(x => x.i === k).w).join(' ') === t.ans.join(' ');
    t.done = { ok }; lsRec(c, t.w, ok && !t.hint); render(); autoNext('lsnext'); },
  sxhint: () => { const c = cur(); c.ex.hint = true; const el = document.getElementById('sx-in'); c.ex.val = el ? el.value : ''; render(); const e2 = document.getElementById('sx-in'); if (e2) { e2.value = c.ex.val; e2.focus(); } },
  sxcheck: () => { const c = cur(), el = document.getElementById('sx-in'), v = (el.value || '').trim(); if (!v) { toast('Впишите ответ'); return; }
    const x = ALL().find(z => z.id === c.queue[0]), g = gapsOf(x)[+c.ex.kind.slice(3)] || gapsOf(x)[0];
    c.ex.val = v; c.ex.ok = g.a.some(a => normA(a) === normA(v)); c.ex.done = true; render(); speak(x.en, x.id); },
  sxshow: () => { const c = cur(), el = document.getElementById('sx-tx'); c.ex.val = el ? el.value : ''; c.ex.done = true; render(); const x = ALL().find(z => z.id === c.queue[0]); speak(x.en, x.id); },
  exp: () => download('chunks-progress-' + new Date().toISOString().slice(0, 10) + '.json', { format: 'chunks-progress/2', exported: new Date().toISOString(), P }),
  imp: () => pickFile('.json,application/json', importData),
  deckimp: () => pickFile('.json,application/json', d => { const err = validDeck(d); if (err) { toast(err); return; } if (d.id === KDECK.id) { toast('Такая колода уже встроена'); return; } P.xdecks[d.id] = d; save(); location.reload(); }),
  deckdel: d => { const k = P.xdecks[d.id]; if (!k || !confirm('Удалить колоду «' + (k.title || d.id) + '» и её прогресс?')) return; delete P.xdecks[d.id];
    for (const o of [P.srs, P.lvl]) for (const id of Object.keys(o)) if (id.startsWith('x:' + d.id + ':')) delete o[id]; save(); location.reload(); },
  decksample: () => download('deck-' + KDECK.id + '.json', KDECK)
});
document.addEventListener('input', e => { const t = e.target; if (ov && ov.n === 'sent') { if (t.id === 'sn-en') ov.en = t.value; if (t.id === 'sn-ru') ov.rus = t.value; } });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'sx-in') A.sxcheck(); if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('s')) e.target.click(); });
// Кнопка «Назад» в приложении для Android.
window.appBack = () => { if (ov) { A.closeov(); return true; } if (nav.length > 1) { back(); return true; } if (cur().v !== 'home') { tab('home'); return true; } return false; };
