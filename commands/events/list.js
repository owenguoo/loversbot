module.exports = {
    name: '!events',
    execute(message, args, client) {
      const keys = Object.keys(client.events);
      if (!keys.length) return message.reply("There are no events.");
      const list = keys.map(k => `• **${k}** – ${client.events[k].description}`).join('\n');
      message.reply("**All Events:**\n" + list);
    }
  };
  