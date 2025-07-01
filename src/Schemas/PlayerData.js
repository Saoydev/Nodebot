const mongoose = require('mongoose');

const playerDataSchema = new mongoose.Schema({
  guildId: String,
  username: String,
  data: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model('PlayerData', playerDataSchema);
