// ./src/APIs/endpoints/chat.js
const schema = require('../../Schemas/Integration');
const { filterBadWords } = require('../utility/filterBadWords');
const client = require('../../index');

module.exports = {
    endpoint: 'chat',
    post: async (req, res) => {
        const { token, username, message } = req.body;

        if (!token || !username || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            const data = await schema.findOne({ token });
            if (!data) return res.status(404).json({ error: 'Integration not found' });
            if (!data.enabled) return res.status(403).json({ error: 'Integration is disabled' });

            const channel = await client.channels.fetch(data.channelId);
            if (!channel || !channel.send) {
                return res.status(500).json({ error: 'Discord channel not found or bot not ready.' });
            }

            const cleanMessage = filterBadWords(message);
            await channel.send({
                embeds: [{
                    description: `**[ROBLOX] ${username}:** ${cleanMessage}`,
                    color: 0xffb3d8,
                }]
            });

            return res.status(200).json({ success: true });
        } catch (err) {
            console.error('[Chat API] Error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
