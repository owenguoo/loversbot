require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

client.commands = new Collection();
client.usersMap = require('./config/users.json');
client.activePairs = {};
client.activeIndiv = {};
client.pairTimeData = {};
client.indivTimeData = {};

const loadUtils = require('./utils/file');
const tracking = require('./utils/tracking');
const formatTime = require('./utils/format');

loadUtils.init(client);
tracking.loadTimeData(client);

for (const category of ['events', 'tracker']) {
  const commandFiles = fs.readdirSync(`./commands/${category}`).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const cmd = require(`./commands/${category}/${file}`);
    client.commands.set(cmd.name, cmd);
  }
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  client.on(file.replace('.js', ''), (...args) => event(client, ...args));
}

client.login(process.env.DISCORD_TOKEN);
