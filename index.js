const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, token } = require('./config.json');
const Sequelize = require('sequelize');

const cooldowns = new Discord.Collection();

client.options.presence.activity = {type : "WATCHING", name : "Rushia Boing Boing"};
client.login(token);
client.commands = new Discord.Collection();
client.queue = new Map();

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
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.adminOnly){
		const member = message.mentions.members.first();
		if (member.roles.cache.some(role => role.name !== 'Bot Commander')){
			return message.reply('You are not a bot commander while executing an admin-only command.');
		}
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 1) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
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
				let emoji;
				
				if (reaction.emoji.id != null){
					emoji = "<:"+reaction.emoji.name+":"+reaction.emoji.id+">";
				} else {
					emoji = reaction.emoji.name;
				}

				console.log("Emoji clicked : " + emoji);
				let aRole = await GameRoles.findOne({ where: { emoji: emoji } });
				
				if (aRole){
					console.log("Role found : " + aRole.name);
					let role = reaction.message.guild.roles.cache.find(role => role.name.toLowerCase() === aRole.name.toLocaleLowerCase());
					let member = reaction.message.guild.members.cache.find(member => member.id === user.id);

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
				let emoji;

				if (reaction.emoji.id != null){
					emoji = "<:"+reaction.emoji.name+":"+reaction.emoji.id+">";
				} else {
					emoji = reaction.emoji.name;
				}

				console.log("Emoji clicked : " + emoji);
				let aRole = await GameRoles.findOne({ where: { emoji: emoji } });
				
				if (aRole){
					console.log("Role found : " + aRole.name);
					let role = reaction.message.guild.roles.cache.find(role => role.name.toLowerCase() === aRole.name.toLocaleLowerCase());
					let member = reaction.message.guild.members.cache.find(member => member.id === user.id);

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