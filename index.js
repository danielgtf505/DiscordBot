const Discord = require('discord.js');
const fs = require('fs');
const { prefix, token, OWNER_ID } = require('./config.json');
const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const db = require('./structures/db');
const Client = require('./structures/Client');
const client = new Client({
	commandPrefix: prefix,
	owner: OWNER_ID,
	invite: 'https://discord.gg/pakmSU',
});

client.registry
	.registerDefaultTypes()
	.registerGroups([
		['admin', 'Administration'],
		['audio', 'Audio'],
		['random', 'Random'],
		['utility', 'Utility'],
	])
	.registerDefaultGroups()
	.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.queue = new Map();

// Ready
client.once('ready', () => {
	db.GameRoles.sync();
	console.log('Ready!');
	client.user.setActivity('Rushia Boing Boing', {type : "WATCHING", name : "Rushia Boing Boing"});
});

client.on('message', message => {
	const hasText = Boolean(message.content);
	const hasImage = message.attachments.size !== 0;
	const hasEmbed = message.embeds.length !== 0;
	if (message.author.bot || (!hasText && !hasImage && !hasEmbed)) return;
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
				let aRole = await db.GameRoles.findOne({ where: { emoji: emoji } });
				
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
				let aRole = await db.GameRoles.findOne({ where: { emoji: emoji } });
				
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

// Errors
client.on('error', console.error);

client.on('commandError', (command, err) => client.logger.error(`[COMMAND:${command.name}]\n${err.stack}`));

client.login(token);

// Utils
function getKeyByValue(object, value) {
	return Object.keys(object).find(key => object[key] === value);
}