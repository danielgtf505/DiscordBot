module.exports = {
	name: 'coinflip',
	description: 'coinflip!',
	execute(message, args) {
        var res = Math.round(Math.random());
		message.channel.send(res === 0 ? 'Tail' : 'Head');
	},
};