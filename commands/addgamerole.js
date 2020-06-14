const Discord = require('discord.js');
const {GameRoles} = require('../index.js')

module.exports = {
	name: 'addgamerole',
	description: 'Add a Game Role for roleReaction',
	async execute(message, args) {
        
        const roleName = args[0];
        const roleEmoji = args[1];

        if (roleName == null || roleEmoji == null) {
            console.log('Error params missing');
            return message.reply('Error params missing');
		}

		try {

            var roleExists = message.guild.roles.cache.find(role => role.name.toLowerCase() === roleName.toLocaleLowerCase());
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