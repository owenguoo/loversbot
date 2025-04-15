const { getUserName } = require('../../utils/tracking');
const formatTime = require('../../utils/format');

module.exports = {
  name: '!ilb',
  execute(message, args, client) {
    const now = Date.now();
    const data = { ...client.indivTimeData };

    for (const [id, val] of Object.entries(client.activeIndiv)) {
      data[id] = (data[id] || 0) + (now - val.startTime);
    }

    const sorted = Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .map(([id, time], i) => `${i + 1}. ${getUserName(client.usersMap, id)}: ${formatTime(time)}`);

    message.reply('**Individual Leaderboard**\n' + sorted.join('\n'));
  }
};
