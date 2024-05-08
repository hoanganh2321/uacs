const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { ButtonStyle } = require('discord.js');
const path = require('path');
const fs = require('fs');


async function askQuestion(message, question, callback) {
  const questionEmbed = new EmbedBuilder()
    .setColor('#0099ff')
    .setAuthor({
      name: 'Embed Message',
      iconURL: 'https://cdn.discordapp.com/attachments/1213421081226903552/1213422313035407360/8218-alert.gif',
      url: 'https://discord.gg/FUEHs7RCqz'
    })
    .setDescription(question)
    

  const questionMessage = await message.reply({ embeds: [questionEmbed] }); // Define questionMessage here

  const filter = (response) => response.author.id === message.author.id;
  const collector = message.channel.createMessageCollector({ filter, time: 60000 });

  collector.on('collect', async (response) => {
    const userResponse = response.content;
    await response.delete();
    collector.stop();

    callback(userResponse);

    await questionMessage.delete();
  });

  collector.on('end', (collected, reason) => {
    if (reason === 'time') {
      message.reply('You took too long to answer. Announcement canceled.');
    }
  });
}

module.exports = {
  name: 'announce',
  description: 'Send an announcement to the specified channel (Mods Only)',
  async execute(message, args) {
    if (!message.guild) {
      return message.reply('This command can only be used in a server (guild).');
    }


    const embed = new EmbedBuilder().setColor('#0099ff');

   
    const dataPath = path.join(__dirname, '../data/announcementChannels.json');
    let serverData = {};

    try {
      serverData = require(dataPath);
    } catch (err) {
      console.error('Error reading server data:', err);
      return message.reply('An error occurred while reading server data. Please try again later.');
    }

    const channelId = serverData[message.guild.id];

    if (!channelId) {
      return message.reply('The announcement channel has not been set.');
    }

    const channel = message.guild.channels.cache.get(channelId);

    if (!channel) {
      return message.reply('The announcement channel was not found.');
    }

  
    askQuestion(message, '**1. Enter title for your announcement:**', (title) => {
      embed.setTitle(title);

      askQuestion(message, '**2. Specify the color for the embed: \n\n **Examples :**\n#FFFF00 -💛\n#FF0000 -❤️\n#00FF00 -💚\n#0000FF -💙\n#FF00FF -💜\n#FFFFFF -🤍**', (color) => {
        if (!color.startsWith('#')) {
          return message.reply('- Color is Must Required!\n- Please use the command Again.. ');
        }
        embed.setColor(color);


        askQuestion(message, '**3. Write Description of Message:**', (description) => {
          embed.setDescription(description);

      
          askQuestion(message, '**4. Do you have an image URL for the announcement:**\n➡️ Type skip for next.', (imageUrl) => {
            if (imageUrl.toLowerCase() !== 'skip') {
              embed.setImage(imageUrl);
            }

   
            askQuestion(message, '**5. Mention a role to notify:**\n➡️ Type skip for next.', (roleMention) => {
              if (roleMention.toLowerCase() !== 'skip') {
                const role = message.guild.roles.cache.find((r) => r.name === roleMention);
                if (role) {
                  embed.addFields({ name: 'Role Mention', value: `<@&${role.id}>` });
                } else {
                  message.reply('Role not found. Mention skipped.');
                }
              }
              
              embed.setTimestamp();

              const embed1 = new EmbedBuilder()
                .setAuthor({
                  name: 'Confirm your Announcement',
                  iconURL: 'https://cdn.discordapp.com/attachments/1213421081226903552/1213431548846800916/5331-fingerprint-loadingicon.gif?',
                  url: 'https://discord.gg/FUEHs7RCqz'
                })
                .setColor('#FFFF00')
              .setDescription('**- Are you sure you want to send this announcement?**');

              const confirm = new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Confirm ')
                .setStyle(ButtonStyle.Primary);

              const cancel = new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger);

              const confirmationRow = new ActionRowBuilder()
                .addComponents(cancel, confirm);

              message.reply({
                embeds: [embed1],
                components: [confirmationRow],
              });

             
              const buttonFilter = (interaction) => interaction.customId === 'confirm' || interaction.customId === 'cancel';

             
              const buttonCollector = message.channel.createMessageComponentCollector({
                filter: buttonFilter,
                time: 60000, 
              });
              const announcementSentEmbed = new EmbedBuilder()
              .setColor('#00FF00')
                .setAuthor({
                  name: 'Message Update',
                  iconURL: 'https://cdn.discordapp.com/attachments/1213421081226903552/1213430944007061574/6943_Verified.gif',
                  url: 'https://discord.gg/FUEHs7RCqz'
                })
              .setDescription('- **Your Embed message sent Sucessfully!**');

              const announcementCancelEmbed = new EmbedBuilder()
              .setColor('#FF0000')
                .setAuthor({
                  name: 'Message Update',
                  iconURL: 'https://cdn.discordapp.com/attachments/1213421081226903552/1213435934771642398/6352-cancel.png',
                  url: 'https://discord.gg/FUEHs7RCqz'
                })
              .setDescription('- **Your Embed message cancelled!**');

              buttonCollector.on('collect', async (interaction) => {
                if (interaction.customId === 'confirm') {
                 
                  await channel.send({ embeds: [embed] });
                  message.reply({ embeds: [announcementSentEmbed] });
                } else if (interaction.customId === 'cancel') {
                  message.reply({ embeds: [announcementCancelEmbed] });
                }

              
                interaction.deferUpdate();
              });

              buttonCollector.on('end', (collected, reason) => {
                if (reason === 'time') {
                 
                }
              });
            });
          });
        });
      });
    });
  },
};
