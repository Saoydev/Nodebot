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

// notify when the bot is online and running
client.on(Events.ClientReady, () => {
  setInterval(function () {
    client.user.setActivity(
      `Nodebot | ${client.guilds.cache.size} Servers 🌷`,
      { type: ActivityType.Custom }
    );
  }, 5000);
});

const cooldowns = new Map();
const COOLDOWN_TIME = 10 * 1000;


// Reply to bot pings
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

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

module.exports = client;
require('./APIs/setup/main');
