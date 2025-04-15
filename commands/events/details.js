module.exports = {
    name: '!details',
    execute(message, args, client) {
      const name = args[0];
      const event = client.events[name];
      if (!event) return message.reply(`No event called "${name}" found.`);
  
      const yes = [], no = [], uncertain = [];
  
      for (const [username, id] of Object.entries(client.usersMap)) {
        const r = event.responses[id];
        if (r === 'yes') yes.push(username);
        else if (r === 'no') no.push(username);
        else uncertain.push(username);
      }
  
      const reply = `📅 **${name}** – ${event.description}\n\n` +
        `Yes: ${yes.join(', ') || 'None'}\n` +
        `No: ${no.join(', ') || 'None'}\n` +
        `Uncertain: ${uncertain.join(', ') || 'None'}`;
      message.reply(reply);
    }
  };
  