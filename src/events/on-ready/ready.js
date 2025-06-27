const mongoose = require('mongoose');
const mongodbURL = process.env.MONGOURL;
const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        if (!mongodbURL) return;

        await mongoose.connect(mongodbURL || '', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            console.log('\x1b[38;2;255;255;255m%s\x1b[0m', `Connected to mongoose.`);
        }).catch(err => {
            console.log('\x1b[38;2;255;255;255m%s\x1b[0m', `Failed to connect to mongoose: ${err}`);
        });

        let i = 0;
        const frames = ['\\', '|', '/', '-'];
        const interval = setInterval(() => {
            process.stdout.write(`\x1b[38;2;255;255;255mLoading\x1b[0m ${frames[i++ % frames.length]}`);
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            console.log('\n\x1b[1m\x1b[38;2;255;179;216m  _   _           _     ____        _     \x1b[0m');
            console.log('\x1b[1m\x1b[38;2;255;179;216m  | \\ | | ___   __| | __| __ )  ___ | |_  \x1b[0m');
            console.log('\x1b[1m\x1b[38;2;255;179;216m  |  \\| |/ _ \\ / _` |/ _ \\  _ \\ / _ \\| __| \x1b[0m');
            console.log('\x1b[1m\x1b[38;2;255;179;216m  | |\\  | (_) | (_| |  __/ |_) | (_) | |_  \x1b[0m');
            console.log('\x1b[1m\x1b[38;2;255;179;216m  |_| \\_|\\___/ \\__,_|\\___|____/ \\___/ \\__| \x1b[0m\n');
            console.log('\x1b[1m\x1b[38;2;255;179;216m  Welcome to Nodebot  \x1b[0m\n');
        }, 2000);
    },
};

