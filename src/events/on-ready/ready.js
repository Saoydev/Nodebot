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

        const frames = ['-', '\\', '|', '/'];
        let i = 0;
        const interval = setInterval(() => {
            process.stdout.write(`\r\x1b[38;2;255;166;216mLoading\x1b[0m ${frames[i++ % frames.length]}`);
        }, 200);

        setTimeout(() => {
            clearInterval(interval);
            console.log('\n\x1b[1m\x1b[38;2;255;102;153m  _   _           _     ____        _     \x1b[0m');
            console.log('\x1b[1m\x1b[38;2;255;115;166m  | \\ | | ___   __| | __| __ )  ___ | |_  \x1b[0m');
            console.log('\x1b[1m\x1b[38;2;255;128;179m  |  \\| |/ _ \\ / _` |/ _ \\  _ \\ / _ \\| __| \x1b[0m');
            console.log('\x1b[1m\x1b[38;2;255;141;192m  | |\\  | (_) | (_| |  __/ |_) | (_) | |_  \x1b[0m');
            console.log('\x1b[1m\x1b[38;2;255;153;204m  |_| \\_|\\___/ \\__,_|\\___|____/ \\___/ \\__| \x1b[0m\n');
            console.log('\x1b[1m\x1b[38;2;255;166;216m  Hello, saoydev  \x1b[0m\n');
        }, 2000);
    },
};

