const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, token } = require('./config.json');
const Sequelize = require('sequelize');
const test = require('./util/reactroles')

client.login(token);
client.commands = new Discord.Collection();

// Load database
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

// Role data model
const GameRoles = sequelize.define('GameRoles', {
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
	emoji: Sequelize.STRING,
});
module.exports = { GameRoles }

// Load commands from commands folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// Ready
client.once('ready', () => {
	GameRoles.sync();
	console.log('Ready!');
});

// message
client.on('message', message => {
	if (!message.content.startsWith(prefix)) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();
	if (!client.commands.has(commandName)) {
		return;
	} else {		
		const command = client.commands.get(commandName);
		try {
			command.execute(message, args);
		} catch (error) {
			console.error(error);
			message.reply('there was an error trying to execute that command!');
		}
	}

});

// messageReactionAdd
client.on('messageReactionAdd', async (reaction, user) =>{
	if (user.bot)
		return;

	if (reaction.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await reaction.fetch();
		} catch (error) {
			console.log('Something went wrong when fetching the message: ', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}

	if (reaction.message.author.bot){
		if (reaction.message.embeds){
			const embedMsg = reaction.message.embeds.find(msg => msg.title === 'Game Roles');
			
			if (embedMsg){
				var emoji;
				
				if (reaction.emoji.id != null){
					emoji = "<:"+reaction.emoji.name+":"+reaction.emoji.id+">";
				} else {
					emoji = reaction.emoji.name;
				}

				console.log("Emoji clicked : " + emoji);
				var aRole = await GameRoles.findOne({ where: { emoji: emoji } });
				
				if (aRole){
					console.log("Role found : " + aRole.name);
					var role = reaction.message.guild.roles.cache.find(role => role.name.toLowerCase() === aRole.name.toLocaleLowerCase());
					var member = reaction.message.guild.members.cache.find(member => member.id === user.id);

					member.roles.add(role).then(member => {
						console.log("Added " + member.user.username + " from the " + role.name + " role.");
					}).catch(err => console.error);
				}
			}
		}
		return;
	}

});

// messageReactionRemove
client.on('messageReactionRemove', async (reaction, user) =>{
	if (user.bot)
		return;

	if (reaction.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await reaction.fetch();
		} catch (error) {
			console.log('Something went wrong when fetching the message: ', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}

	if (reaction.message.author.bot){

		if (reaction.message.embeds){
			const embedMsg = reaction.message.embeds.find(msg => msg.title === 'Game Roles');
			
			if (embedMsg){
				var emoji;

				if (reaction.emoji.id != null){
					emoji = "<:"+reaction.emoji.name+":"+reaction.emoji.id+">";
				} else {
					emoji = reaction.emoji.name;
				}

				console.log("Emoji clicked : " + emoji);
				var aRole = await GameRoles.findOne({ where: { emoji: emoji } });
				
				if (aRole){
					console.log("Role found : " + aRole.name);
					var role = reaction.message.guild.roles.cache.find(role => role.name.toLowerCase() === aRole.name.toLocaleLowerCase());
					var member = reaction.message.guild.members.cache.find(member => member.id === user.id);

					member.roles.remove(role).then(member => {
						console.log("Removed " + member.user.username + " from the " + role.name + " role.");
					}).catch(err => console.error);
				}
			}
		}
		return;
	}
});

// Utils

function getKeyByValue(object, value) {
	return Object.keys(object).find(key => object[key] === value);
}