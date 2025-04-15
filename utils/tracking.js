const fs = require('fs');
const { saveIndiv, savePairs } = require('./file');

function getPairKey(a, b) {
  return [a, b].sort().join('-');
}

function getIndivKey(id) {
  return id;
}

function getUserName(users, id) {
  return Object.entries(users).find(([_, uid]) => uid === id)?.[0] || 'Unknown';
}

function loadTimeData(client) {
  try {
    client.pairTimeData = JSON.parse(fs.readFileSync('./data/timeTracker.json', 'utf-8'));
  } catch { client.pairTimeData = {}; }

  try {
    client.indivTimeData = JSON.parse(fs.readFileSync('./data/indiv.json', 'utf-8'));
  } catch { client.indivTimeData = {}; }
}

function updateActiveTimes(client) {
  const now = Date.now();

  for (const [id, data] of Object.entries(client.activeIndiv)) {
    const elapsed = now - data.startTime;
    client.indivTimeData[id] = (client.indivTimeData[id] || 0) + elapsed;
    data.startTime = now;
  }

  for (const [key, data] of Object.entries(client.activePairs)) {
    const elapsed = now - data.startTime;
    client.pairTimeData[key] = (client.pairTimeData[key] || 0) + elapsed;
    data.startTime = now;
  }

  saveIndiv(client.indivTimeData);
  savePairs(client.pairTimeData);
}

module.exports = {
  getPairKey,
  getIndivKey,
  getUserName,
  loadTimeData,
  updateActiveTimes,
};
