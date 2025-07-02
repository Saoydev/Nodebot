const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, '..', '.watcher-cache.json');

function loadCache() {
  try {
    if (!fs.existsSync(CACHE_FILE)) return new Map();
    const raw = fs.readFileSync(CACHE_FILE, 'utf8');
    if (!raw.trim()) return new Map();
    const parsed = JSON.parse(raw);
    const map = new Map();
    for (const [file, changes] of Object.entries(parsed)) {
      map.set(file, changes);
    }
    return map;
  } catch {
    try { fs.unlinkSync(CACHE_FILE); } catch {}
    return new Map();
  }
}

function saveCache(map) {
  const plain = {};
  for (const [file, changes] of map.entries()) {
    plain[file] = changes;
  }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(plain, null, 2));
}

module.exports = { loadCache, saveCache, CACHE_FILE };