const { Command } = require('discord.js-commando');
const moment = require('moment');
const { MessageEmbed } = require("discord.js");
const { intToEmoji, mapToResult } = require("../../util/util")

const forceEndEmoji = "❌";
const infoPollEmoji = "❓";

module.exports = class PollCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'poll',
			aliases: [],
			group: 'utility',
			memberName: 'poll',
            description: 'Start a poll.',
            args: [
				{
					key: 'args',
					prompt: 'Poll options : \` <Question> ; <option 1> ; <options 2> ...; <timeout>\` (max 9 options)',
					type: 'string',
                }
			],
		});
    }
    
    async run(message, {args}) {
        moment.locale('en-gb'); 

        let array = args.split(";");

        if (array.length < 2 || array.length >= 11){
            return message.say(`Error in parameters.`);
        }

        let endDate = moment().add(5, 'hours').calendar();
        let question = array.shift();

        // Dictionnary containing "emoji - {option - vote }"
        let results = {};
        // Map containing {Voter : Option}
        let voterInfo = new Map();

        let optionText = '';   

        // Fill the result dictionnary and generate text for embededMessage
        let i = 1;
        array.forEach(element => {
            optionText += `${intToEmoji(i)} : \`${element.trim()}\`\n`;
            results[intToEmoji(i)] = {option: element.trim(), votes: 0};
            i++;
        })
        // Array containing used emojis
        let usedEmojis = Object.keys(results);
        usedEmojis.push(forceEndEmoji);
        usedEmojis.push(infoPollEmoji);

        let embededMessage = new MessageEmbed()
        .setTitle("Poll")
        .setAuthor(message.author.username)
        .setDescription(question)
        .addField("Options :", optionText)
        .addField("Controls : ", `${forceEndEmoji} to end poll`)
        .setColor("#85C1E9")
        .setFooter(`Ends ${endDate}`);  
        var poll = await message.channel.send(embededMessage);

        // Add reactions
        poll.react(forceEndEmoji);
        poll.react(infoPollEmoji);
        for (let j = 1; j<= array.length; j++){
            poll.react(intToEmoji(j));
        }


        // collector
        const filter = (reaction, user) => user.id !== message.client.user.id;
        var collector = poll.createReactionCollector(filter, {
            time: 18000000
        });

        collector.on("collect", (reaction, user) => {
            if (usedEmojis.includes(reaction.emoji.name)){
                if (reaction.emoji.name === forceEndEmoji && message.author.id === user.id) return collector.stop();

                if (reaction.emoji.name === infoPollEmoji){
                    console.log("Here " + infoPollEmoji);
                    let infoMessage = new MessageEmbed()
                    .setTitle("Poll")
                    .setAuthor(message.author.username)
                    .setDescription(question)
                    .addField("Results", mapToResult(voterInfo))
                    .setColor("#85C1E9")
                    .setTimestamp()
                    .setFooter(); // TODO Put endtime here 

                    message.channel.send(infoMessage);
                    return poll.reactions.resolve(infoPollEmoji).users.remove(user.id);
                }

                if (!voterInfo.has(user.id)) voterInfo.set(user.id, { emoji: reaction.emoji.name });

                const votedEmoji = voterInfo.get(user.id).emoji;
                if (votedEmoji !== reaction.emoji.name) {
                    const lastVote = poll.reactions.resolve(votedEmoji);
                    lastVote.count -= 1;
                    lastVote.users.remove(user.id);
                    results[votedEmoji].votes -= 1;
                    voterInfo.set(user.id, { emoji: reaction.emoji.name });
                }
                results[reaction.emoji.name].votes += 1;

            }
        });

        collector.on('dispose', (reaction, user) => {
            if (usedEmojis.includes(reaction.emoji.name)) {
                voterInfo.delete(user.id);
                results[reaction.emoji.name].votes -= 1;
            }
        });

        collector.on('end', () => {
            let text = '';
            for (const emoji in results) text += `\`${results[emoji].option}\` - ${results[emoji].votes}\n`;
            poll.delete();

            let resultEmbed = new MessageEmbed()
            .setTitle("Poll")
            .setAuthor(message.author.username)
            .setDescription(question)
            .addField("Result : ", text)
            .setColor("#85C1E9");

            message.channel.send(resultEmbed);
        });

    }
    
};