module.exports = {
	name: 'coinflip',
	description: 'Coinflip!',
	execute(message, args) {
        let res = Math.round(Math.random());
		message.channel.send(res === 0 ? 'Tail' : 'Head');
	},
};