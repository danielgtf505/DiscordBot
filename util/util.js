const { LOG_CHANNEL_ID } = require("../config.json");

module.exports = {
    /**
     * Check if member is in the same channel as the bot
     * @param {*} member 
     */
    canModifyQueue(member) {
        const { channel } = member.voice;
        const botChannel = member.guild.me.voice.channel;

        if (channel !== botChannel) {
            member.send("You need to join the voice channel first!").catch(console.error);
            return false;
        }

        return true;
    },

    log(message, logMessage) {
        if (!isNaN(LOG_CHANNEL_ID)){            
            const channel = message.client.channels.cache.get(LOG_CHANNEL_ID);
            channel.send(`${logMessage}`);
        }
        console.log(logMessage);
    }
};