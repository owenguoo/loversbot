const { updateActiveTimes } = require('../utils/tracking');

module.exports = (client) => {
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) return;

  const voiceStates = guild.voiceStates.cache;
  const users = Object.values(client.usersMap);
  const now = Date.now();

  const channelUsers = {};
  for (const id of users) {
    const vs = voiceStates.get(id);
    if (vs?.channelId) {
      if (!channelUsers[vs.channelId]) channelUsers[vs.channelId] = [];
      channelUsers[vs.channelId].push(id);
    }
  }

  for (const ids of Object.values(channelUsers)) {
    if (ids.length >= 2) {
      for (const id of ids) client.activeIndiv[id] = { startTime: now };
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const key = [ids[i], ids[j]].sort().join('-');
          client.activePairs[key] = { startTime: now };
        }
      }
    }
  }

  setInterval(() => updateActiveTimes(client), 60_000);
  //console.log('Bot is online.');
};
