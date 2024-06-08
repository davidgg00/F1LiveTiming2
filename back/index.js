// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');
const { parseCompressed, deepObjectMerge } = require('./utils/formatObject');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let latestMessages = []; // Store the latest messages

let objectState = {}; // Store the object state

const negotiate = async () => {
  const hub = encodeURIComponent(JSON.stringify([{ name: "Streaming" }]));
  const url = `https://livetiming.formula1.com/signalr/negotiate?connectionData=${hub}&clientProtocol=1.5`;
  const resp = await axios.get(url);
  const cookie = resp.headers['set-cookie'].join('; ');
  resp.data.Cookie = cookie;
  return resp.data;
};

const connectWebSocket = async (connectionToken, cookie) => {
  const hub = encodeURIComponent(JSON.stringify([{ name: "Streaming" }]));
  const encodedToken = encodeURIComponent(connectionToken);
  const url = `wss://livetiming.formula1.com/signalr/connect?clientProtocol=1.5&transport=webSockets&connectionToken=${encodedToken}&connectionData=${hub}`;

  const socket = new WebSocket(url, {
    headers: {
      'User-Agent': 'BestHTTP',
      'Accept-Encoding': 'gzip,identity',
      'Cookie': cookie
    }
  });

  socket.on('open', () => {
    console.log('WebSocket connection established.');
    socket.send(JSON.stringify({
      H: "Streaming",
      M: "Subscribe",
      A: [
        [
          "Heartbeat",
          "CarData.z",
          "Position.z",
          "ExtrapolatedClock",
          "TimingStats",
          "TimingAppData",
          "WeatherData",
          "TrackStatus",
          "DriverList",
          "RaceControlMessages",
          "SessionInfo",
          "SessionData",
          "LapCount",
          "TimingData",
          "TeamRadio",
        ],
      ],
      I: 1,
    }));
  });

  socket.on('message', (data) => {
    // Process the message data
    processMessageData(data.toString());;
    
    
    // Store the latest message
    /* latestMessages.push(objectState);
    if (latestMessages.length > 100) { // Keep the last 100 messages
      latestMessages.shift();
    } */

    // Broadcast data to all connected clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(objectState));
      }
    });
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  socket.on('close', () => {
    console.log('WebSocket connection closed.');
  });
};

const initializeWebSocket = async () => {
  try {
    const negotiationData = await negotiate();
    const connectionToken = negotiationData.ConnectionToken;
    const cookie = negotiationData.Cookie;

    await connectWebSocket(connectionToken, cookie);
  } catch (error) {
    console.error('Error:', error);
  }
};

initializeWebSocket();

wss.on('connection', (ws) => {
  console.log('New client connected');

  // Send the latest messages to the newly connected client
  ws.send(JSON.stringify(objectState));

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});



const processMessageData = async (data) => {
  console.log('Procesando mensaje:', data);
  const linesArray = data.split('\n');
  for (let i = 0; i < linesArray.length; i++) {
    const line = linesArray[i].trim();
    if (line.length !== 0) {
      const lineJSON = JSON.parse(line);
      if (lineJSON.R) {
        if (lineJSON.R["CarData.z"])
          lineJSON.R["CarData"] = parseCompressed(lineJSON.R["CarData.z"]);
        if (lineJSON.R["Position.z"])
          lineJSON.R["Position"] = parseCompressed(lineJSON.R["Position.z"]);
        objectState = deepObjectMerge(objectState, lineJSON.R);
      }
      if (lineJSON.M) {
        for (const message of lineJSON.M) {
          if (message.M !== "feed") continue;
          let [field, value] = message.A;
          if (field === "CarData.z" || field === "Position.z") {
            const [parsedField] = field.split(".");
            field = parsedField;
            value = parseCompressed(value);
          }
          objectState = deepObjectMerge(objectState, { [field]: value });
        }
      }
    }
  }
};