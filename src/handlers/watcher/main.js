const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const { loadCache, saveCache, CACHE_FILE } = require("./cache");
const { isMeaningfulChange } = require("./detector");
const { checkCodeErrors } = require("../utilities/error");

const WATCH_DIR = path.join(__dirname, "..", "..");
const watchedFiles = new Set();
const fileOldCode = new Map();
let batchedChanges = new Map();

function getChangedLines(oldCode, newCode) {
  const oldLines = oldCode.split("\n");
  const newLines = newCode.split("\n");
  const changes = [];

  for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
    const oldLine = oldLines[i] || "";
    const newLine = newLines[i] || "";
    if (oldLine !== newLine && isMeaningfulChange(newLine, oldLine)) {
      changes.push({ lineNum: i + 1, lineContent: newLine });
    }
  }

  return changes;
}

function watchFile(fullPath, client, channel) {
  if (watchedFiles.has(fullPath)) return;
  if (!fullPath.endsWith(".js") && !fullPath.endsWith(".ts")) return;

  try {
    const code = fs.readFileSync(fullPath, "utf8");
    fileOldCode.set(fullPath, code);
  } catch {
    return;
  }

  fs.watchFile(fullPath, { interval: 1500 }, async (curr, prev) => {
    if (curr.mtime <= prev.mtime) return;

    let newCode;
    try {
      newCode = fs.readFileSync(fullPath, "utf8");
    } catch {
      return;
    }

    const error = checkCodeErrors(newCode);
    if (error) {
      const relativePath = path.relative(WATCH_DIR, fullPath).replace(/\\/g, "/");
      const errorLineMatch = error.stack.match(/<anonymous>:(\d+):(\d+)/);
      const errorLineNum = errorLineMatch ? errorLineMatch[1] : "unknown";

      const msg = `# Error in file: ${relativePath}\n**${error.message}**\n\nError at line: ${errorLineNum}`;
      if (channel) {
        channel.send(msg).catch(console.error);
      }
      return;
    }

    const oldCode = fileOldCode.get(fullPath) || "";
    const changes = getChangedLines(oldCode, newCode);
    if (changes.length === 0) return;

    fileOldCode.set(fullPath, newCode);

    const relativePath = path.relative(WATCH_DIR, fullPath).replace(/\\/g, "/");
    if (!relativePath.startsWith("commands/advanced") && !relativePath.startsWith("commands/simple")) return;

    if (!batchedChanges.has(relativePath)) batchedChanges.set(relativePath, []);

    const fileChanges = batchedChanges.get(relativePath);
    for (const change of changes) {
      if (!fileChanges.some(c => c.lineNum === change.lineNum && c.lineContent === change.lineContent)) {
        fileChanges.push(change);
      }
    }

    saveCache(batchedChanges);
  });

  watchedFiles.add(fullPath);
}

function watchDirectory(dir, client, channel) {
  fs.readdir(dir, { withFileTypes: true }, (err, entries) => {
    if (err) return;

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) watchDirectory(fullPath, client, channel);
      else watchFile(fullPath, client, channel);
    }
  });

  fs.watch(dir, (eventType, filename) => {
    if (!filename) return;
    const fullPath = path.join(dir, filename);
    fs.stat(fullPath, (err, stats) => {
      if (err) return;
      stats.isDirectory() ? watchDirectory(fullPath, client, channel) : watchFile(fullPath, client, channel);
    });
  });
}

let sentNoChangeNotice = true;

async function startWatcher(client, channelId) {
  const channel = client.channels.cache.get(channelId);
  if (!channel) return console.error(`Channel with ID ${channelId} not found.`);

  batchedChanges = loadCache();

  if (batchedChanges.size === 0) {
    if (!sentNoChangeNotice) {
      sentNoChangeNotice = true;
      channel.send("✅ No significant code updates detected since last restart.").catch(console.error);
    }
  } else {
    for (const [file, changes] of batchedChanges.entries()) {
      const preview = changes
        .map(c => `\`[Line ${c.lineNum}]\` ${c.lineContent.trim().slice(0, 100)}`)
        .slice(0, 5)
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle("📁 Cached Changes Detected")
        .setColor("#ffb3d8")
        .setDescription(`**File:** \`${file}\`\n\n${preview}\n\n💾 _Changes loaded from cache_`)
        .setFooter({ text: "NodeBot Watcher" })
        .setTimestamp();

      channel.send({ embeds: [embed] }).catch(console.error);
    }
  }

  watchDirectory(WATCH_DIR, client, channel);
  console.log(`🔍 Watching all folders under: ${WATCH_DIR}`);
}


module.exports = { startWatcher };
