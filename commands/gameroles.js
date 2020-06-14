const Discord = require('discord.js');
const {GameRoles} = require('../index.js')

module.exports = {
	name: 'gameroles',
	description: 'Game Role using reactions',
	async execute(message, args) {
		
		message.channel.send("React to gain role & associated channels.");

		const embed = new Discord.MessageEmbed();
		embed.setTitle('Game Roles');
		embed.setColor('BLUE')

		const rolesList = await GameRoles.findAll();

		var desc = "";
		for (role of rolesList){
			desc += role.emoji + " : " + role.name + "\n";
		}
		

		embed.setDescription(desc);
		message.channel.send(embed).then(sentMessage =>{
			for (role of rolesList){
				sentMessage.react(role.emoji)
			}
		})

	},
};