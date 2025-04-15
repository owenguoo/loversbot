const { getUserName } = require('../../utils/tracking');
const formatTime = require('../../utils/format');

module.exports = {
  name: '!lb',
  execute(message, args, client) {
    const data = { ...client.pairTimeData };
    const now = Date.now();

    for (const [k, v] of Object.entries(client.activePairs)) {
      data[k] = (data[k] || 0) + (now - v.startTime);
    }

    const leaderboard = Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .map(([key, time], i) => {
        const [id1, id2] = key.split('-');
        const name1 = getUserName(client.usersMap, id1);
        const name2 = getUserName(client.usersMap, id2);
        return `${i + 1}. ${name1} & ${name2}: ${formatTime(time)}`;
      });

    message.reply('**Pair Leaderboard**\n' + leaderboard.join('\n'));
  }
};
