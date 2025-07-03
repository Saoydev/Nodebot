const fs = require("fs");
const path = require("path");

let handlerLoaded = false;

// Utility: parse cooldown string to milliseconds
function parseCooldown(str) {
  const match = str.match(/^(\d+)(s|m|h|d|mth|yr)$/i);
  if (!match) return null;

  const amount = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    mth: 30 * 24 * 60 * 60 * 1000,
    yr: 365 * 24 * 60 * 60 * 1000,
  };

  return amount * (multipliers[unit] || 0);
}

module.exports = (client) => {
  if (handlerLoaded) {
    console.warn("[handlePrefixes] Prefix handler already loaded, skipping duplicate.");
    return;
  }
  handlerLoaded = true;

  console.log("[handlePrefixes] Prefix handler loaded.");

  const prefix = process.env.PREFIX;
  if (!prefix) {
    console.warn("[handlePrefixes] ⚠️ PREFIX is not defined in the .env file.");
    return;
  }

  const commands = new Map();
  const cooldowns = new Map(); // Map of Map: commandName => Map(userId => timestamp)

  const commandsPath = path.join(__dirname, "../commands/prefix");
  if (!fs.existsSync(commandsPath)) {
    console.warn(`[handlePrefixes] ⚠️ Commands path not found: ${commandsPath}`);
    return;
  }

  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (command.name && typeof command.execute === "function") {
      commands.set(command.name.toLowerCase(), command);
      console.log(`[handlePrefixes] Loaded prefix command: ${command.name}`);
    } else {
      console.warn(`[handlePrefixes] ⚠️ Prefix command '${file}' is missing a 'name' or 'execute()'.`);
    }
  }

  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = commands.get(commandName);
    if (!command) return;

    const text = args.join(" ").trim();

    if (command.argsRequired && !text) {
      return message.reply(`Please provide arguments for the command **${commandName}**.`);
    }

    // Handle cooldowns
    const now = Date.now();

    if (!cooldowns.has(commandName)) {
      cooldowns.set(commandName, new Map());
    }

    const timestamps = cooldowns.get(commandName);
    const cooldownAmount = command.cooldown ? parseCooldown(command.cooldown) : 0;

    if (cooldownAmount) {
      if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeftMs = expirationTime - now;

          // Format remaining cooldown nicely:
          const secondsLeft = Math.ceil(timeLeftMs / 1000);
        return;
        }
      }

      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    try {
      await command.execute(client, message, text);
    } catch (error) {
      console.error(`[handlePrefixes] Error executing command '${commandName}':`, error);
      message.reply("❌ There was an error trying to run that command.");
    }
  });
};
