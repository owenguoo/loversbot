const { saveEvents } = require('../../utils/file');

module.exports = {
  name: '!deleteevent',
  execute(message, args, client) {
    const name = args[0];
    if (!client.events[name]) return message.reply(`Event "${name}" doesn't exist.`);
    delete client.events[name];
    saveEvents(client.events);
    message.reply(`Event "${name}" has been deleted.`);
  }
};
