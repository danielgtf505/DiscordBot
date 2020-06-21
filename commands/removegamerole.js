const Discord = require('discord.js');
const {GameRoles} = require('../index.js')

module.exports = {
    name: 'removegamerole',
    aliases: ['rgr'],
    description: 'Remove a Game Role for roleReaction',
    args: true,
    usage:'<role> <emoji>',
    guildOnly: true,
    adminOnly: true,
	async execute(message, args) {
        
        const roleName = args[0];

        if (roleName == null) {
            console.log('Error params missing');
            return message.reply('Error params missing');
		}

        const rowCount = await GameRoles.destroy({ where: { name: roleName } });
        if (!rowCount){
            return message.reply(`Game role ${roleName} doesn't exists.`);
        } else {
            return message.reply(`Game role ${roleName} removed.`);
        }
	},
};