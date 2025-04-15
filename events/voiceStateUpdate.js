const { getPairKey, getIndivKey } = require('../utils/tracking');
const { saveIndiv, savePairs } = require('../utils/file');

module.exports = (client, oldState, newState) => {
  const uid = newState.id;
  if (!Object.values(client.usersMap).includes(uid)) return;

  const guild = newState.guild;
  const voiceStates = guild.voiceStates.cache;
  const now = Date.now();

  const leftChannel = oldState.channelId;
  const joinedChannel = newState.channelId;

  if (leftChannel && (!joinedChannel || leftChannel !== joinedChannel)) {
    if (client.activeIndiv[uid]) {
      const elapsed = now - client.activeIndiv[uid].startTime;
      client.indivTimeData[uid] = (client.indivTimeData[uid] || 0) + elapsed;
      delete client.activeIndiv[uid];
    }

    for (const otherId of Object.values(client.usersMap)) {
      if (otherId === uid) continue;
      const vs = voiceStates.get(otherId);
      if (vs?.channelId === leftChannel) {
        const key = getPairKey(uid, otherId);
        if (client.activePairs[key]) {
          const elapsed = now - client.activePairs[key].startTime;
          client.pairTimeData[key] = (client.pairTimeData[key] || 0) + elapsed;
          delete client.activePairs[key];
        }
      }
    }

    saveIndiv(client.indivTimeData);
    savePairs(client.pairTimeData);
  }

  if (joinedChannel) {
    if (!client.activeIndiv[uid]) client.activeIndiv[uid] = { startTime: now };

    for (const otherId of Object.values(client.usersMap)) {
      if (otherId === uid) continue;
      const vs = voiceStates.get(otherId);
      if (vs?.channelId === joinedChannel) {
        const key = getPairKey(uid, otherId);
        if (!client.activePairs[key]) client.activePairs[key] = { startTime: now };
      }
    }
  }
};
