const { saveEvents } = require('../../utils/file');

module.exports = {
  name: '!makeevent',
  execute(message, args, client) {
    const [eventName, ...descParts] = args;
    if (!eventName) return message.reply("Usage: !makeevent <name> <description>");
    const description = descParts.join(' ');
    client.events[eventName] = { description, responses: {} };
    saveEvents(client.events);
    message.reply(`Event **${eventName}** created: ${description}`);
  }
};
