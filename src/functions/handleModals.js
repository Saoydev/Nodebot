const fs = require('fs');

module.exports = (client) => {
    client.modals = new Map();
let allmodals = fs.readdirSync('./src/b_modals').filter(file => file.endsWith('.js'))
for(const file of allmodals) {
    let modal = require(`../b_modals/${file}`);
    client.modals.set(modal.id, modal);
    }
}