const { REST } = require("@discordjs/rest");
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

const clientId = '1387981655167336558';
const guildId = '1313331197300179015';
const errorLogChannelId = '1389492618962010233';

module.exports = (client) => {
  client.handleCommands = async (commandFolders, path) => {
    client.commandArray = [];

    for (const folder of commandFolders) {
      if (!fs.lstatSync(`${path}/${folder}`).isDirectory()) continue;

      const commandFiles = fs.readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'));

      for (const file of commandFiles) {
        const command = require(`../commands/${folder}/${file}`);

        // Check if command.data exists and has a name property
        if (!command.data || !command.data.name) {
          console.warn(`Skipping command '${file}' because it has no 'data' or 'data.name' property.`);
          continue;
        }

        client.commands.set(command.data.name, command);
        client.commandArray.push(command.data.toJSON());
      }
    }

    const rest = new REST({ version: '9' }).setToken(process.env.token);

    (async () => {
      try {
        console.log('\x1b[38;2;255;179;216m%s\x1b[0m', 'Started refreshing application (/) commands.');

        await rest.put(
          Routes.applicationCommands(clientId),
          { body: client.commandArray }
        );

        console.log('\x1b[38;2;255;179;216m%s\x1b[0m', 'Successfully reloaded application (/) commands.');
      } catch (error) {
        console.error(error);

        try {
          const channel = await client.channels.fetch(errorLogChannelId);
          if (channel && channel.send) {
            await channel.send({
              embeds: [{
                title: '❌ Error Registering Slash Commands',
                description: `\`\`\`js\n${(error.stack || error.message || error).slice(0, 1900)}\n\`\`\``,
                color: 0xed4245,
                timestamp: new Date()
              }]
            });
          }
        } catch (channelErr) {
          console.error('Failed to send error to log channel:', channelErr);
        }
      }
    })();
  };
};
