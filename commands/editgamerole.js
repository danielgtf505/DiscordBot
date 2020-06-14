const Discord = require('discord.js');
const {GameRoles} = require('../index.js')

const regexEmoji = /<:([a-zA-Z0-9]+):(\d+)>/

module.exports = {
	name: 'editgamerole',
	description: 'Add a Game Role for roleReaction',
	async execute(message, args) {
        
        const roleName = args[0];
        const roleEmoji = args[1];

        if (roleName == null || roleEmoji == null) {
            console.log('Error params missing');
            return message.reply('Error params missing');
        }
        
        var regex = roleEmoji.match(regexEmoji);
        if (regex){ // if emoji matchs customEmoji syntax, check if it's from the server
            console.log(regex[2]);
            if (!message.guild.emojis.cache.find(emoji => emoji.id === regex[2])){
                return message.reply('Error emoji is not from this server');
            }
        }

        const affectedRows = await GameRoles.update({ emoji: roleEmoji }, { where: { name: roleName } });
        if (!affectedRows){
            return message.reply(`Game role ${roleName} doesn't exists.`);
        } else {
            return message.reply(`Game role ${roleName} edited with emoji ${roleEmoji}.`);
        }
	},
};