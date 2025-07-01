const { Client, GatewayIntentBits, Collection, ChannelType, ActionRowBuilder, AuditLogOptionsType, Events, ButtonBuilder, Partials, ActivityType, EmbedBuilder, AuditLogEvent, messageLink, lazy, PermissionFlagsBits, PermissionsBitField, ButtonStyle } = require(`discord.js`);
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: Object.keys(GatewayIntentBits),
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();
client.premium = new Collection();

const premiumPath = path.join(__dirname, 'premiumUsers.json');

try {
  const rawData = fs.readFileSync(premiumPath, 'utf-8');
  const premiumUsers = JSON.parse(rawData);

  if (Array.isArray(premiumUsers)) {
    premiumUsers.forEach(id => client.premium.set(id, true));
    console.log('Premium users loaded:', [...client.premium.keys()]);
  } else {
    console.warn('premiumUsers.json does not contain an array.');
  }
} catch (error) {
  console.error('Failed to load premiumUsers.json:', error);
}

const TARGET_MESSAGE_ID = '1389595195217023016';  // target message ID
const PREMIUM_ROLE_ID = '1388687595306877038';   // premium role ID
const TARGET_EMOJI = '👑';

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) {
    console.log(`Ignored reaction from bot user: ${user.tag}`);
    return;
  }

  if (reaction.message.id !== TARGET_MESSAGE_ID) {
    console.log(`Ignored reaction on unrelated message ID: ${reaction.message.id}`);
    return;
  }

  const emojiMatch = reaction.emoji.id
    ? reaction.emoji.id === TARGET_EMOJI
    : reaction.emoji.name === TARGET_EMOJI;

  if (!emojiMatch) {
    console.log(`Ignored reaction with different emoji: ${reaction.emoji.name || reaction.emoji.id}`);
    return;
  }

  const guild = reaction.message.guild;
  if (!guild) {
    console.log('Guild not found for the reaction message');
    return;
  }

  try {
    const member = await guild.members.fetch(user.id);

    if (client.premium.has(user.id)) {
      if (!member.roles.cache.has(PREMIUM_ROLE_ID)) {
        await member.roles.add(PREMIUM_ROLE_ID);
        console.log(`Role added to ${user.tag}`);
      } else {
        console.log(`User ${user.tag} already has the premium role`);
      }
    } else {
      await reaction.users.remove(user.id);
      console.log(`Reaction removed from ${user.tag} (not premium)`);
    }
  } catch (error) {
    console.error('Error handling reaction add:', error);
  }
});

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

  const mention = message.mentions.has(client.user);
  const everyoneMention = message.mentions.everyone;
  const hereMention = message.mentions.roles.has(client.application.id);

  if (mention && !everyoneMention && !hereMention) {
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
