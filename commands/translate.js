
var { translate } = require("google-translate-api-browser");

// TODO : check args
module.exports = {
    name: 'translate',
    description: 'Translate text',
    async execute(message, args) {

        let from = args[0];
        let to = args[1];
        args.splice(0, 2);

        let text = args.join(' ');

        translate(text, { from: from, to: to })
            .then(res => {
                message.reply(text + " > " + res.text)
            })
    },
};