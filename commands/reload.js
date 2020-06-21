module.exports = {
	name: 'reload',
    description: 'Reloads a command',
    guildOnly: true,
    adminOnly: true,
	execute(message, args) {
        if (!args.length) return message.channel.send(`You didn't pass any command to reload, ${message.author}!`);
        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName)
            || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        
        if (!command) return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}!`);
	},
};