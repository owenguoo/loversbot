module.exports = (client, message) => {
    if (message.author.bot) return;
  
    const args = message.content.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();
  
    if (!client.commands.has(cmd)) return;
  
    try {
      client.commands.get(cmd).execute(message, args.slice(1), client);
    } catch (err) {
      console.error('[ERROR]', err);
      message.reply("There was an error executing that command.");
    }
  };
  