(() => {
'use strict';
const KEY = 'chunk-trainer/v1';
const DAY = 864e5;
const LEECH = 8;          // столько оценок «Снова» делают карточку трудной
const MATURE = 7;         // стабильность в днях, после которой идут свободные задания
const FULL = 21;          // стабильность, при которой кольцо карточки замыкается
const PER_LEVEL = 5;      // столько закреплённых карточек даёт один уровень
const GRADES = ['', 'Снова', 'Трудно', 'Хорошо', 'Легко'];
const MY = 'my';

// ---------- хранилище ----------
let storageOk = true;
function load() {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; }
  catch (e) { storageOk = false; return null; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); storageOk = true; }
  catch (e) { storageOk = false; }
  return storageOk;
}
function fresh() {
  return { v: 1, settings: { newPerDay: 5, maxReviews: 50, retention: 0.9 }, decks: {}, cards: {}, log: [],
    day: { date: '', introduced: 0, reviewed: 0 }, texts: [], my: [] };
}
function adopt(raw) {
  const s = Object.assign(fresh(), raw || {});
  s.settings = Object.assign(fresh().settings, s.settings || {});
  if (!Array.isArray(s.texts)) s.texts = [];
  if (!Array.isArray(s.my)) s.my = [];
  if (!s.cards || typeof s.cards !== 'object') s.cards = {};
  if (!s.decks || typeof s.decks !== 'object') s.decks = {};
  if (!Array.isArray(s.log)) s.log = [];
  return s;
}
let state = adopt(load());

// ---------- даты и слова ----------
const dayNum = (ms = Date.now()) => { const d = new Date(ms); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY); };
const dayKey = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
function rollDay() {
  if (state.day.date !== dayKey()) { state.day = { date: dayKey(), introduced: 0, reviewed: 0 }; }
}
function fmtIvl(n) {
  if (n < 30) return n + ' дн';
  if (n < 365) return Math.round(n / 30) + ' мес';
  return (n / 365).toFixed(1).replace('.0', '') + ' г';
}
function plural(n, one, few, many) {
  const a = n % 10, b = n % 100;
  return (a === 1 && b !== 11) ? one : (a >= 2 && a <= 4 && (b < 12 || b > 14)) ? few : many;
}
const core = s => s.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
const isRu = s => { const l = s.match(/\p{L}/gu) || []; return l.length > 0 && l.filter(ch => /[а-яё]/i.test(ch)).length / l.length > 0.5; };

// ---------- колоды ----------
// Свои слова и выражения хранятся коротко; недостающие поля упражнений достраиваются здесь.
function expand(m) {
  const c = { id: m.id, en: m.en, ru: m.ru, type: m.type, topic: 'Из моих текстов', auto: true, src: m.src || '' };
  const b = m.ctx && m.ctx.match(/^(.*?)\[(.+?)\](.*)$/);
  if (b && (b[1].trim() || b[3].trim())) {
    const inner = core(b[2]), plain = b[1] + b[2] + b[3];
    c.ctx = m.ctx; c.ex = [plain];
    c.gaps = [{ s: b[1] + b[2].replace(inner, '___') + b[3], ru: m.ru, a: [inner, m.en] }];
    c.free = { q: 'Составьте своё предложение с этим выражением.', sample: plain };
  } else {
    c.ex = b && b[2] !== m.en ? [b[2]] : []; c.gaps = [];
    c.free = { q: 'Составьте своё предложение с этим выражением.', sample: m.en };
  }
  c.tr = { ru: m.ru, en: m.en };
  return c;
}
function myDeck() { return { id: MY, title: 'Мои слова и выражения', mine: true, chunks: state.my.map(expand) }; }
function allDecks() {
  const d = [BUILTIN].concat(Object.values(state.decks));
  if (state.my.length) d.push(myDeck());
  return d;
}
function allChunks() {
  const out = [];
  for (const d of allDecks()) for (const c of d.chunks) out.push(Object.assign({ key: d.id + '/' + c.id, deck: d }, c));
  return out;
}
const kindOf = c => c.type || (/\s/.test(c.en.trim()) ? 'chunk' : 'word');
function validDeck(d) {
  if (!d || d.format !== 'chunk-deck/1' || typeof d.id !== 'string' || !Array.isArray(d.chunks) || !d.chunks.length) return 'Это не файл колоды';
  if (d.id === MY) return 'Колода с таким идентификатором занята';
  for (const c of d.chunks) {
    const ok = c && typeof c.id === 'string' && typeof c.en === 'string' && typeof c.ru === 'string' &&
      Array.isArray(c.ex) && typeof c.ctx === 'string' && /\[.+\]/.test(c.ctx) &&
      Array.isArray(c.mean) && c.mean.length >= 2 &&
      c.form && typeof c.form.s === 'string' && typeof c.form.a === 'string' && Array.isArray(c.form.d) &&
      Array.isArray(c.gaps) && c.gaps.length && c.gaps.every(g => g && typeof g.s === 'string' && Array.isArray(g.a) && g.a.length) &&
      c.tr && typeof c.tr.ru === 'string' && typeof c.tr.en === 'string' &&
      c.free && typeof c.free.q === 'string' && typeof c.free.sample === 'string';
    if (!ok) return 'В колоде есть чанк с неполными данными: ' + (c && c.id || '?');
  }
  return '';
}

// ---------- прогресс ----------
const mastery = k => k ? Math.min(1, k.s / FULL) : 0;
function counts() {
  rollDay();
  const today = dayNum(), chunks = allChunks();
  const n = { total: chunks.length, due: 0, fresh: 0, leech: 0, points: 0, started: 0, solid: 0,
    word: { n: 0, m: 0 }, chunk: { n: 0, m: 0 } };
  for (const c of chunks) {
    const k = state.cards[c.key], t = n[kindOf(c) === 'word' ? 'word' : 'chunk'];
    t.n++; t.m += mastery(k); n.points += mastery(k);
    if (!k) { n.fresh++; continue; }
    n.started++;
    if (k.s >= FULL) n.solid++;
    if (k.due <= today) n.due++;
    if (k.lapses >= LEECH) n.leech++;
  }
  n.due = Math.min(n.due, state.settings.maxReviews);
  n.newLeft = Math.max(0, Math.min(n.fresh, state.settings.newPerDay - state.day.introduced));
  n.done = state.day.introduced + state.day.reviewed;
  n.todo = n.due + n.newLeft;
  n.level = Math.floor(n.points / PER_LEVEL) + 1;
  n.levelPct = (n.points % PER_LEVEL) / PER_LEVEL;
  return n;
}

// ---------- очередь занятия ----------
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
// Сначала свои слова и выражения, затем встроенные по кругу из разных тем, чтобы темы перемешивались.
function pickNew(n) {
  const byTopic = new Map(), out = [];
  for (const c of allChunks()) {
    if (state.cards[c.key]) continue;
    if (c.auto) { if (out.length < n) out.push(c); continue; }
    const t = c.topic || '';
    if (!byTopic.has(t)) byTopic.set(t, []);
    byTopic.get(t).push(c);
  }
  const lists = [...byTopic.values()];
  for (let i = 0; out.length < n && lists.some(l => l.length); i++) {
    const l = lists[i % lists.length];
    if (l.length) out.push(l.shift());
  }
  return out;
}
const gapKinds = c => c.gaps.map((_, i) => 'gap' + i);
function reviewExercise(c, card) {
  const pool = card.s >= MATURE ? ['free', 'tr'] : gapKinds(c).concat(['tr']);
  const choices = pool.filter(x => x !== card.lastEx);
  const from = choices.length ? choices : pool;
  return from[Math.floor(Math.random() * from.length)];
}
function buildSession(extraNew) {
  const today = dayNum(), n = counts();
  const due = allChunks().filter(c => state.cards[c.key] && state.cards[c.key].due <= today)
    .sort((a, b) => state.cards[a.key].due - state.cards[b.key].due).slice(0, state.settings.maxReviews);
  const queue = shuffle(due).map(c => ({ c, kind: reviewExercise(c, state.cards[c.key]) }));
  const news = pickNew(extraNew ? Math.min(n.fresh, extraNew) : n.newLeft);
  for (const c of news) {
    const steps = ['intro'];
    if (hasPic(c)) steps.push('pair');
    if (c.ctx) steps.push('notice');
    steps.push('meaning');
    if (c.form) steps.push('form');
    for (const kind of steps) queue.push({ c, kind });
  }
  for (const c of shuffle(news.slice())) queue.push({ c, kind: c.gaps.length ? 'gap0' : 'tr' });
  return { queue, pos: 0, total: queue.length, done: 0, introduced: news.length, ratings: [0, 0, 0, 0, 0] };
}

// ---------- оценка ----------
function ratingOptions(c) {
  const card = state.cards[c.key];
  const t = card ? Math.max(0, dayNum() - card.last) : 0;
  return FSRS.options(card ? { s: card.s, d: card.d } : null, t, state.settings.retention);
}
function applyRating(item, g, info) {
  const c = item.c, today = dayNum();
  const prev = state.cards[c.key];
  const o = ratingOptions(c)[g - 1];
  state.cards[c.key] = { s: o.s, d: o.d, last: today, due: today + o.ivl,
    reps: (prev ? prev.reps : 0) + 1, lapses: prev ? prev.lapses + (g === 1 ? 1 : 0) : 0, lastEx: item.kind };
  if (!prev) state.day.introduced++; else state.day.reviewed++;
  state.log.push({ t: Date.now(), k: c.key, ex: item.kind, g, sug: info.suggest || 0, ans: (info.answer || '').slice(0, 300),
    gap: prev ? today - prev.last : 0 });
  if (state.log.length > 5000) state.log.splice(0, state.log.length - 5000);
  save();
}

// ---------- перевод ----------
// В приложении для Android переводит модель на самом телефоне. В браузере используется
// встроенный переводчик, если он есть; иначе перевод вписывается вручную.
const trCache = new Map(), trWait = new Map();
let trSeq = 0;
window.onTranslated = (id, ok, text) => { const f = trWait.get(id); if (f) { trWait.delete(id); f(ok ? text : null); } };
const canTranslate = () => !!(window.Android && Android.translate) || ('Translator' in self);
function translate(text, from, to) {
  const key = from + '>' + to + '|' + text;
  if (trCache.has(key)) return Promise.resolve(trCache.get(key));
  let p;
  if (window.Android && Android.translate) {
    p = new Promise(res => {
      const id = ++trSeq; trWait.set(id, res);
      setTimeout(() => { if (trWait.has(id)) { trWait.delete(id); res(null); } }, 120000);
      Android.translate(id, text, from, to);
    });
  } else if ('Translator' in self) {
    p = self.Translator.create({ sourceLanguage: from, targetLanguage: to }).then(t => t.translate(text)).catch(() => null);
  } else p = Promise.resolve(null);
  return p.then(r => { if (r) trCache.set(key, r); return r; });
}

// ---------- DOM ----------
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'value') el.value = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  return put(el, ...kids);
}
function put(el, ...kids) {
  for (const k of kids.flat(3)) if (k != null && k !== false && k !== '') el.append(k.nodeType ? k : document.createTextNode(String(k)));
  return el;
}
function svg(tag, attrs, ...kids) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v);
  for (const k of kids) el.append(k);
  return el;
}
const ICONS = {
  home: 'M4 11.5 12 4l8 7.5M6.5 9.8V19h11V9.8',
  words: 'M12 6.6C10.6 5.6 8.6 5.2 5 5.2v12.6c3.6 0 5.6.4 7 1.4 1.4-1 3.4-1.4 7-1.4V5.2c-3.6 0-5.6.4-7 1.4zM12 6.6v12.6',
  train: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6z',
  progress: 'M6 19v-6M12 19V5M18 19v-9',
  texts: 'M7 4.5h8l3 3v12H7zM10 10.5h5M10 14h5M10 17.5h3',
  settings: 'M5 8h7M16 8h3M5 16h3M12 16h7M14 5.5v5M10 13.5v5',
  close: 'M6 6l12 12M18 6 6 18',
  back: 'M14.5 5 8 12l6.5 7',
  check: 'M6 12.5l4 4 8-9'
};
const ico = name => svg('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }, svg('path', { d: ICONS[name] }));
const iconBtn = (name, label, onclick) => h('button', { class: 'icon', type: 'button', 'aria-label': label, onclick }, ico(name));
function top(left, over, right, pct) {
  return [h('div', { class: 'top' }, left || h('span', {}), h('div', { class: 'over stage' }, over), right || h('span', {})),
    h('div', { class: 'bar' }, h('i', { style: 'width:' + Math.round(100 * Math.max(0, Math.min(1, pct || 0))) + '%' }))];
}
// Кольцо прогресса: доля от 0 до 1. dark: на тёмно-синем фоне.
function ring(pct, size, stroke, dark, ...inner) {
  const r = (size - stroke) / 2, len = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, pct || 0));
  const arc = svg('circle', { class: 'arc', cx: size / 2, cy: size / 2, r, 'stroke-width': stroke,
    stroke: dark ? '#C9A464' : '#B88E4A', 'stroke-dasharray': len, 'stroke-dashoffset': len });
  const s = svg('svg', { width: size, height: size, viewBox: '0 0 ' + size + ' ' + size, 'aria-hidden': 'true' },
    svg('circle', { cx: size / 2, cy: size / 2, r, 'stroke-width': dark ? 1.5 : stroke, stroke: dark ? 'rgba(201,164,100,.35)' : '#E3DCCD' }), arc);
  requestAnimationFrame(() => requestAnimationFrame(() => arc.setAttribute('stroke-dashoffset', len * (1 - p))));
  return h('div', { class: 'ring', style: 'width:' + size + 'px;height:' + size + 'px', role: 'img', 'aria-label': Math.round(p * 100) + '%' },
    s, h('div', { class: 'in' }, ...inner));
}
// Тонкие концентрические золотые кольца за содержимым тёмной области.
function deco() {
  const s = svg('svg', { class: 'deco', viewBox: '0 0 520 520', 'aria-hidden': 'true' });
  [[112, .22], [146, .18], [184, .16], [226, .14]].forEach(([r, o]) =>
    s.append(svg('circle', { cx: 260, cy: 260, r, fill: 'none', stroke: '#C9A464', 'stroke-width': 1, opacity: o })));
  return s;
}
const pctText = p => Math.round(p * 100) + '%';
// Иллюстрации есть только у встроенной колоды; разметка доверенная, из сборки.
const PIC_LIGHT = { B: '#0E1A2B', S: '#E9DDC5', D: '#0E1A2B', H: '#E9DDC5', T: '#FFFFFF' };
const PIC_DARK = { B: '#F3EBDD', S: '#F3EBDD', D: '#C9A464', H: '#3A4A63', T: '#0E1A2B' };
const hasPic = c => c.deck === BUILTIN && !!PICS[c.id];
function pic(c, dark, size) {
  if (!hasPic(c)) return null;
  const pal = dark ? PIC_DARK : PIC_LIGHT, box = document.createElement('div');
  box.innerHTML = '<svg viewBox="0 0 200 200" width="' + size + '" height="' + size + '" aria-hidden="true">' +
    PICS[c.id].replace(/\{([BSDHT])\}/g, (m, k) => pal[k]) + '</svg>';
  return box.firstChild;
}
function hero(pct, big, cap, ...rest) {
  return h('div', { class: 'hero' }, deco(),
    ring(pct, 172, 5, true, h('div', { class: 'num' }, big), h('div', { class: 'cap' }, cap)), ...rest);
}

const root = document.getElementById('app');
let view = 'home', session = null, toastTimer = 0, reading = null, dictFilter = 'all', footEl = null;
function toast(msg) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = h('div', { class: 'toast', role: 'status' }, msg);
  document.body.append(t); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.remove(), 3200);
}
function go(v) { view = v; render(); window.scrollTo(0, 0); }
// Нижняя область с кнопками; отступ страницы подстраивается под её высоту.
function setFoot(...kids) {
  if (!footEl) { footEl = h('div', { class: 'foot' }, h('div', { class: 'inner' })); document.body.append(footEl); }
  footEl.firstChild.replaceChildren(); put(footEl.firstChild, ...kids);
  root.style.paddingBottom = (footEl.offsetHeight + 28) + 'px';
}
function tabs() {
  const tab = (id, icon, label) => h('button', { 'data-tab': id, 'aria-current': view === id ? 'page' : null,
    onclick: () => { session = null; reading = null; go(id); } }, ico(icon), label);
  return h('nav', { class: 'tabs' }, h('div', { class: 'inner' },
    tab('home', 'home', 'Главная'), tab('dict', 'words', 'Слова'), tab('train', 'train', 'Тренировка'), tab('progress', 'progress', 'Прогресс')));
}
const TABBED = { home: 1, dict: 1, train: 1, progress: 1 };
function render() {
  document.querySelectorAll('.tabs,.sheet,.foot').forEach(x => x.remove());
  footEl = null; root.replaceChildren(); root.style.paddingBottom = '';
  if (view === 'session' && !session) view = 'home';
  const screens = { session: renderSession, texts: renderTexts, read: renderRead, dict: renderDict, train: renderTrain,
    progress: renderProgress, settings: renderSettings, summary: renderSummary };
  (screens[view] || renderHome)();
  if (!storageOk) root.insertBefore(h('div', { class: 'banner' }, 'Данные не сохраняются: закончилось место или включён приватный режим. Сохраните прогресс файлом в настройках.'), root.children[2] || null);
  if (TABBED[view]) document.body.append(tabs());
}
const backBtn = to => iconBtn('back', 'Назад', () => { reading = null; go(to); });

// ---------- главная ----------
function nextDueText() {
  const today = dayNum();
  const dues = Object.values(state.cards).map(k => k.due).filter(d => d > today);
  if (!dues.length) return '';
  const n = Math.min(...dues) - today;
  return n === 1 ? 'Следующее повторение завтра' : 'Следующее повторение через ' + n + ' ' + plural(n, 'день', 'дня', 'дней');
}
function todayHero(n) {
  const total = n.done + n.todo, extra = Math.min(n.fresh, state.settings.newPerDay);
  return hero(total ? n.done / total : 0, n.todo || n.done, n.todo ? 'осталось' : 'сделано',
    h('div', { class: 'line' }, n.todo
      ? n.due + ' к повторению и ' + n.newLeft + ' ' + plural(n.newLeft, 'новое', 'новых', 'новых')
      : (nextDueText() || 'Все карточки уже в работе')),
    n.todo ? h('button', { class: 'btn gold', 'data-act': 'start', onclick: () => start(0) }, 'Начать занятие')
      : n.fresh ? h('button', { class: 'btn gold', 'data-act': 'more', onclick: () => start(state.settings.newPerDay) }, 'Ещё ' + extra + ' ' + plural(extra, 'новое', 'новых', 'новых')) : null);
}
const rowBtn = (title, sub, onclick, side) => h('button', { class: 'rowc', type: 'button', onclick },
  h('span', { class: 'tx' }, h('span', { class: 'ti', style: 'display:block' }, title), sub ? h('span', { class: 'su', style: 'display:block' }, sub) : null),
  side ? h('span', { class: 'side' }, side) : null);
function renderHome() {
  const n = counts();
  put(root, top(iconBtn('texts', 'Тексты', () => go('texts')), 'Главная', iconBtn('settings', 'Настройки', () => go('settings')),
      n.done + n.todo ? n.done / (n.done + n.todo) : 0),
    h('h1', {}, n.todo ? 'Сегодня' : 'На сегодня всё'), todayHero(n),
    rowBtn('Мои тексты', state.texts.length ? state.texts.length + ' ' + plural(state.texts.length, 'текст', 'текста', 'текстов') + ', слов из них: ' + state.my.length
      : 'Загрузите текст и выберите слова для изучения', () => go('texts')),
    rowBtn('Уровень ' + n.level, 'Закреплено ' + n.solid + ' из ' + n.total, () => go('progress')));
}
function start(extra) {
  session = buildSession(extra);
  if (!session.queue.length) { session = null; toast('Сейчас нечего повторять'); return; }
  go('session');
}

// ---------- тренировка ----------
function renderTrain() {
  const n = counts(), extra = Math.min(n.fresh, state.settings.newPerDay);
  put(root, top(null, 'Тренировка', null, 0), h('h1', {}, 'Тренировка'),
    h('p', { class: 't' }, 'Занятие идёт по расписанию: сначала повторение, затем новые слова и выражения.'),
    rowBtn('Занятие на сегодня', n.todo ? n.due + ' к повторению, ' + n.newLeft + ' ' + plural(n.newLeft, 'новое', 'новых', 'новых') : (nextDueText() || 'Всё сделано'),
      () => n.todo ? start(0) : toast('На сегодня всё сделано'), n.todo ? String(n.todo) : ''),
    n.fresh ? rowBtn('Ещё новые', 'Взять ' + extra + ' сверх дневной нормы', () => start(state.settings.newPerDay), '+' + extra) : null,
    rowBtn('Чтение', 'Свой текст: перевод предложений и выбор слов', () => go('texts'), state.texts.length ? String(state.texts.length) : ''));
}

// ---------- прогресс ----------
function renderProgress() {
  const n = counts();
  const wp = n.word.n ? n.word.m / n.word.n : 0, cp = n.chunk.n ? n.chunk.m / n.chunk.n : 0;
  const toNext = Math.max(1, Math.ceil(PER_LEVEL - (n.points % PER_LEVEL)));
  const tile = (r, val, lbl) => h('div', { class: 'tile' }, r, h('div', { class: 'val' }, val), h('div', { class: 'lbl' }, lbl));
  const total = n.done + n.todo;
  put(root, top(null, 'Прогресс', null, n.levelPct), h('h1', {}, 'Прогресс'),
    hero(n.levelPct, n.level, 'уровень',
      h('div', { class: 'line' }, 'До следующего уровня: ' + toNext + ' ' + plural(toNext, 'закреплённая карточка', 'закреплённые карточки', 'закреплённых карточек'))),
    h('div', { class: 'tiles' },
      tile(ring(wp, 84, 4), pctText(wp), 'Слова: ' + n.word.n),
      tile(ring(cp, 84, 4), pctText(cp), 'Выражения: ' + n.chunk.n),
      tile(ring(total ? n.done / total : 0, 84, 4), n.done + ' из ' + total, 'Сегодня'),
      tile(ring(n.total ? n.started / n.total : 0, 84, 4), n.started + ' из ' + n.total, 'Начато')),
    h('p', { class: 't small center', style: 'margin-top:18px' }, 'Кольцо слова или выражения замыкается, когда интервал повторения доходит до трёх недель. Трудных карточек: ' + n.leech + '.'));
}

// ---------- занятие ----------
const norm = s => s.toLowerCase().replace(/[’‘`]/g, "'").replace(/[.,!?;:—–-]+$/g, '').replace(/\s+/g, ' ').trim();
function speak(text) {
  if (window.Android && Android.speak) { Android.speak(text); return; }
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.95; speechSynthesis.speak(u); } catch (e) {}
}
const canSpeak = () => !!(window.Android && Android.speak) || ('speechSynthesis' in window);
function errNote(c) { return c.err ? h('div', { class: 'note' }, h('b', {}, 'Типичная ошибка: '), c.err) : null; }
function advance(requeue) {
  const item = session.queue[session.pos];
  if (requeue) {
    const again = { c: item.c, kind: retryKind(item), retry: (item.retry || 0) + 1 };
    session.queue.splice(Math.min(session.queue.length, session.pos + 4), 0, again);
    session.total++;
  }
  session.pos++; session.done++;
  if (session.pos >= session.queue.length) { go('summary'); return; }
  render(); window.scrollTo(0, 0);
}
function retryKind(item) {
  const kinds = gapKinds(item.c).filter(k => k !== item.kind);
  return kinds.length ? kinds[0] : (item.c.gaps.length ? 'gap0' : 'tr');
}
const what = c => kindOf(c) === 'word' ? 'слово' : 'выражение';
const btn = (label, act, onclick, primary) => h('button', { class: 'btn' + (primary ? ' primary' : ''), type: 'button', 'data-act': act, onclick }, label);
function renderSession() {
  const item = session.queue[session.pos], c = item.c;
  const names = { intro: kindOf(c) === 'word' ? 'Новое слово' : 'Новое выражение', pair: 'Найти пару', notice: 'Заметить', meaning: 'Понять', form: 'Собрать',
    tr: 'Перевод', free: 'Свободный ответ' };
  const name = item.retry ? 'Ещё раз' : (names[item.kind] || 'Применить');
  const body = h('div', { class: 'card' });
  put(root, top(iconBtn('close', 'Закончить занятие', () => { session = null; go('home'); }), name,
    ring(session.done / session.total, 40, 3, false, h('span', { style: 'font-size:12px;font-weight:700' }, String(session.total - session.done))),
    session.done / session.total), body);
  const fn = { intro: exIntro, pair: exPair, notice: exNotice, meaning: exMeaning, form: exForm, tr: exOpen, free: exOpen }[item.kind] || exGap;
  fn(body, item, c);
}
function stars() {
  const s = svg('svg', { viewBox: '0 0 260 280', 'aria-hidden': 'true' });
  [[58, 96, 1.6], [204, 104, 1.3], [84, 56, 1.1], [176, 50, 1.6], [130, 32, 1.2], [42, 150, 1], [220, 160, 1.1], [70, 236, 1.2], [192, 240, 1]]
    .forEach(([x, y, r]) => s.append(svg('circle', { cx: x, cy: y, r, fill: '#C9A464', opacity: .8 })));
  [[112, 62], [158, 84], [214, 214]].forEach(([x, y]) =>
    s.append(svg('path', { d: `M${x} ${y - 5}l1.4 3.6 3.6 1.4-3.6 1.4-1.4 3.6-1.4-3.6-3.6-1.4 3.6-1.4z`, fill: '#C9A464' })));
  return s;
}
const wordSize = t => t.length <= 9 ? 58 : t.length <= 14 ? 48 : t.length <= 22 ? 38 : t.length <= 34 ? 30 : 22;

// Знакомство: без нагрузки.
function exIntro(body, item, c) {
  const long = c.en.length > 60, art = pic(c, true, 168);
  put(body, art ? [h('div', { class: 'arch pic' }, stars(), art), h('div', { class: 'word chunk', lang: 'en', style: 'margin-top:0;font-size:' + Math.max(34, wordSize(c.en)) + 'px' }, c.en)]
      : long ? h('div', { class: 'word', style: 'font-size:28px', lang: 'en' }, c.en)
      : h('div', { class: 'arch' }, stars(), h('div', { class: 'w', lang: 'en', style: 'font-size:' + wordSize(c.en) + 'px' }, c.en)),
    h('div', { class: 'trans' + (c.ru.length > 28 ? ' long' : '') }, c.ru),
    c.ex.length ? h('ul', { class: 'examples', lang: 'en' }, c.ex.map(e => h('li', {}, e))) : null,
    errNote(c),
    c.src ? h('p', { class: 't small', style: 'margin-top:12px' }, 'Из текста «' + c.src + '»') : null);
  const next = btn('Дальше', 'next', () => advance(), true);
  setFoot(canSpeak() ? h('div', { class: 'pair' }, btn('Прослушать', 'speak', () => speak(c.en + '. ' + (c.ex[0] || ''))), next) : next);
}
// Этап 1: заметить в предложении.
function exNotice(body, item, c) {
  const m = c.ctx.match(/^(.*?)\[(.+?)\](.*)$/);
  const toks = [];
  for (const [text, target] of [[m[1], false], [m[2], true], [m[3], false]]) for (const w of text.split(/\s+/).filter(Boolean)) toks.push({ w, target });
  const line = h('div', { class: 'tokens', lang: 'en' });
  let checked = false;
  const check = btn('Проверить', 'check', () => {
    if (checked) return; checked = true;
    const ok = toks.every(t => !!t.sel === t.target);
    toks.forEach(t => { t.el.classList.remove('sel'); if (t.target) t.el.classList.add('right'); else if (t.sel) t.el.classList.add('wrong'); });
    put(body, h('div', { class: 'trans long', style: 'margin-top:8px' }, c.ru));
    setFoot(h('div', { class: 'verdict ' + (ok ? 'ok' : 'no') }, ok ? 'Верно' : 'Неверно'), btn('Дальше', 'next', () => advance(), true));
  }, true);
  check.disabled = true;
  toks.forEach(t => {
    t.el = h('button', { class: 'tok', type: 'button', onclick: () => { if (checked) return; t.sel = !t.sel; t.el.classList.toggle('sel', t.sel); check.disabled = !toks.some(x => x.sel); } }, t.w);
    put(line, t.el);
  });
  put(body, h('div', { class: 'task' }, 'Найдите в предложении ' + what(c) + ' со значением «' + c.ru + '». Нажмите на нужные слова.'), line);
  setFoot(check);
}
// Плитки ответов.
function choice(body, task, head, options, correct, en, after) {
  const grid = h('div', { class: 'tiles' });
  let done = false;
  const next = btn('Дальше', 'next', () => advance(), true); next.disabled = true;
  const tiles = shuffle(options.slice()).map(o => {
    const b = h('button', { class: 'opt' + (en ? ' en' : '') + (!en && o.length > 34 ? ' long' : ''), type: 'button', lang: en ? 'en' : null }, o);
    b.dataset.v = o;
    b.addEventListener('click', () => {
      if (done) return; done = true;
      const ok = o === correct;
      tiles.forEach(x => {
        if (x.dataset.v === correct) { x.classList.add('right'); put(x, h('span', { class: 'badge' }, ico('check'))); }
        else if (x === b) { x.classList.add('wrong'); put(x, h('span', { class: 'badge bad' }, ico('close'))); }
        else x.classList.add('dim');
      });
      if (after) put(body, after);
      next.disabled = false;
      setFoot(h('div', { class: 'verdict ' + (ok ? 'ok' : 'no') }, ok ? 'Верно' : 'Неверно'), next);
    });
    return b;
  });
  put(grid, tiles);
  put(body, h('div', { class: 'task' }, task), head, grid);
  setFoot(next);
}
// Найти пару: какая картинка относится к выражению.
function exPair(body, item, c) {
  const others = shuffle(allChunks().filter(x => hasPic(x) && x.key !== c.key)).slice(0, 3);
  const grid = h('div', { class: 'tiles' });
  let done = false;
  const next = btn('Дальше', 'next', () => advance(), true); next.disabled = true;
  const tiles = shuffle([c].concat(others)).map((x, i) => {
    const b = h('button', { class: 'opt pic', type: 'button', 'aria-label': 'Картинка ' + (i + 1) }, pic(x, false, 118));
    b.dataset.v = x.id;
    b.addEventListener('click', () => {
      if (done) return; done = true;
      const ok = x.key === c.key;
      tiles.forEach(t => {
        if (t.dataset.v === c.id) { t.classList.add('right'); put(t, h('span', { class: 'badge' }, ico('check'))); }
        else if (t === b) { t.classList.add('wrong'); put(t, h('span', { class: 'badge bad' }, ico('close'))); }
        else t.classList.add('dim');
      });
      next.disabled = false;
      setFoot(h('div', { class: 'verdict ' + (ok ? 'ok' : 'no') }, ok ? 'Верно' : 'Неверно'), next);
    });
    return b;
  });
  put(grid, tiles);
  put(body, h('div', { class: 'task' }, 'Какая картинка подходит к выражению?'),
    h('div', { class: 'word chunk', lang: 'en', style: 'margin-top:4px;font-size:' + Math.min(44, wordSize(c.en) + 4) + 'px' }, c.en), grid);
  setFoot(next);
}
// Для своих карточек неверные варианты берутся из других карточек, ближайших по длине.
function distractors(c) {
  if (c.mean) return c.mean.slice(0, 2);
  const pool = [...new Set(allChunks().filter(x => x.key !== c.key && x.ru !== c.ru).map(x => x.ru))]
    .sort((a, b) => Math.abs(a.length - c.ru.length) - Math.abs(b.length - c.ru.length)).slice(0, 6);
  return shuffle(pool).slice(0, 2);
}
// Этап 2: понять значение.
function exMeaning(body, item, c) {
  choice(body, 'Что это значит?', h('div', { class: 'word chunk', lang: 'en', style: 'margin-top:4px;font-size:' + Math.min(48, wordSize(c.en) + 4) + 'px' }, c.en),
    [c.ru].concat(distractors(c)), c.ru, false);
}
// Этап 3: разобрать форму.
function exForm(body, item, c) {
  choice(body, 'Какое слово подходит?', h('p', { class: 'sent', lang: 'en' }, c.form.s.replace('___', '_____')),
    [c.form.a].concat(c.form.d.slice(0, 2)), c.form.a, true, errNote(c));
}
// Подставить ответ в пропуск; в начале предложения с заглавной буквы.
function fill(s, a) {
  return s.replace(/(^|[.!?—]\s+)?___/, (m, pre) => pre !== undefined ? pre + a[0].toUpperCase() + a.slice(1) : a);
}
// Четыре оценки с интервалами, как в Anki.
function rateBar(item, suggest, info, legend) {
  const bar = h('div', { class: 'rate' });
  ratingOptions(item.c).forEach(o => {
    put(bar, h('button', { class: 'g' + o.g + (o.g === suggest ? ' suggest' : ''), type: 'button', 'data-g': o.g, onclick: () => {
      session.ratings[o.g]++;
      applyRating(item, o.g, Object.assign({ suggest }, info));
      advance(o.g === 1);
    } }, h('b', {}, GRADES[o.g]), h('span', {}, fmtIvl(o.ivl))));
  });
  return [bar, h('div', { class: 'legend' }, legend)];
}
// Этап 4: вписать в пропуск, проверяется автоматически.
function exGap(body, item, c) {
  const g = c.gaps[Number(item.kind.slice(3)) || 0] || c.gaps[0];
  const input = h('input', { type: 'text', class: 'en', lang: 'en', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', 'aria-label': 'Ваш ответ' });
  const hintBox = h('div', { class: 'hintline' });
  let hinted = false, done = false;
  const check = btn('Проверить', 'check', () => {
    if (done || !input.value.trim()) return;
    done = true; input.disabled = true;
    const ok = g.a.some(a => norm(a) === norm(input.value));
    input.classList.add(ok ? 'good' : 'bad');
    hintBox.remove();
    put(body, h('div', { class: 'model', lang: 'en' }, h('span', { class: 'lbl', style: 'margin-left:0' }, 'Полностью'), h('div', { class: 'v' }, fill(g.s, g.a[0]))),
      ok ? null : errNote(c));
    const verdict = h('div', { class: 'verdict ' + (ok ? 'ok' : 'no') }, ok ? 'Верно' : 'Неверно');
    if (item.retry) {
      // Повтор после «Снова»: расписание уже посчитано, нужно только ответить верно.
      const again = !ok && item.retry < 3;
      setFoot(verdict, btn(again ? 'Ещё раз позже' : 'Дальше', 'next', () => advance(again), true));
    } else {
      setFoot(verdict, rateBar(item, ok ? (hinted ? 2 : 3) : 1, { answer: input.value },
        'Предложенная оценка выделена, её можно сменить. Под оценкой срок следующего повторения.'));
    }
  }, true);
  const hint = btn('Подсказка', 'hint', () => { hinted = true; hintBox.textContent = 'Первые буквы: ' + g.a[0].split(' ').map(w => w[0] + '…').join(' '); });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') check.click(); });
  put(body, h('div', { class: 'task' }, 'Впишите пропущенное: «' + g.ru + '».'),
    h('p', { class: 'sent', lang: 'en' }, g.s.replace('___', '_____')), h('div', { class: 'field' }, input), hintBox);
  setFoot(h('div', { class: 'pair' }, hint, check));
  setTimeout(() => input.focus({ preventScroll: true }), 0);
}
// Этап 4–5: перевод и свободный ответ, сверка с образцом своими глазами.
function exOpen(body, item, c) {
  const free = item.kind === 'free';
  const area = h('textarea', { class: 'en', lang: 'en', autocapitalize: 'sentences', spellcheck: 'false', 'aria-label': 'Ваш ответ' });
  let done = false;
  const show = btn('Показать образец', 'show', () => {
    if (done) return; done = true; area.disabled = true;
    put(body, h('div', { class: 'model', lang: 'en' }, h('span', { class: 'lbl', style: 'margin-left:0' }, free ? 'Возможный ответ' : 'Образец'),
        h('div', { class: 'v' }, free ? c.free.sample : c.tr.en)),
      c.auto && !free && c.ex[0] ? h('p', { class: 't small', style: 'margin-top:12px' }, 'В тексте: ', h('span', { lang: 'en' }, c.ex[0])) : null,
      c.auto && !free ? null : h('p', { class: 't small', style: 'margin-top:12px' }, 'Нужное ' + what(c) + ': ', h('b', { lang: 'en' }, c.en), '. Важна верная форма.'),
      errNote(c));
    if (item.retry) setFoot(btn('Дальше', 'next', () => advance(), true));
    else setFoot(rateBar(item, 0, { answer: area.value }, 'Оцените сами: не вспомнили, вспомнили с трудом, верно или сразу без усилий.'));
  }, true);
  const task = free ? 'Ответьте по-английски одним-двумя предложениями. Понадобится ' + what(c) + ' со значением «' + c.ru + '».'
    : c.auto ? 'Как это сказать по-английски?' : 'Переведите на английский. Понадобится выражение со значением «' + c.ru + '».';
  put(body, h('div', { class: 'task' }, task), h('p', { class: 'prompt' }, free ? c.free.q : c.tr.ru), h('div', { class: 'field' }, area));
  setFoot(show);
  setTimeout(() => area.focus({ preventScroll: true }), 0);
}

// ---------- итог ----------
function renderSummary() {
  const s = session || { ratings: [0, 0, 0, 0, 0], introduced: 0 };
  const rated = s.ratings.reduce((a, b) => a + b, 0), good = s.ratings[3] + s.ratings[4];
  const share = rated ? good / rated : 0;
  const tile = (v, l) => h('div', { class: 'tile' }, h('div', { class: 'val' }, v), h('div', { class: 'lbl' }, l));
  put(root, top(null, 'Итог', null, 1), h('h1', {}, share >= .8 ? 'Превосходно' : 'Занятие окончено'),
    hero(share, rated ? pctText(share) : '0', 'хорошо и легко',
      h('div', { class: 'line' }, 'Новых: ' + s.introduced + (nextDueText() ? '. ' + nextDueText() : ''))),
    h('div', { class: 'tiles' }, tile(s.ratings[1], 'Снова'), tile(s.ratings[2], 'Трудно'), tile(s.ratings[3], 'Хорошо'), tile(s.ratings[4], 'Легко')));
  setFoot(btn('На главную', 'home', () => { session = null; go('home'); }, true));
}

// ---------- тексты ----------
function autoTitle(body) {
  const first = body.split('\n')[0].trim();
  if (first.length <= 44) return first;
  return first.slice(0, 44).replace(/\s+\S*$/, '') + '…';
}
function addText(title, body) {
  body = String(body).replace(/\r\n?/g, '\n').replace(/[\[\]]/g, m => m === '[' ? '(' : ')').trim();
  if (!body) { toast('Текст пустой'); return; }
  let cut = false;
  if (body.length > 300000) { body = body.slice(0, 300000); cut = true; }
  const t = { id: 't' + Date.now().toString(36), title: (title || autoTitle(body)).trim().slice(0, 80), body, added: Date.now(), page: 0 };
  state.texts.unshift(t);
  if (!save()) { state.texts.shift(); save(); storageOk = true; toast('Не хватило места: текст слишком большой'); return; }
  toast(cut ? 'Добавлено. Текст длинный, сохранено начало' : 'Текст добавлен');
  reading = { id: t.id }; go('read');
}
function renderTexts() {
  const area = h('textarea', { placeholder: 'Вставьте текст', 'aria-label': 'Текст', style: 'font-size:19px;font-weight:500' });
  const file = h('input', { type: 'file', accept: '.txt,.md,.srt,text/plain', style: 'display:none' });
  file.addEventListener('change', () => {
    const f = file.files && file.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => addText(f.name.replace(/\.[^.]+$/, ''), r.result);
    r.onerror = () => toast('Файл не читается');
    r.readAsText(f);
  });
  put(root, top(backBtn('home'), 'Чтение', null, 0), h('h1', {}, 'Тексты'),
    h('p', { class: 't' }, 'Добавьте свой текст на английском или русском. Нажмите на предложение, чтобы увидеть перевод, и выберите слова для изучения.'));
  for (const t of state.texts) {
    const added = state.my.filter(m => m.srcId === t.id).length;
    const open = () => { reading = { id: t.id }; go('read'); };
    put(root, h('div', { class: 'rowc', role: 'button', tabindex: '0', style: 'cursor:pointer', onclick: open,
      onkeydown: e => { if (e.key === 'Enter') open(); } },
      h('div', { class: 'tx' }, h('div', { class: 'ti' }, t.title),
        h('div', { class: 'su' }, Math.max(1, t.body.split(/\s+/).length) + ' слов' + (added ? ', в изучении: ' + added : ''))),
      h('button', { class: 'link', onclick: e => { e.stopPropagation();
        if (confirm('Удалить текст «' + t.title + '»? Добавленные из него слова останутся.')) { state.texts = state.texts.filter(x => x.id !== t.id); save(); render(); } } }, 'Удалить')));
  }
  put(root, h('h2', {}, 'Новый текст'), h('div', { class: 'field' }, area), file);
  setFoot(h('div', { class: 'pair' }, btn('Из файла', 'file', () => file.click()), btn('Добавить', 'paste', () => addText('', area.value), true)));
}
const PAGE = 25; // абзацев на странице
function sentences(par) {
  return par.match(/[^.!?…]+[.!?…]+["'”’»)]*\s*|[^.!?…]+$/g) || [par];
}
function renderRead() {
  const t = state.texts.find(x => x.id === (reading && reading.id));
  if (!t) { view = 'texts'; renderTexts(); return; }
  const pars = t.body.split(/\n\s*\n|\n/).map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const pages = Math.max(1, Math.ceil(pars.length / PAGE));
  t.page = Math.min(t.page || 0, pages - 1);
  put(root, top(backBtn('texts'), 'Чтение', ring((t.page + 1) / pages, 40, 3, false, h('span', { style: 'font-size:12px;font-weight:700' }, String(t.page + 1))), (t.page + 1) / pages),
    h('h2', { style: 'margin-top:22px' }, t.title));
  const body = h('div', { class: 'reader' });
  let current = null;
  for (const par of pars.slice(t.page * PAGE, (t.page + 1) * PAGE)) {
    const p = h('p', {});
    for (const s of sentences(par)) {
      const span = h('span', { class: 's', tabindex: '0', role: 'button' }, s);
      const open = () => { if (current) current.classList.remove('on'); current = span; span.classList.add('on'); openSheet(t, s.trim(), () => { span.classList.remove('on'); current = null; }); };
      span.addEventListener('click', open);
      span.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
      put(p, span);
    }
    put(body, p);
  }
  put(root, body);
  root.style.paddingBottom = '60vh';
  const turn = d => { t.page += d; save(); render(); window.scrollTo(0, 0); };
  if (pages > 1) {
    const prev = btn('Назад', 'prev', () => turn(-1)), next = btn('Дальше', 'nextpage', () => turn(1), true);
    prev.disabled = t.page === 0; next.disabled = t.page >= pages - 1;
    put(root, h('div', { class: 'pair', style: 'margin:10px 28px 0' }, prev, next));
  }
}
// Панель предложения: перевод, выбор слов, добавление в изучение.
function openSheet(text, sentence, onClose) {
  document.querySelectorAll('.sheet').forEach(x => x.remove());
  const ru = isRu(sentence), from = ru ? 'ru' : 'en', to = ru ? 'en' : 'ru';
  const words = sentence.split(/\s+/).filter(Boolean);
  let a = -1, b = -1;
  const sheet = h('div', { class: 'sheet', role: 'dialog', 'aria-label': 'Перевод предложения' });
  const inner = h('div', { class: 'inner' });
  const close = () => { sheet.remove(); onClose(); };
  const line = h('div', { class: 'tokens', lang: from });
  const trLine = h('div', { class: 'tr wait' }, canTranslate() ? 'Перевожу' : '');
  const form = h('div', {});
  let sentenceTr = '';
  const els = words.map((w, i) => h('button', { class: 'tok', type: 'button', onclick: () => pick(i) }, w));
  put(line, els);
  function pick(i) {
    if (a < 0 || (i >= a && i <= b && a !== b)) { a = b = i; }
    else if (i === a && a === b) { a = b = -1; }
    else { a = Math.min(a, i); b = Math.max(b, i); }
    els.forEach((el, j) => el.classList.toggle('sel', j >= a && j <= b));
    drawForm();
  }
  function drawForm() {
    form.replaceChildren();
    const whole = a < 0;
    const sel = whole ? sentence : core(words.slice(a, b + 1).join(' '));
    if (!sel) return;
    // Учим всегда английскую сторону; русская идёт как значение.
    const learn = h('input', { type: 'text', class: 'en', 'aria-label': 'Что учить', value: ru ? (whole ? sentenceTr : '') : sel });
    const mean = h('input', { type: 'text', 'aria-label': 'Значение', value: ru ? sel : (whole ? sentenceTr : ''), placeholder: 'Перевод' });
    const target = ru ? learn : mean;
    if (!target.value && canTranslate()) {
      target.placeholder = 'Перевожу';
      translate(sel, from, to).then(r => { if (r && !target.value) target.value = r; target.placeholder = ru ? 'По-английски' : 'Перевод'; });
    } else if (ru) learn.placeholder = 'По-английски';
    const add = btn(whole ? 'Учить всё предложение' : 'Добавить в изучение', 'add', () => {
      const en = learn.value.trim(), rus = mean.value.trim();
      if (!en || !rus) { toast('Заполните оба поля'); return; }
      if (state.my.some(m => norm(m.en) === norm(en))) { toast('Это уже есть в изучении'); return; }
      const ctx = ru ? '[' + en + ']'
        : whole ? '[' + sentence + ']'
        : words.slice(0, a).concat(['[' + words.slice(a, b + 1).join(' ') + ']'], words.slice(b + 1)).join(' ');
      state.my.push({ id: 'm' + Date.now().toString(36), en, ru: rus, type: /\s/.test(en) ? 'chunk' : 'word', ctx, src: text.title, srcId: text.id });
      save(); toast(/\s/.test(en) ? 'Выражение добавлено' : 'Слово добавлено');
      a = b = -1; els.forEach(el => el.classList.remove('sel')); drawForm();
    }, true);
    put(form, h('p', { class: 't small' }, whole ? 'Нажмите на слова, чтобы выбрать слово или выражение. Первое и последнее нажатие задают границы.'
      : 'Проверьте перевод и поправьте, если нужно.'),
      h('div', { class: 'field' }, h('span', { class: 'lbl' }, 'Учить'), learn),
      h('div', { class: 'field' }, h('span', { class: 'lbl' }, 'Значение'), mean), add);
  }
  put(inner, h('div', { class: 'head' }, h('div', { class: 'over', style: 'text-align:left' }, ru ? 'Русский → английский' : 'Английский → русский'),
    h('button', { class: 'icon x', type: 'button', 'aria-label': 'Закрыть', onclick: close }, ico('close'))), line, trLine, form);
  put(sheet, inner); document.body.append(sheet);
  drawForm();
  if (canTranslate()) {
    translate(sentence, from, to).then(r => {
      if (!sheet.isConnected) return;
      if (r) { sentenceTr = r; trLine.classList.remove('wait'); trLine.textContent = r; trLine.lang = to; if (a < 0) drawForm(); }
      else trLine.textContent = 'Перевести не удалось. При первом переводе нужен интернет: скачивается языковая модель.';
    });
  } else {
    put(trLine, 'Автоперевод работает в приложении для Android. Здесь впишите перевод сами или ',
      h('a', { href: 'https://translate.google.com/?sl=' + from + '&tl=' + to + '&text=' + encodeURIComponent(sentence), target: '_blank', rel: 'noopener' }, 'откройте переводчик'), '.');
  }
}

// ---------- слова ----------
function renderDict() {
  const today = dayNum();
  const chip = (id, label) => h('button', { 'aria-pressed': String(dictFilter === id), 'data-f': id, onclick: () => { dictFilter = id; render(); } }, label);
  put(root, top(null, 'Словарь', null, 0), h('h1', {}, 'Слова'),
    h('div', { class: 'chips' }, chip('all', 'Все'), chip('word', 'Слова'), chip('chunk', 'Выражения'), chip('my', 'Из моих текстов')));
  const topics = new Map();
  for (const c of allChunks()) {
    if (dictFilter === 'my' ? !c.auto : (dictFilter !== 'all' && kindOf(c) !== dictFilter)) continue;
    const t = c.topic || 'Без темы'; if (!topics.has(t)) topics.set(t, []); topics.get(t).push(c);
  }
  if (!topics.size) put(root, h('p', { class: 't' }, dictFilter === 'word' || dictFilter === 'my'
    ? 'Пока пусто. Откройте «Чтение» во вкладке «Тренировка», нажмите на предложение и выберите слово.' : 'Пока пусто.'));
  for (const [t, list] of topics) {
    put(root, h('h2', {}, t));
    for (const c of list) {
      const k = state.cards[c.key], m = mastery(k);
      const side = !k ? h('span', { class: 'side' }, 'новое')
        : k.lapses >= LEECH ? h('span', { class: 'side hard' }, 'трудное')
        : k.due <= today ? h('span', { class: 'side due' }, 'сегодня')
        : h('span', { class: 'side' }, Math.round(m * 100) + '%, ' + fmtIvl(k.due - today));
      put(root, h('details', { class: 'rowc' },
        h('summary', {}, h('span', { class: 'medal' }, ring(m, 54, 2, true, pic(c, true, 34) || h('span', { class: 'val' }, c.en.trim()[0].toUpperCase()))),
          h('span', { class: 'tx' }, h('span', { class: 'ti en', lang: 'en', style: 'display:block' }, c.en), h('span', { class: 'su', style: 'display:block' }, c.ru)), side),
        h('div', { class: 'more' },
          c.ex.length ? h('ul', { class: 'examples', lang: 'en', style: 'margin:0' }, c.ex.map(e => h('li', {}, e))) : null,
          c.err ? h('div', { class: 'note', style: 'margin:12px 0 0' }, h('b', {}, 'Типичная ошибка: '), c.err) : null,
          h('p', { class: 'small', style: 'margin:12px 0 0;color:var(--ink2)' },
            'Источник: ' + (c.auto ? (c.src ? 'текст «' + c.src + '»' : 'мой текст') : (c.deck.source || c.deck.title || c.deck.id) + (c.lesson ? ', урок ' + c.lesson : '')) +
            (k ? '. Повторений: ' + k.reps + ', срывов: ' + k.lapses + '.' : '.')),
          c.auto ? h('button', { class: 'link', style: 'margin-top:8px', onclick: () => {
            if (!confirm('Убрать «' + c.en + '» из изучения?')) return;
            state.my = state.my.filter(x => x.id !== c.id); delete state.cards[c.key]; save(); render();
          } }, 'Убрать из изучения') : null)));
    }
  }
}

// ---------- настройки и данные ----------
function download(name, obj) {
  // В приложении для Android файл сохраняется через системный диалог.
  if (window.Android && Android.saveFile) { Android.saveFile(name, JSON.stringify(obj, null, 1)); return; }
  const url = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 1)], { type: 'application/json' }));
  const a = h('a', { href: url, download: name }); document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function pickFile(cb) {
  const inp = h('input', { type: 'file', accept: '.json,application/json', style: 'display:none' });
  inp.addEventListener('change', () => {
    const f = inp.files && inp.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { cb(JSON.parse(String(r.result))); } catch (e) { toast('Файл не читается: это не JSON'); } };
    r.readAsText(f);
  });
  document.body.append(inp); inp.click(); setTimeout(() => inp.remove(), 60000);
}
function renderSettings() {
  const s = state.settings;
  const num = (label, key, min, max, hint) => {
    const inp = h('input', { type: 'number', min, max, inputmode: 'numeric', value: s[key] });
    inp.addEventListener('change', () => { const v = Math.round(Number(inp.value)); s[key] = Math.min(max, Math.max(min, isFinite(v) ? v : s[key])); inp.value = s[key]; save(); toast('Сохранено'); });
    return [h('div', { class: 'field' }, h('span', { class: 'lbl' }, label), inp), h('p', { class: 't small' }, hint)];
  };
  const sel = h('select', {}, [0.85, 0.9, 0.95].map(v => h('option', { value: v, selected: Math.abs(s.retention - v) < 0.001 }, Math.round(v * 100) + '%')));
  sel.addEventListener('change', () => { s.retention = Number(sel.value); save(); toast('Сохранено'); });
  const wide = (label, act, onclick) => h('div', { style: 'margin:0 28px 12px' }, btn(label, act, onclick));
  put(root, top(backBtn('home'), 'Настройки', null, 0), h('h1', {}, 'Настройки'),
    h('h2', {}, 'Нагрузка'),
    num('Новых в день', 'newPerDay', 0, 50, 'По умолчанию 5. Каждая новая карточка добавляет повторения в следующие дни.'),
    num('Повторений за занятие, не больше', 'maxReviews', 5, 500, 'Если накопилось больше, остальное перейдёт на следующее занятие.'),
    h('div', { class: 'field' }, h('span', { class: 'lbl' }, 'Желаемое удержание'), sel),
    h('p', { class: 't small' }, 'С какой вероятностью вы должны помнить карточку к моменту повторения. 85%: меньше повторений. 95%: надёжнее, но повторений заметно больше.'),
    h('h2', {}, 'Прогресс'),
    h('p', { class: 't' }, 'Прогресс, тексты и свои слова хранятся на этом устройстве. Сохраняйте их файлом, чтобы перенести или не потерять.'),
    wide('Сохранить в файл', 'export', () => download('chunks-progress-' + dayKey() + '.json', { format: 'chunk-progress/1', exported: new Date().toISOString(), state })),
    wide('Загрузить из файла', 'import', () => pickFile(d => {
      if (!d || d.format !== 'chunk-progress/1' || !d.state || typeof d.state.cards !== 'object') { toast('Это не файл прогресса'); return; }
      if (!confirm('Заменить текущий прогресс данными из файла?')) return;
      state = adopt(d.state);
      for (const [id, deck] of Object.entries(state.decks)) if (validDeck(deck)) delete state.decks[id];
      state.my = state.my.filter(m => m && typeof m.en === 'string' && typeof m.ru === 'string' && typeof m.id === 'string');
      state.texts = state.texts.filter(t => t && typeof t.body === 'string' && typeof t.title === 'string' && typeof t.id === 'string');
      save(); render(); toast('Прогресс загружен');
    })),
    h('h2', {}, 'Колоды'));
  for (const d of allDecks()) {
    const removable = d !== BUILTIN && !d.mine;
    put(root, h('div', { class: 'rowc' },
      h('div', { class: 'tx' }, h('div', { class: 'ti' }, d.title || d.id), h('div', { class: 'su' }, d.chunks.length + ' ' + plural(d.chunks.length, 'карточка', 'карточки', 'карточек') + (d === BUILTIN ? ', встроенная' : ''))),
      removable ? h('button', { class: 'link', onclick: () => { if (confirm('Удалить колоду «' + (d.title || d.id) + '» и её прогресс?')) {
        delete state.decks[d.id]; for (const k of Object.keys(state.cards)) if (k.startsWith(d.id + '/')) delete state.cards[k]; save(); render(); } } }, 'Удалить') : null));
  }
  put(root, h('div', { style: 'height:6px' }),
    wide('Добавить колоду из файла', 'deck', () => pickFile(d => {
      const err = validDeck(d); if (err) { toast(err); return; }
      if (d.id === BUILTIN.id) { toast('Колода с таким идентификатором уже встроена'); return; }
      state.decks[d.id] = d; save(); render(); toast('Колода добавлена: ' + d.chunks.length);
    })),
    wide('Скачать образец колоды', 'sample', () => download('deck-' + BUILTIN.id + '.json', BUILTIN)),
    h('h2', {}, 'Сброс'),
    wide('Начать заново', 'reset', () => {
      if (!confirm('Стереть весь прогресс? Колоды, тексты и свои слова останутся.')) return;
      state.cards = {}; state.log = []; state.day = { date: '', introduced: 0, reviewed: 0 }; save(); render(); toast('Прогресс стёрт');
    }));
  root.style.paddingBottom = '48px';
}

// Кнопка «Назад» в приложении для Android.
window.appBack = () => {
  const x = document.querySelector('.sheet .x');
  if (x) { x.click(); return true; }
  if (view === 'home') return false;
  if (view === 'read') { reading = null; go('texts'); return true; }
  session = null; go('home'); return true;
};
rollDay(); save(); render();
})();
