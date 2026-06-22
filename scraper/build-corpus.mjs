#!/usr/bin/env node
// Build a compact Chinese↔English sentence corpus for reading practice.
// Source: Tatoeba cmn-eng pairs (CC-BY 2.0 FR) via manythings.org.
//
//   node scraper/build-corpus.mjs
//
// Reading practice filters this corpus client-side to sentences whose every
// Han character is in your learned set — so it grows automatically as you learn.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "cmn.txt");
const OUT = join(__dirname, "..", "public", "corpus.json");

const isHan = (ch) => /[一-鿿㐀-䶿]/.test(ch);

const txt = await readFile(SRC, "utf8");
const seen = new Set();
const sentences = [];
for (const line of txt.split("\n")) {
  const [en, zh] = line.split("\t");
  if (!zh || !en) continue;
  const z = zh.trim();
  if (seen.has(z)) continue;
  const hanCount = [...z].filter(isHan).length;
  if (hanCount === 0) continue;
  seen.add(z);
  sentences.push({ zh: z, en: en.trim(), n: hanCount });
}
sentences.sort((a, b) => a.n - b.n);

const payload = {
  source: "Tatoeba (tatoeba.org) cmn-eng sentence pairs",
  license: "CC-BY 2.0 FR — https://creativecommons.org/licenses/by/2.0/fr/",
  builtAt: new Date().toISOString(),
  count: sentences.length,
  sentences,
};
await writeFile(OUT, JSON.stringify(payload));
console.log(`✓ ${sentences.length} sentences → ${OUT}`);
