const { OWNER_ID } = require('../config.json');

module.exports = {
	name: 'restart',
	description: 'Restart bot',
	async execute(message) {
		if (message.author.id === OWNER_ID){
            message.reply(`Restarting ...`);
            await sleep(1000);
            process.exit();
        } else {
            message.reply(`You are not owner of the bot.`);
        }
	},
};