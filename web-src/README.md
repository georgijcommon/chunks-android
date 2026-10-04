# Исходники страницы тренажёра

`build.py` собирает из этих файлов одну страницу `english-chunks.html`
(она же `app/src/main/assets/index.html` в приложении).

- `app.html` — разметка и стили
- `app.js` — логика
- `fsrs.js` — расписание повторений (FSRS-6)
- `deck.json` — встроенная колода, 30 выражений
- `pics.json` — иллюстрации

Шрифты берутся из пакетов `@fontsource-variable/cormorant-garamond` и
`@fontsource-variable/manrope` (`npm i` перед сборкой).
