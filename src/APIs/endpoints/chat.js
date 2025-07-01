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
      const data = await schema.findOne({ token }).lean();
      if (!data) return res.status(404).json({ error: 'Integration not found' });
      if (!data.enabled) return res.status(403).json({ error: 'Integration is disabled' });

      res.status(200).json({ success: true });

      client.channels.fetch(data.channelId)
        .then(channel => {
          if (!channel?.send) return;

          const cleanMessage = filterBadWords(message);
          channel.send({
            embeds: [{
              description: `**[ROBLOX] ${username}:** ${cleanMessage}`,
              color: 0xffb3d8,
            }]
          }).catch(err => console.error('[Chat API] Discord send error:', err));
        })
        .catch(err => console.error('[Chat API] Channel fetch error:', err));

    } catch (err) {
      console.error('[Chat API] Error:', err);
      if (!res.headersSent) {
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
};
