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

    getUserFromMention(mention) {
        // The id is the first and only match found by the RegEx.
        const matches = mention.match(/^<@!?(\d+)>$/);
    
        // If supplied variable was not a mention, matches will be null instead of an array.
        if (!matches) return;
    
        // However the first element in the matches array will be the entire mention, not just the ID,
        // so use index 1.
        const id = matches[1];
    
        return client.users.cache.get(id);
    }
};