const path = require('path');
const fs = require('fs');
const client = require('../../index');

module.exports = async (app) => {
  const endpointPath = path.join(__dirname, '..', 'endpoints');
  const endpoints = fs.readdirSync(endpointPath).filter(file => file.endsWith('.js'));

  const registered = [];
  const failed = [];

  for (const file of endpoints) {
    try {
      const data = require(path.join(endpointPath, file));

      if (data.endpoint && typeof data.post === 'function') {
        app.post(`/api/${data.endpoint}`, data.post);
        registered.push(`/api/${data.endpoint}`);
        console.log(`✅ Registered: /api/${data.endpoint}`);
      }
    } catch (err) {
      failed.push({ file, error: err.message });
      console.error(`❌ Failed to load ${file}:`, err);
    }
  }

  try {
    const channel = await client.channels.fetch('1389492586665869404');
    if (channel && channel.send) {
      if (registered.length > 0) {
        await channel.send({
          embeds: [{
            title: '🟢 API Endpoints Registered',
            description: registered.map(r => `• \`${r}\``).join('\n'),
            color: 0x57f287,
            timestamp: new Date()
          }]
        });
      }

      if (failed.length > 0) {
        await channel.send({
          embeds: [{
            title: '🔴 Failed to Load Endpoints',
            description: failed.map(f => `• \`${f.file}\`\n\`\`\`${f.error}\`\`\``).join('\n'),
            color: 0xed4245,
            timestamp: new Date()
          }]
        });
      }
    }
  } catch (err) {
    console.error('❌ Could not send endpoint status to log channel:', err);
  }
};
