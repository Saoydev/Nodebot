const mongoose = require('mongoose');

const IntegrationSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  channelId: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Integration', IntegrationSchema);
