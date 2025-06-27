const mongoose = require('mongoose');
const mongodbURL = process.env.MONGOURL
const { ActivityType } = require('discord.js')

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        if (!mongodbURL) return;

        await mongoose.connect(mongodbURL || '', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        if(mongoose.connect) {
            console.log(`Connected to mongoose.`)
        } else {
            console.log(`Failed to connect to mongoose.`)
        }
        
        console.log(`Ready!`);
    },
};