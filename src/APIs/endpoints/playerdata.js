const Integration = require('../../Schemas/Integration');
const client = require('../../index');

module.exports = {
  endpoint: 'playerdata',
  post: async (req, res) => {
    const { token, username, data } = req.body;

    if (!token || !username || !data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }

    try {
      const integration = await Integration.findOne({ token }, 'guildId enabled playerDataFields channelId');
      if (!integration) return res.status(404).json({ error: 'Integration not found' });
      if (!integration.enabled) return res.status(403).json({ error: 'Integration is disabled' });

      // Validate keys strictly against playerDataFields object keys
      const allowedFields = integration.playerDataFields || {};
      const invalidFields = Object.keys(data).filter(f => !(f in allowedFields));
      if (invalidFields.length > 0) {
        return res.status(400).json({ error: 'Invalid fields sent', invalidFields });
      }

      // Notify on Discord channel if available (logging only)
      if (integration.channelId && client?.channels) {
        client.channels.fetch(integration.channelId)
          .then(channel => {
            if (!channel?.send) return;
            const description = Object.entries(data)
              .map(([k, v]) => `**${k}:** ${v}`)
              .join('\n') || 'No data provided';

            channel.send({
              embeds: [{
                title: `Player Data Update: ${username}`,
                description,
                color: 0x00ff00,
                timestamp: new Date()
              }]
            }).catch(console.error);
          })
          .catch(console.error);
      }

      // Return success response — no DB storage done here
      return res.status(200).json({ success: true });

    } catch (err) {
      console.error('[PlayerData API] Error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};
