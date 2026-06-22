// Chinese text-to-speech via the browser's built-in Web Speech API (free, offline
// on most platforms — macOS ships the "Tingting" zh-CN voice).

let voicesCache = [];

function refreshVoices() {
  if (typeof speechSynthesis === "undefined") return [];
  voicesCache = speechSynthesis.getVoices();
  return voicesCache;
}

if (typeof speechSynthesis !== "undefined") {
  refreshVoices();
  speechSynthesis.onvoiceschanged = refreshVoices;
}

export function chineseVoices() {
  const all = voicesCache.length ? voicesCache : refreshVoices();
  return all.filter((v) => /^zh\b|zh-|cmn/i.test(v.lang));
}

export function ttsSupported() {
  return typeof speechSynthesis !== "undefined";
}

let preferredVoiceURI = localStorage.getItem("hh.voiceURI") || null;
let rate = Number(localStorage.getItem("hh.rate") || 0.9);

export function setVoice(uri) {
  preferredVoiceURI = uri;
  localStorage.setItem("hh.voiceURI", uri);
}
export function getVoiceURI() {
  return preferredVoiceURI;
}
export function setRate(r) {
  rate = r;
  localStorage.setItem("hh.rate", String(r));
}
export function getRate() {
  return rate;
}

export function speak(text) {
  if (!ttsSupported() || !text) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-CN";
  u.rate = rate;
  const zh = chineseVoices();
  const chosen =
    zh.find((v) => v.voiceURI === preferredVoiceURI) || zh[0] || null;
  if (chosen) u.voice = chosen;
  speechSynthesis.speak(u);
}
