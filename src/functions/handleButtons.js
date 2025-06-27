const fs = require('fs');

module.exports = (client) => {
    client.buttons = new Map();

    let allbuttons = fs.readdirSync('./src/buttons').filter(file => file.endsWith('.js'));
    for(const file of allbuttons) {
        let button = require(`../buttons/${file}`);
        client.buttons.set(button.customId, button);
    }
}
