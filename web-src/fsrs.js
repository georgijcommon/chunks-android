// FSRS-6 с параметрами по умолчанию (те же, что в ts-fsrs 5.x / современном Anki).
const FSRS = (() => {
  const W = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796,
    1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542];
  const DECAY = -W[20];
  const FACTOR = Math.pow(0.9, 1 / DECAY) - 1;
  const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
  const S_MIN = 0.001;

  // Вероятность вспомнить через t дней при стабильности s.
  const retrievability = (t, s) => Math.pow(1 + FACTOR * t / s, DECAY);
  // Интервал в днях, при котором вероятность вспомнить упадёт до retention.
  const interval = (s, retention) =>
    clamp(Math.round(s / FACTOR * (Math.pow(retention, 1 / DECAY) - 1)), 1, 36500);
  const initDifficulty = g => W[4] - Math.exp((g - 1) * W[5]) + 1;

  // mem: {s, d} или null для новой карточки; g: 1 Again, 2 Hard, 3 Good, 4 Easy; t: прошло дней.
  function next(mem, g, t) {
    if (!mem || !mem.s) {
      return { s: Math.max(W[g - 1], 0.1), d: clamp(initDifficulty(g), 1, 10) };
    }
    const { s, d } = mem;
    const r = retrievability(t, s);
    const damped = d + (-W[6] * (g - 3)) * (10 - d) / 9;
    const nd = clamp(W[7] * initDifficulty(4) + (1 - W[7]) * damped, 1, 10);
    let ns;
    if (t < 1) {
      const sinc = Math.pow(s, -W[19]) * Math.exp(W[17] * (g - 3 + W[18]));
      ns = s * (g >= 2 ? Math.max(sinc, 1) : sinc);
    } else if (g === 1) {
      ns = Math.min(
        W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp((1 - r) * W[14]), s);
    } else {
      const hard = g === 2 ? W[15] : 1;
      const easy = g === 4 ? W[16] : 1;
      ns = s * (1 + Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) *
        (Math.exp((1 - r) * W[10]) - 1) * hard * easy);
    }
    return { s: clamp(ns, S_MIN, 36500), d: nd };
  }
  // Все четыре исхода сразу, с упорядоченными интервалами (как в Anki):
  // Again <= Hard < Good < Easy.
  function options(mem, t, retention) {
    const o = [1, 2, 3, 4].map(g => {
      const m = next(mem, g, t);
      return { g, s: m.s, d: m.d, ivl: interval(m.s, retention) };
    });
    o[0].ivl = Math.min(o[0].ivl, o[1].ivl);
    o[1].ivl = Math.max(o[1].ivl, o[0].ivl + 1);
    o[2].ivl = Math.max(o[2].ivl, o[1].ivl + 1);
    o[3].ivl = Math.max(o[3].ivl, o[2].ivl + 1);
    return o;
  }
  return { next, interval, retrievability, options };
})();
if (typeof module !== 'undefined') module.exports = FSRS;
