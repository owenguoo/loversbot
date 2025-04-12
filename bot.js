const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const guildId = process.env.GUILD_ID;
const users = JSON.parse(process.env.USERS);


const userIds = Object.values(users);
const jsonFilePath = './timeTracker.json';
const indivPath = './indiv.json';

let activePairs = {};  
let pairTimeData = {}; 

let activeIndiv = {}; 
let indivTimeData = {}; 

function getPairKey(userId1, userId2) {
  return [userId1, userId2].sort().join('-');
}

function getIndivKey(userId1) {
  return [userId1];
}

function getUserName(userId) {
  for (const [name, id] of Object.entries(users)) {
    if (id === userId) return name;
  }
  return 'Unknown User';
}

function readTimeData() {
  try {
    const data = fs.readFileSync(jsonFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    // // console.log('Error reading JSON file or file does not exist:', err);
    return {}; 
  }
}

function writeTimeData(data) {
  fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

function readTimeData2() {
  try {
    const data = fs.readFileSync(indivPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    // // console.log('Error reading JSON file or file does not exist:', err);
    return {};
  }
}

function writeTimeData2(data) {
  fs.writeFileSync(indivPath, JSON.stringify(data, null, 2), 'utf-8');
}

function loadData() {
  try {
    pairTimeData = readTimeData();
    // console.log('Loaded existing time data');
  } catch (err) {
    // console.log('No existing data found, starting fresh');
    pairTimeData = {};
  }
}

function loadData2() {
  try {
    indivTimeData = readTimeData2();
    // console.log('Loaded existing indiv time data');
  } catch (err) {
    // console.log('No existing data found, starting fresh');
    indivTimeData = {};
  }
}


function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}h ${minutes}m ${remainingSeconds}s`;
}

function updateActiveTimes() {
  const now = Date.now();
  let dataChanged = false;
  let dataChanged2 = false;

  for (const [indivKey, data] of Object.entries(activeIndiv)) {
    const timeElapsed = now - data.startTime;
    data.startTime = now; 

    if (!indivTimeData[indivKey]) {
      indivTimeData[indivKey] = 0;
    }
    indivTimeData[indivKey] += timeElapsed;
    dataChanged2 = true;
  }

  for (const [pairKey, data] of Object.entries(activePairs)) {
    const timeElapsed = now - data.startTime;
    data.startTime = now; 

    if (!pairTimeData[pairKey]) {
      pairTimeData[pairKey] = 0;
    }
    pairTimeData[pairKey] += timeElapsed;
    dataChanged = true;
  }

  if (dataChanged) {
    writeTimeData(pairTimeData);
    // console.log('Updated time data for active pairs');
  }
  if (dataChanged2) {
    writeTimeData2(indivTimeData);
    // console.log('Updated time data for active pairs');
  }
}


client.once('ready', () => {
  // console.log('Bot is online!');
  loadData();
  loadData2();
  
  setInterval(updateActiveTimes, 60000);
  
  const guild = client.guilds.cache.get(guildId);
  if (guild) {
    const voiceStates = guild.voiceStates.cache;
    
    const channelUsers = {};
    for (const userId of userIds) {
      const voiceState = voiceStates.get(userId);
      if (voiceState?.channelId) {
        if (!channelUsers[voiceState.channelId]) {
          channelUsers[voiceState.channelId] = [];
        }
        channelUsers[voiceState.channelId].push(userId);
      }
    }
    
    for (const channelId in channelUsers) {
      const usersInChannel = channelUsers[channelId];

      
      
      if (usersInChannel.length >= 2) {
        for (let i = 0; i < usersInChannel.length; i++) {
          const indivKey = getIndivKey(usersInChannel[i]);
          activeIndiv[indivKey] = { startTime: Date.now() };
          // console.log(`Started tracking indiv: ${getUserName(usersInChannel[i])} & ${getUserName(usersInChannel[j])}`);
        }
        for (let i = 0; i < usersInChannel.length - 1; i++) {
          for (let j = i + 1; j < usersInChannel.length; j++) {
            const pairKey = getPairKey(usersInChannel[i], usersInChannel[j]);
            activePairs[pairKey] = { startTime: Date.now() };
            // console.log(`Started tracking pair: ${getUserName(usersInChannel[i])} & ${getUserName(usersInChannel[j])}`);
          }
        }
      }
    }
  }
});

client.on('voiceStateUpdate', (oldState, newState) => {
  if (!userIds.includes(newState.id)) return;
  
  const currentUserId = newState.id;
  const guild = newState.guild;
  const voiceStates = guild.voiceStates.cache;
  
  const oldChannelId = oldState.channelId;
  const newChannelId = newState.channelId;
  
  if (oldChannelId && (!newChannelId || oldChannelId !== newChannelId)) {
    const indivKey = getIndivKey(currentUserId);
    if (activeIndiv[indivKey]) {
      const elapsed = Date.now() - activeIndiv[indivKey].startTime;
      if (!indivTimeData[indivKey]) {
        indivTimeData[indivKey] = 0;
      }
      indivTimeData[indivKey] += elapsed;
      delete activeIndiv[indivKey];
      writeTimeData2(indivTimeData);
      // console.log(`Stopped tracking indiv: ${getUserName(currentUserId)}`);
    }
  
    for (const userId of userIds) {
      if (userId === currentUserId) continue;
  
      const voiceState = voiceStates.get(userId);
      if (voiceState?.channelId === oldChannelId) {
        const pairKey = getPairKey(currentUserId, userId);
        if (activePairs[pairKey]) {
          const elapsed = Date.now() - activePairs[pairKey].startTime;
          if (!pairTimeData[pairKey]) {
            pairTimeData[pairKey] = 0;
          }
          pairTimeData[pairKey] += elapsed;
          delete activePairs[pairKey];
          writeTimeData(pairTimeData);
          // console.log(`Stopped tracking pair: ${getUserName(currentUserId)} & ${getUserName(userId)}`);
        }
      }
    }
  }
  
  if (newChannelId) {
    const indivKey = getIndivKey(currentUserId);
        if (!activeIndiv[indivKey]) {
          activeIndiv[indivKey] = { startTime: Date.now() };
          // console.log(`Started tracking indiv: ${getUserName(currentUserId)}`);
        }

    for (const userId of userIds) {
      if (userId === currentUserId) continue; 
      
      const voiceState = voiceStates.get(userId);
      if (voiceState?.channelId === newChannelId) {
        const pairKey = getPairKey(currentUserId, userId);
        if (!activePairs[pairKey]) {
          activePairs[pairKey] = { startTime: Date.now() };
          // console.log(`Started tracking pair: ${getUserName(currentUserId)} & ${getUserName(userId)}`);
        }
      }
    }
  }
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  if (message.content.includes('https://www.instagram.com/reel/') || 
      message.content.includes('https://instagram.com/reel/') ||
      message.content.includes('https://instagram.com/reels/') ||
      message.content.includes('https://www.instagram.com/reels/')
    ) {
        message.delete();
        message.channel.send(`**NO BRAINROT ALLOWED** <@${message.author.id}>`);
        // console.log(`Deleted Instagram reel from ${message.author.tag}`);
    return; 
  }

  const content = message.content.toLowerCase();  
  
  if (content === '!lb') {
    const currentData = { ...pairTimeData };
  
    for (const [pairKey, data] of Object.entries(activePairs)) {
      if (!currentData[pairKey]) {
        currentData[pairKey] = 0;
      }
      currentData[pairKey] += Date.now() - data.startTime;
    }
    
    const sortedPairs = Object.entries(currentData)
      .sort((a, b) => b[1] - a[1])
      .map(([pairKey, time]) => {
        const [id1, id2] = pairKey.split('-');
        return {
          user1: getUserName(id1),
          user2: getUserName(id2),
          time
        };
      });
    
    let leaderboardMessage = '**Pair Leaderboard**\n';
    
    sortedPairs.forEach((pair, index) => {
      leaderboardMessage += `${index + 1}. ${pair.user1} & ${pair.user2}: ${formatTime(pair.time)}\n`;
    });
    
    message.reply(leaderboardMessage);
  }

  if (content === '!ilb') {
    const currentData = { ...indivTimeData };
    
    for (const [indivKey, data] of Object.entries(activeIndiv)) {
      if (!currentData[indivKey]) {
        currentData[indivKey] = 0;
      }
      currentData[indivKey] += Date.now() - data.startTime;
    }
    
    const sortedIndiv = Object.entries(currentData)
      .sort((a, b) => b[1] - a[1])
      .map(([indivKey, time]) => {
        const id1 = indivKey;
        return {
          user1: getUserName(id1),
          time
        };
      });
  
    let leaderboardMessage = '**Individual Leaderboard**\n';
    sortedIndiv.forEach((indiv, index) => {
      leaderboardMessage += `${index + 1}. ${indiv.user1}: ${formatTime(indiv.time)}\n`;
    });
    
    message.reply(leaderboardMessage);
  }
});

client.login(process.env.DISCORD_TOKEN);