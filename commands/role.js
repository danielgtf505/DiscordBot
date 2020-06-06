const Discord = require('discord.js');

module.exports = {
	name: 'role',
	description: 'Role using reactions',
	execute(message, args) {

		message.channel.send("React to gain role & associated channels.");

		const embed = new Discord.MessageEmbed();
		embed.setTitle('Game Roles');
		embed.setColor('BLUE')
		embed.setDescription("\:zero: CSGO \n" + 
			":one: LOL"
		);
		message.channel.send(embed);

	},
};