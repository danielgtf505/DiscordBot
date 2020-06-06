const Discord = require('discord.js');

module.exports = {
	name: 'role',
	description: 'Role using reactions',
	execute(message, args) {

		const embed = new Discord.MessageEmbed();
		embed.setTitle('Server Roles');
		embed.setColor('BLUE')
		embed.setDescription("\:zero: Test");
		message.channel.send(embed);

	},
};