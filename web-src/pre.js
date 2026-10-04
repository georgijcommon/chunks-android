/* ===== Объединяющий слой, часть 1: то, что должно существовать до кода «Инея» ===== */
/*__FSRS__*/
const KDECK = /*__DECK__*/;
const KPICS = /*__PICS__*/;
// Русский перевод первого примера каждого выражения.
const KEXR = {
 'take-your-time':'Не торопись — спешки нет.','in-a-rush':'Извини, не могу говорить — я спешу.','waste-time':'Хватит тратить время, начинай собираться.',
 'last-minute':'Не откладывай на последний момент — бронируй билеты сейчас.','run-out-of-time':'У меня закончилось время, и я не успел ответить на последний вопрос.',
 'fall-behind':'Я неделю болел и отстал по работе.','in-advance':'Заранее спасибо за помощь.','take-ages':'Я добирался сюда целую вечность — пробки были ужасные.',
 'make-small-talk':'Мы болтали о пустяках, пока ждали начала встречи.','strike-up':'Он завязал разговор с женщиной в поезде.','have-an-argument':'Вчера я поссорился с братом.',
 'straight-to-the-point':'Позвольте перейти сразу к делу.','drop-hints':'Он всё намекал, что хочет, чтобы его пригласили.','give-your-word':'Даю тебе слово — я никому не скажу.',
 'ask-a-favor':'Можно попросить тебя об одолжении? Мне завтра нужно, чтобы меня подвезли.','go-on-and-on':'Она без умолку рассказывала о своём отпуске.',
 'totally-agree':'Полностью согласен — это слишком дорого.','up-to-a-point':'Я согласен отчасти, но думаю, всё сложнее.','afraid-i-disagree':'Боюсь, я не согласен — по-моему, старый дизайн был лучше.',
 'see-your-point':'Я понимаю вашу мысль, но не уверен, что это сработает.','reach-a-compromise':'Через два часа они пришли к компромиссу.',
 'agree-to-disagree':'Мы никогда не сойдёмся в этом, так что давай останемся каждый при своём мнении.','make-a-decision':'Мне нужно больше времени, чтобы принять решение.',
 'tough-decision':'Это было трудное решение, но, думаю, правильное.','pros-and-cons':'Мы обсудили плюсы и минусы работы из дома.','take-advice':'Я последовал твоему совету и позвонил ей.',
 'second-thoughts':'Я начинаю сомневаться, стоит ли покупать эту квартиру.','options-open':'Я ещё не решил; оставляю себе свободу выбора.',
 'no-choice':'У меня не было выбора — последний автобус уже ушёл.','snap-decision':'Это было мгновенное решение, и позже я о нём пожалел.'};
const KTOP = {'Время':'time','Разговор':'speak','Согласие':'agree','Решения':'decide'};
// Наши иллюстрации перекрашиваются в палитру «Инея».
const KPAL = {'{B}':'#34475C','{S}':'#FFFFFF','{D}':'#34475C','{H}':'#CBE3F1','{T}':'#EEF5FB',
  '#C9A464':'#F2C66B','#A5803F':'#9AA0F2','#F1D48A':'#FFE29A','#D9BC84':'#FFE29A','#4C6B66':'#5FCFC0','#DCEBEC':'#CBE3F1',
  '#9A3B3B':'#B8435B','#0E1A2B':'#34475C','#F3EBDD':'#FFFFFF','#F3EBDD':'#FFFFFF'};
const kPic = m => m.replace(/\{[BSDHT]\}|#[0-9A-Fa-f]{6}/g, x => KPAL[x] || x).replace(/'/g, '"');
// Выражение из нашей колоды в формате карточки «Инея», с упражнениями на применение.
function kItem(c, coll, id, icon) {
  const own = new Set(c.en.toLowerCase().split(' '));
  const d = (c.form ? c.form.d : []).map(w => w.toLowerCase()).filter(w => !own.has(w));
  return { id, coll, k: 'c', en: c.en, ru: c.ru, ex: c.ex[0] || '', exr: KEXR[c.id] || '', ex2: c.ex[1] || '', d, icon, lv: 'B1',
    ctx: c.ctx, mean: c.mean, form: c.form, gaps: c.gaps, tr: c.tr, free: c.free, err: c.err || '', lesson: c.lesson };
}
function validDeck(d) {
  if (!d || d.format !== 'chunk-deck/1' || typeof d.id !== 'string' || !Array.isArray(d.chunks) || !d.chunks.length) return 'Это не файл колоды';
  for (const c of d.chunks) {
    const ok = c && typeof c.id === 'string' && typeof c.en === 'string' && typeof c.ru === 'string' &&
      Array.isArray(c.ex) && typeof c.ctx === 'string' && /\[.+\]/.test(c.ctx) &&
      Array.isArray(c.mean) && c.mean.length >= 2 && c.mean.every(x => typeof x === 'string') &&
      c.form && typeof c.form.s === 'string' && typeof c.form.a === 'string' && Array.isArray(c.form.d) && c.form.d.every(x => typeof x === 'string') &&
      Array.isArray(c.gaps) && c.gaps.length && c.gaps.every(g => g && typeof g.s === 'string' && Array.isArray(g.a) && g.a.length) &&
      c.tr && typeof c.tr.ru === 'string' && typeof c.tr.en === 'string' &&
      c.free && typeof c.free.q === 'string' && typeof c.free.sample === 'string';
    if (!ok) return 'В колоде есть выражение с неполными данными: ' + (c && c.id || '?');
  }
  return '';
}
