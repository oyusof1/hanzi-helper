# 汉字 Helper

A supplemental study tool for your [HanziHero](https://hanzihero.com) learning. It
pulls the characters **you've actually learned** and turns them into flashcards, a
quiz, a reading-practice generator, and a progress dashboard — all with Chinese
text-to-speech.

## Features

- **Dashboard** — count learned, SRS-stage breakdown, how many sentences you can fully read, last-updated time.
- **Flashcards** — 汉字↔meaning, audio, shuffle, filter by SRS stage, self-grading.
- **Quiz** — multiple choice: 汉字→meaning, meaning→汉字, 汉字→pinyin, with scoring + audio.
- **Reading practice** — real sentences where **every character is one you've learned**, with per-character pinyin on hover, sentence + per-character audio, and reveal-translation. The readable set grows automatically as you learn more.
- **Browse** — searchable/sortable grid of your whole learned list, click to hear.
- **TTS** — uses the browser's built-in Chinese voice (free, offline). Pick voice + speed in the top bar.

## Setup

```bash
npm install
npm run dev        # opens http://localhost:5173
```

## Keeping your character list fresh

As you unlock new characters in HanziHero, re-scrape:

```bash
npm run refresh    # re-pulls srs=learned -> public/characters.json
```

The scraper needs your HanziHero session cookie in `scraper/cookies.txt`
(one line). Cookies expire every so often — when `npm run refresh` returns a
login error or 0 results, refresh the file:

1. Log in to hanzihero.com in your browser.
2. DevTools → Network → click any request to hanzihero.com → Headers →
   copy the `cookie:` request-header value.
3. Paste it as a single line into `scraper/cookies.txt`.

You can scrape a different bucket with `HH_SRS=... npm run refresh`
(values: `learned` (default), `unknown`, or `""` for the whole catalog — note
`""` is ~1500 characters, the entire course, not just your progress).

## Reading corpus

Reading practice uses Tatoeba sentence pairs (`public/corpus.json`). To rebuild
it (e.g. after re-downloading `scraper/cmn.txt` from
[manythings.org/anki](https://www.manythings.org/anki/)):

```bash
npm run corpus
```

Sentences: Tatoeba (tatoeba.org), CC-BY 2.0 FR.

## How it works

`scraper/scrape.mjs` fetches your authenticated HanziHero character pages and
parses out `{hanzi, pinyin, meaning, stage}` into `public/characters.json`. The
Vite SPA loads that file plus the sentence corpus and derives everything
client-side, so the only thing you ever refresh is the scrape.
```
hanzi-helper/
  scraper/        scrape.mjs (characters)  ·  build-corpus.mjs (sentences)
  public/         characters.json  ·  corpus.json
  src/            App.jsx + components/ (Dashboard, Flashcards, Quiz, Reading, Browse)
```
