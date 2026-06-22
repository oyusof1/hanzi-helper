// Loads the scraped character data + sentence corpus and derives helpers.

export const isHan = (ch) => /[㐀-䶿一-鿿]/.test(ch);

let cache = null;

export async function loadData() {
  if (cache) return cache;
  const [chRes, coRes] = await Promise.all([
    fetch("/characters.json"),
    fetch("/corpus.json"),
  ]);
  const charData = await chRes.json();
  const corpus = await coRes.json();

  const characters = charData.characters;
  const known = new Set(characters.map((c) => c.hanzi));
  const byChar = new Map(characters.map((c) => [c.hanzi, c]));

  // Sentences whose every Han character is in the learned set.
  const readable = corpus.sentences.filter((s) =>
    [...s.zh].every((ch) => !isHan(ch) || known.has(ch))
  );

  cache = {
    scrapedAt: charData.scrapedAt,
    characters,
    known,
    byChar,
    corpusCount: corpus.count,
    corpusCredit: { source: corpus.source, license: corpus.license },
    readable,
  };
  return cache;
}

// Order HanziHero's SRS stages weakest → strongest.
export const STAGE_ORDER = [
  "Novice I",
  "Novice II",
  "Apprentice I",
  "Apprentice II",
  "Journeyman I",
  "Journeyman II",
  "Expert I",
  "Expert II",
  "Master I",
  "Master II",
];

export function stageRank(stage) {
  const i = STAGE_ORDER.indexOf(stage);
  return i === -1 ? 99 : i;
}

export function stageGroup(stage) {
  return (stage || "Unknown").split(" ")[0];
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample(arr, n) {
  return shuffle(arr).slice(0, n);
}
