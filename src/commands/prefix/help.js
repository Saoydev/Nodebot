const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "help",
  argsRequired: false,
  cooldown: "5s",
  async execute(client, message, text) {
    const embed = new EmbedBuilder()
      .setColor("#ff66aa")
      .setTitle("📂nodebot.lua")
      .setDescription(
`NodeBot is a simple Lua-style bot made for Roblox developers who want to link their games with Discord.  
Here’s a basic setup guide and some links to get you started:

\`\`\`lua
-- nodebot configuration

prefix = "n!"

commands = {}
commands.talk = "send roblox message to discord"
commands.status = "check if nodebot is online"
commands.config = "change your project settings"
commands.setup = "start discord ↔ dashboard connection"

-- links
website   = "https://your-site.com"
docs      = "https://your-site.com/docs"
dashboard = "https://your-site.com/dashboard"
support   = "https://discord.gg/your-invite"
\`\`\``
      )
      .setFooter({ text: "NodeBot • Roblox Developer Toolkit" })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel("View Dashboard")
          .setStyle("Link")
          .setURL(`https://ronode.vercel.app/dashboard/${message.guild.id}`)
      );

    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await message.reply({ embeds: [embed], components: [row] });
    } else {
      await message.reply({ embeds: [embed] });
    }
  },
};

