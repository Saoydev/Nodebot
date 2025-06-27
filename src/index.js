const { Client, GatewayIntentBits, Collection, ChannelType, ActionRowBuilder, AuditLogOptionsType, Events, ButtonBuilder, Partials, ActivityType, EmbedBuilder, AuditLogEvent, messageLink, lazy, PermissionFlagsBits, PermissionsBitField, ButtonStyle } = require(`discord.js`);
const fs = require('fs');

const client = new Client({ 
    intents: [Object.keys(GatewayIntentBits)],
    partials: [Object.keys(Partials)]
    }); 

client.commands = new Collection();
client.premium = new Collection();

require('dotenv').config();

const process = require('node:process');
const interactionCreate = require('./events/commandEvents/interactionCreate');

client.on(Events.ClientReady, () => {
    setInterval(function () {
        client.user.setActivity(
            `Nodebot | ${client.guilds.cache.size} Servers 🌷`,
            { type: ActivityType.Custom }
        );
    }, 5000);
});

// Cooldown set per channel (can also be per user if needed)
const cooldowns = new Map();
const COOLDOWN_TIME = 10 * 1000;

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    // Prevent replies in announcement/news channels
    if (message.channel.type === ChannelType.GuildAnnouncement) return;

    if (message.mentions.has(client.user)) {
        const channelId = message.channel.id;
        const now = Date.now();

        const lastUsed = cooldowns.get(channelId);
        if (lastUsed && now - lastUsed < COOLDOWN_TIME) return;

        cooldowns.set(channelId, now);

await message.reply({
  embeds: [
    {
      title: "Nodebot: Roblox Integration",
      description: `Nodebot now supports **Roblox chat integration**, allowing messages from your Roblox game to appear directly in your Discord server.

**QUICK SETUP:**
1. Run \`/robloxsetup\` to link a channel.
2. Paste the provided Lua script in \`ServerScriptService\`.
3. Enable HTTP Requests in Game Settings.

**FEATURES:**
- Live in-game chat relayed to Discord.
- Easy setup, perfect for community games.

🔧 Need help? [Support Server](https://discord.gg/kYkB6JWKE4)

More integrations coming soon!`,
      color: 0xffb3d8,
      footer: {
        text: `Nodebot • Roblox to Discord Made Simple`,
        icon_url: client.user.displayAvatarURL(),
      },
      timestamp: new Date(),
    },
  ],
});


    }
});

const express = require('express');
const mongoose = require('mongoose');
const app = express();

const Integration = require('./Schemas/Integration');

app.use(express.json());

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const path = require('path');

const bannedWordsPath = path.join(__dirname, 'bannedWords.json');
const bannedWords = JSON.parse(fs.readFileSync(bannedWordsPath, 'utf8'));

function normalizeText(text) {
  return text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function filterBadWords(input) {
  const normalizedInput = normalizeText(input);
  const pattern = bannedWords
    .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').toLowerCase())
    .join('|');

  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

  return input.replace(regex, match => '#'.repeat(match.length));
}


app.post('/roblox/:token', async (req, res) => {
  const { token } = req.params;
  const { username, message } = req.body;

  const data = await Integration.findOne({ token });
  if (!data) return res.status(403).json({ error: 'Invalid token' });
  if (!data.enabled) return res.status(403).send('Integration disabled');

  // Fetch Discord channel
  const channel = await client.channels.fetch(data.channelId).catch(() => null);
  if (!channel) return res.status(404).send('Discord channel not found');

  // Fetch Roblox userId from username
  let robloxUserId = null;
  try {
    const response = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [username] })
    });

    const robloxData = await response.json();
    if (robloxData.data && robloxData.data[0] && robloxData.data[0].id) {
      robloxUserId = robloxData.data[0].id;
    }
  } catch (err) {
    console.warn('Failed to get Roblox userId:', err);
  }

  // Filter the message text
  const cleanMessage = filterBadWords(message);

  await channel.send({
    content: `\`\`\`${username} said: ${cleanMessage}\`\`\``
  });

  res.status(200).send('Message sent');
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`\x1b[38;2;255;183;216m\x1b[1mServer running on port ${PORT}\x1b[0m`));


process.on('unhandledRejection', async (reason, promise) => {
    console.log('\x1b[31mUnhandled Rejection at:\x1b[0m', reason, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.log('\x1b[31mUnhandled Exception:\x1b[0m', err);
});
process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log('\x1b[31mUnhandled Exception Monitor: \x1b[0m', err, origin);
});

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events");
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    } 
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    client.login(process.env.token)
})();