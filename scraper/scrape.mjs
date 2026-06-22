#!/usr/bin/env node
// HanziHero scraper — pulls your learned characters into ../public/characters.json
//
// Usage:
//   node scraper/scrape.mjs                 # scrape srs=learned (default)
//   HH_SRS=all node scraper/scrape.mjs      # scrape everything you've seen
//
// Auth: paste your browser cookie into scraper/cookies.txt (one line), OR set
// the HH_COOKIE env var. Cookies expire periodically — if you get a login page
// or 0 results, refresh cookies.txt from your browser's devtools (Network tab).

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "characters.json");
const SRS = process.env.HH_SRS || "learned";
const BASE = "https://hanzihero.com/simplified/characters";

async function getCookie() {
  if (process.env.HH_COOKIE) return process.env.HH_COOKIE.trim();
  try {
    return (await readFile(join(__dirname, "cookies.txt"), "utf8")).trim();
  } catch {
    console.error("No cookie found. Put it in scraper/cookies.txt or set HH_COOKIE.");
    process.exit(1);
  }
}

// Pull the value of the first matching capture group, trimmed, or null.
const grab = (re, s) => {
  const m = re.exec(s);
  return m ? m[1].trim() : null;
};

function parseTiles(html) {
  // Each character lives in an <li id="subject-tile-NNNN" ...> ... </li> block.
  const blocks = html.split(/<li id="subject-tile-/).slice(1);
  const out = [];
  for (const raw of blocks) {
    const block = "<li id=\"subject-tile-" + raw;
    const subjectId = grab(/subject-tile-(\d+)/, block);
    // The character link: href=".../characters/<percent-encoded-hanzi>"
    const encoded = grab(/\/simplified\/characters\/([^"]+)"/, block);
    if (!encoded) continue;
    let hanzi;
    try {
      hanzi = decodeURIComponent(encoded);
    } catch {
      continue;
    }
    // SRS stage e.g. "Expert I stage item."
    const stage = grab(/data-tippy-content="([^"]*?)\s*stage item/, block);
    // pinyin: first <span class="text-sm font-light ...">PINYIN</span>
    const pinyin = grab(/text-sm font-light[^>]*>\s*([^<]+?)\s*<\/span>/, block);
    // meaning: <span class="text-[15px] ...">MEANING</span>
    const meaning = grab(/text-\[15px\][^>]*>\s*([^<]+?)\s*<\/span>/, block);
    out.push({
      hanzi,
      pinyin: pinyin || "",
      meaning: meaning || "",
      stage: stage || "",
      subjectId: subjectId ? Number(subjectId) : null,
    });
  }
  return out;
}

async function fetchPage(cookie, page) {
  const url = `${BASE}?hsk=&srs=${encodeURIComponent(SRS)}&status=&order=lesson&page=${page}`;
  const res = await fetch(url, {
    headers: {
      cookie,
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on page ${page}`);
  const html = await res.text();
  if (/log\s*in|sign\s*in/i.test(html) && !html.includes("subject-tile-")) {
    throw new Error("Got a login page — your cookie has expired. Refresh scraper/cookies.txt.");
  }
  return parseTiles(html);
}

async function main() {
  const cookie = await getCookie();
  const seen = new Map(); // hanzi -> record (dedupe across pages)
  // HanziHero's page ordering isn't stable across requests, so a short page is
  // NOT a reliable end signal. Page until we hit a genuinely empty page, with a
  // hard safety cap and an "N empty/duplicate pages in a row" stop.
  const MAX_PAGES = 60;
  let emptyStreak = 0;
  for (let page = 1; page <= MAX_PAGES; page++) {
    const tiles = await fetchPage(cookie, page);
    let added = 0;
    for (const t of tiles) {
      if (!seen.has(t.hanzi)) {
        seen.set(t.hanzi, t);
        added++;
      }
    }
    console.log(`page ${page}: ${tiles.length} tiles (${added} new, ${seen.size} total)`);
    if (tiles.length === 0) break;
    // Stop once two consecutive pages bring nothing new (handles unstable order).
    emptyStreak = added === 0 ? emptyStreak + 1 : 0;
    if (emptyStreak >= 2) break;
    await new Promise((r) => setTimeout(r, 250)); // be polite
  }

  const characters = [...seen.values()];
  const payload = {
    scrapedAt: new Date().toISOString(),
    srs: SRS,
    count: characters.length,
    characters,
  };
  await writeFile(OUT, JSON.stringify(payload, null, 2));
  console.log(`\n✓ ${characters.length} characters → ${OUT}`);
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
