const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, token } = require('./config.json');

client.login(token);

client.once('ready', () => {
	console.log('Ready!');
});

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on('message', message => {
	// For role reaction
	if (message.author.bot){
		if (message.embeds){
			const embedMsg = message.embeds.find(msg => msg.title === 'Server Roles');
			
			if (embedMsg){
				message.react('717040341118615695')
				.then(reaction => reaction.message.delete(2000))
				.then(msg => console.log("Deleted message"))
				.catch(err => console.error);
			}
		}
		return;
	}

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
			const embedMsg = reaction.message.embeds.find(msg => msg.title === 'Server Roles');
			
			if (embedMsg){
				var roleName = reaction.emoji.name;
				var role = reaction.message.guild.roles.cache.find(role => role.name.toLowerCase() === roleName.toLocaleLowerCase());
				var member = reaction.message.guild.members.cache.find(member => member.id === user.id);
			
				member.roles.add(role).then(member => {
					console.log("Added " + member.user.username + " from the " + role.name + " role.");
				}).catch(err => console.error);
			}
		}
		return;
	}

});

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
			const embedMsg = reaction.message.embeds.find(msg => msg.title === 'Server Roles');
			
			if (embedMsg){
				var roleName = reaction.emoji.name;
				var role = reaction.message.guild.roles.cache.find(role => role.name.toLowerCase() === roleName.toLocaleLowerCase());
				var member = reaction.message.guild.members.cache.find(member => member.id === user.id);
			
				member.roles.remove(role).then(member => {
					console.log("Removed " + member.user.username + " from the " + role.name + " role.");
				}).catch(err => console.error);
			}
		}
		return;
	}
});