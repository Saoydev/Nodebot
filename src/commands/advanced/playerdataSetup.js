const { SlashCommandBuilder } = require('discord.js');
const Integration = require('../../Schemas/Integration');
const { v4: uuidv4 } = require('uuid');

const testers = ["958904398636011540"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playerdatasetup')
    .setDescription('Setup Roblox integration for player data with custom expressions')
    .addBooleanOption(option =>
      option.setName('enabled')
        .setDescription('Enable or disable the player data integration')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('playerdatafields')
        .setDescription('JSON string of fields, e.g. {"coins":"0","rank":"Bronze"}')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel where data-related logs will appear')
        .setRequired(false)),
  
  async execute(interaction) {
    if (!testers.includes(interaction.user.id)) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    const guildId = interaction.guild.id;
    const channel = interaction.options.getChannel('channel');
    const enabled = interaction.options.getBoolean('enabled');
    const fieldInput = interaction.options.getString('playerdatafields');

    let parsedFields;
    try {
      parsedFields = JSON.parse(fieldInput);
      if (typeof parsedFields !== 'object' || Array.isArray(parsedFields)) {
        return interaction.reply({ content: '❌ Invalid field format. Use a valid JSON object.', ephemeral: true });
      }
    } catch (err) {
      return interaction.reply({ content: '❌ Failed to parse player data fields. Ensure it\'s valid JSON.', ephemeral: true });
    }


    let data = await Integration.findOne({ guildId });
    if (data) {
      data.channelId = channel?.id || null;
      data.enabled = enabled;
      data.playerDataFields = parsedFields;
    } else {
      const token = uuidv4();
      data = new Integration({
        guildId,
        channelId: channel?.id || null,
        token,
        enabled,
        playerDataFields: parsedFields
      });
    }
    await data.save();

    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const playerDataEndpoint = `${apiBaseUrl}/api/playerdata`;


    const luaFields = Object.entries(parsedFields)
      .map(([key, value]) => {

        if (typeof value === 'string' && !value.match(/^\d+(\.\d+)?$/)) {
          return `${key} = "${value}"`;
        }
        return `${key} = ${value}`;
      })
      .join(',\n    ');

    const luaScript = `
local HttpService = game:GetService("HttpService")
local apiUrl = "${playerDataEndpoint}"
local token = "${data.token}"

game.Players.PlayerAdded:Connect(function(player)
  local data = {
    token = token,
    username = player.Name,
    data = {
      ${luaFields}
    }
  }

  local payload = HttpService:JSONEncode(data)
  pcall(function()
    HttpService:PostAsync(apiUrl, payload, Enum.HttpContentType.ApplicationJson)
  end)
end)
`.trim();

    const description = enabled
      ? `✅ The player data integration is **enabled**.

⚠️ **WARNING:** Please only edit your player data fields through this bot command.  
**Do NOT** change them directly in your Roblox game scripts, as this can cause conflicts and data issues.

## **Player Data Script**
\`\`\`lua
${luaScript}
\`\`\`

📌 **Setup Instructions:**
1. Open Roblox Studio and load your game.
2. Insert a Script into \`ServerScriptService\`.
3. Paste the code above.
4. Go to \`Game Settings > Security\` and enable **HTTP Requests**.
5. Test in Play Mode to confirm the data is being sent.`
      : '🛑 The integration is currently **disabled**. Run this command again with "enabled: true" to activate it.';

    await interaction.reply({ content: description, ephemeral: true });
  }
};
