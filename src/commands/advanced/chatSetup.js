const { SlashCommandBuilder } = require('discord.js');
const Integration = require('../../Schemas/Integration');
const { v4: uuidv4 } = require('uuid');

const testers = ["958904398636011540"]

module.exports = {
  data: new SlashCommandBuilder()
    .setName('chatsetup')
    .setDescription('Setup Roblox chat integration')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel where Roblox chat messages will appear')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('enabled')
        .setDescription('Enable or disable the integration')
        .setRequired(true)),

  async execute(interaction) {
    if (!testers.includes(interaction.user.id)) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    const guildId = interaction.guild.id;
    const channel = interaction.options.getChannel('channel');
    const enabled = interaction.options.getBoolean('enabled');

    // Find or create integration for this guild
    let data = await Integration.findOne({ guildId });

    if (data) {
      data.channelId = channel.id;
      data.enabled = enabled;
    } else {
      const token = uuidv4();
      data = new Integration({
        guildId,
        channelId: channel.id,
        token,
        enabled
      });
    }

    await data.save();

    // Your API base URL, adjust if not local
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    const apiUrl = `${apiBaseUrl}/api/chat`;

    const description = enabled
      ? `✅ The integration is **enabled**.

**Paste this into your Roblox game script:**

\`\`\`lua
local HttpService = game:GetService("HttpService")
local apiUrl = "${apiUrl}" -- Your API endpoint
local token = "${data.token}" -- Your integration token

game.Players.PlayerAdded:Connect(function(player)
  player.Chatted:Connect(function(message)
    local data = HttpService:JSONEncode({
      token = token,
      username = player.Name,
      message = message
    })
    local success, err = pcall(function()
      HttpService:PostAsync(apiUrl, data, Enum.HttpContentType.ApplicationJson)
    end)
    if not success then
      warn("Failed to send chat:", err)
    end
  end)
end)
\`\`\`

📌 **Setup Instructions:**
1. Open Roblox Studio and load your game.
2. Insert a Script into \`ServerScriptService\`.
3. Paste the code above into that Script.
4. Go to \`Game Settings > Security\` and enable **HTTP Requests**.
5. Test in Play Mode by chatting as a player.
`
      : '🛑 The integration is currently **disabled**. Run this command again with "enabled: true" to activate it.';

    await interaction.reply({ content: description, ephemeral: true });
  }
};
