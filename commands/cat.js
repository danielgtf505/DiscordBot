
const fetch = require('node-fetch');

module.exports = {
	name: 'cat',
	description: 'Show a random cat picture',
	async execute(message) {
		const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
	    message.channel.send(file);
	},
};