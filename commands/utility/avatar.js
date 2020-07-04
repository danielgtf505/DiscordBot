const { Command } = require('discord.js-commando');

module.exports = class AvatarCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'avatar',
			aliases: [],
			group: 'utility',
			memberName: 'avatar',
			description: 'Return avatar.',
			clientPermissions: ['ATTACH_FILES'],
		});
    }
    
    run(message) {
		if (!message.mentions.users.size) {
			return message.say(`Your avatar: ${message.author.displayAvatarURL({ dynamic: true })}`);
		}

		const avatarList = message.mentions.users.map(user => {
			return `${user.username}'s avatar: ${user.displayAvatarURL({ dynamic: true })}`;
		});

		message.say(avatarList);
	}
};
