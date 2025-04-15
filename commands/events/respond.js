const { saveEvents } = require('../../utils/file');

module.exports = {
  name: '!respond',
  execute(message, args, client) {
    const [eventName, response] = args;
    if (!eventName || !['yes', 'no'].includes(response)) {
      return message.reply('Usage: !respond <eventName> <yes|no>');
    }

    const event = client.events[eventName];
    if (!event) return message.reply(`Event "${eventName}" not found.`);

    event.responses[message.author.id] = response;
    saveEvents(client.events);
    message.reply(`You responded **${response.toUpperCase()}** to **${eventName}**`);
  }
};
