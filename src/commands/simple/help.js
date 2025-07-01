const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Provides information about available commands'),
    premium: true,
  async execute(interaction) {
    await interaction.reply({ content: `hi` })
  },
};

