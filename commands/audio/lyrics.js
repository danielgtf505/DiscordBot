const { Command } = require('discord.js-commando');
const lyricsFinder = require("lyrics-finder");
const { MessageEmbed } = require("discord.js");

module.exports = class LyricsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'lyrics',
            aliases: [],
            group: 'audio',
            memberName: 'lyrics',
            description: 'Find the lyrics of the current song.',
            guildOnly: true,
        });
    }

    async run(message) {
        const queue = message.client.queue.get(message.guild.id);
        if (!queue) return message.channel.send("There is nothing playing.").catch(console.error);

        let lyrics = null;

        try {
            lyrics = await lyricsFinder(queue.songs[0].title, "");
        } catch (error) {
            lyrics = `No lyrics found for ${queue.songs[0].title}.`;
        }

        let lyricsEmbed = new MessageEmbed()
            .setTitle("Lyrics")
            .setDescription(lyrics)
            .setColor("#F8AA2A")
            .setTimestamp();

        if (lyricsEmbed.description.length >= 2048)
            lyricsEmbed.description = `${lyricsEmbed.description.substr(0, 2045)}...`;
        return message.channel.send(lyricsEmbed).catch(console.error);
    }
};