const Discord = require('discord.js');
const {GameRoles} = require('../index.js')
const path = require('path');
const fs = require('fs');
const { OpusEncoder } = require('@discordjs/opus');

module.exports = {
	name: 'soundboard',
	aliases: ['sb'],
	description: 'Play a sound',
	async execute(message, args) {

		let sound = genPath(args);
		if (message.member.voice.channel) {
			
			message.member.voice.channel.join().then(connection =>{

				let file = path.join.apply(null, sound);
				const dispatcher = connection.play(file);
				dispatcher.on('start', () => {
					console.log(`Playing ${file}.`);
				});
	
				dispatcher.on('finish', () => {
					console.log(`Finished playing ${file}.`);
					dispatcher.destroy();
					message.member.voice.channel.leave();
				});
	
				dispatcher.on('error', console.error);
			})
		}

	},
};

function genPath(args){
	let pathAudio = [ __dirname, '..', 'resources', 'audio'];

	if (args[0] != null){
		pathAudio.push(args[0]);
		console.log("1 :  "+ path.join.apply(null, pathAudio))

		if (fs.existsSync(path.join.apply(null, pathAudio))){
			
			fs.readdir(path.join.apply(null, pathAudio), (err, files) => {
				let i = 0;
				if (isNaN(args[1])){ // random
					i = Math.floor(Math.random() * files.length);
					console.log("Random file : "+ path.join.apply(null, pathAudio))
	
				} else {
					if (args[1] > files.length){
						console.log(`Args 1 ${args[1]} is bigger than file count, taking first.`)
					} else {
						i = args[1];
					}
				}
				pathAudio.push(files[i]);
				console.log(`Reading ${files[i]}.`);
			});
			
		} else {
			return message.reply(`Arg ${args[0]} doesn't exists.`);
		}
	} else {
		fs.readdir(path.join.apply(null, pathAudio), (err, files) => {
			pathAudio.push(files[Math.floor(Math.random() * files.length)]);

			fs.readdir(path.join.apply(null, pathAudio), (err, files) => {
				pathAudio.push(files[Math.floor(Math.random() * files.length)]);
			});
		});
	}

	return pathAudio;

}