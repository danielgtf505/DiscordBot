const { Command } = require('discord.js-commando');
const { play } = require("../../include/play");
const { YOUTUBE_API_KEY } = require("../../config.json");
const ytdl = require("ytdl-core");
const YouTubeAPI = require("simple-youtube-api");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);

module.exports = class PlayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'play',
            aliases: ['p'],
            group: 'audio',
            memberName: 'play',
            description: 'Play a music from youtube',
			guildOnly: true,
			clientPermissions: ['CONNECT', 'SPEAK'],
			args: [
				{
					key: 'video',
					prompt: 'Youtube link or title',
					type: 'string',
                },
			],
        });
    }

    async run(message, {video}) {
		const { channel } = message.member.voice;

		// Remove embed when linking a youtube video
		message.suppressEmbeds(true);

		const serverQueue = message.client.queue.get(message.guild.id);
		if (serverQueue && channel !== message.guild.me.voice.channel)
			return message.reply(`You must be in the same channel as ${message.client.user}`).catch(console.error);
		
		if (!channel) return message.reply("You need to join a voice channel first!").catch(console.error);

		const videoPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
		const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
		const urlValid = videoPattern.test(video);

		// TODO : does it work with commando ?
		// Start the playlist if playlist url was provided
		// if (!videoPattern.test(video) && playlistPattern.test(video)) {
		// 	return message.client.commands.get("playlist").execute(message, args);
		// }

		const queueConstruct = {
			textChannel: message.channel,
			channel,
			connection: null,
			songs: [],
			loop: false,
			volume: 25,
			playing: true
		};

		let songInfo = null;
		let song = null;

		if (urlValid) {
			try {
				songInfo = await ytdl.getInfo(video);
				song = {
					title: songInfo.videoDetails.title,
					url: songInfo.videoDetails.video_url,
					duration: songInfo.videoDetails.lengthSeconds
				};
			} catch (error) {
				if (error.message.includes("copyright")) {
					return message
						.reply("??? The video could not be played due to copyright protection ???")
						.catch(console.error);
				} else {
					console.error(error);
					return message.reply(error.message).catch(console.error);
				}
			}
		} else {
			try {
				const results = await youtube.searchVideos(video, 1);
				songInfo = await ytdl.getInfo(results[0].url);
				song = {
					title: songInfo.videoDetails.title,
					url: songInfo.videoDetails.video_url,
					duration: songInfo.videoDetails.lengthSeconds
				};
			} catch (error) {
				console.error(error);
				return message.reply("No video was found with a matching title").catch(console.error);
			}
		}

		if (serverQueue) {
			serverQueue.songs.push(song);
			return serverQueue.textChannel
				.send(`??? **${song.title}** has been added to the queue by ${message.author}`)
				.catch(console.error);
		}

		queueConstruct.songs.push(song);
		message.client.queue.set(message.guild.id, queueConstruct);

		try {
			queueConstruct.connection = await channel.join();
			play(queueConstruct.songs[0], message);
		} catch (error) {
			console.error(`Could not join voice channel: ${error}`);
			message.client.queue.delete(message.guild.id);
			await channel.leave();
			return message.channel.send(`Could not join the channel: ${error}`).catch(console.error);
		}

    }

};