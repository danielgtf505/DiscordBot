const Discord = require('discord.js');
const {GameRoles} = require('../index.js')

const regexEmoji = /<:([a-zA-Z0-9]+):(\d+)>/

module.exports = {
    name: 'addgamerole',
    aliases: ['agr'],
    description: 'Add a Game Role for roleReaction',
    args: true,
    usage:'<role> <emoji>',
    guildOnly: true,
    adminOnly: true,
	async execute(message, args) {
        
        const roleName = args[0];
        const roleEmoji = args[1];

        if (roleName == null || roleEmoji == null) {
            console.log('Error params missing');
            return message.reply('Error params missing');
        }
        
        let regex = roleEmoji.match(regexEmoji);
        if (regex){ // if emoji matchs customEmoji syntax, check if it's from the server
            console.log(regex[2]);
            if (!message.guild.emojis.cache.find(emoji => emoji.id === regex[2])){
                return message.reply('Error emoji is not from this server');
            }
        }

		try {

            let roleExists = message.guild.roles.cache.find(role => role.name.toLowerCase() === roleName.toLocaleLowerCase());
            if (roleExists){
                const role = await GameRoles.create({
                    name: roleName,
                    emoji: roleEmoji,
                });
                return message.reply(`Game role ${role.name} added.`);
            } else {
                return message.reply(`Game role ${roleName} doesn't exists.`);
            }

        }
        catch (e) {
            console.log(e);
            if (e.name === 'SequelizeUniqueConstraintError') {
                return message.reply('That game role already exists.');
            }
            return message.reply('Something went wrong with adding a game role.');
        }

	},
};