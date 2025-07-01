const { ActionRowBuilder } = require("@discordjs/builders");
const { ButtonBuilder } = require("@discordjs/builders");
const { Interaction, EmbedBuilder, Collection, ButtonStyle } = require("discord.js");
const Embed = require("embed/lib/embed");
const premium = '../../index.js';

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

if (command.premium === true) {
  console.log('Checking premium for user:', interaction.user.id);
  console.log('Premium users loaded:', [...client.premium.keys()]);

  if (!client.premium.has(interaction.user.id)) {
    console.log(`[Premium Check] User ${interaction.user.tag} tried to use premium command "${interaction.commandName}.js" without premium.`);
    return interaction.reply({
      content: '❌ You do not have access to this command. Please buy premium to use it.',
      ephemeral: true
    });
  }
}

        
        try{
            await command.execute(interaction, client);
        } catch (error) {
            console.log(`There was an error using command "/${interaction.commandName}":\n${error.stack}`);

            if (!interaction.deferred && !interaction.replied) {
                await interaction.reply({
                    content: 'There was an error while executing this command! Try again later.', 
                    ephemeral: true
                }).catch(err => { return });
            }
        }  
    }
    // buttons
    
        if (interaction.isButton()) {
            const button = client.buttons.get(interaction.customId);

            if (!button) return;

            try {
                button.execute(interaction, client)
            } catch (error) {
                console.log(error)
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.reply({
                        content: 'There was an error while executing this button! Try again later.', 
                        ephemeral: true
                    }).catch(err => {return});
                }
            }
        }

    // select menus
        if (interaction.isAnySelectMenu()) {
            const menu = client.Menus.get(interaction.customId);

            if (!menu) return;

            try {
                menu.execute(interaction, client)
            } catch (error) {
                console.log(error)
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.reply({
                        content: 'There was an error while executing this menu! Try again later.', 
                        ephemeral: true
                    }).catch(err => { return; });
                }
            }
        }

    // modal
        if (interaction.isModalSubmit()) {
            const modal = client.modals.get(interaction.customId);

            if (!modal) return;

            try {
                modal.execute(interaction, client)
            } catch (error) {
                console.log(error)
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.reply({
                        content: 'There was an error while executing this modal! Try again later.', 
                        ephemeral: true
                    }).catch(err => { return; });
                }
            }
        }
}}

