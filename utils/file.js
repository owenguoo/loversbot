const fs = require('fs');

function init(client) {
  client.events = fs.existsSync('./data/events.json')
    ? JSON.parse(fs.readFileSync('./data/events.json'))
    : {};
}

function saveEvents(events) {
  fs.writeFileSync('./data/events.json', JSON.stringify(events, null, 2));
}

function saveIndiv(data) {
  fs.writeFileSync('./data/indiv.json', JSON.stringify(data, null, 2));
}

function savePairs(data) {
  fs.writeFileSync('./data/timeTracker.json', JSON.stringify(data, null, 2));
}

module.exports = { init, saveEvents, saveIndiv, savePairs };
