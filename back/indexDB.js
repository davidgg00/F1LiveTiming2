// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');
const { parseCompressed, deepObjectMerge } = require('./utils/formatObject');

const app = express();
const server = http.createServer(app);

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

  console.log(url);

  socket.on('open', () => {
    console.log('WebSocket connection established.');
    socket.send(JSON.stringify({
      H: "Streaming",
      M: "Subscribe",
      A: [
        [
/*           "Heartbeat",
          "CarData.z",
          "Position.z",
          "ExtrapolatedClock",
          "TimingStats",
          "TimingAppData",
          "WeatherData",
          "TrackStatus", */
          "DriverList",
/*           "RaceControlMessages",
          "SessionInfo",
          "SessionData",
          "LapCount", */
          "TimingData",
          /* "TeamRadio", */
        ],
      ],
      I: 1,
    }));
  });
  const previousState =  {};
  socket.on('message', (data) => {
    // Process the message data
    processMessageData(data.toString());;

    const DriverList = Object.values(objectState?.DriverList || {}).filter(driver => typeof driver !== 'boolean');
    const driversRacingNumber = DriverList.map(driver => driver.RacingNumber ? driver.RacingNumber : null);


    for (const driver of DriverList) {
      const driverNumber = driver.RacingNumber;
      const driverTiming = objectState?.TimingData?.Lines?.[driverNumber];
      const lastLapTime = driverTiming?.LastLapTime;
      if (driverTiming && lastLapTime) {
        const objData = {
          driverNumber: driverTiming.RacingNumber,
          lastLapTime: lastLapTime.Value,
          numberOfLaps: driverTiming.NumberOfLaps,
        };
  
        // Check if the lastLapTime has changed
        if ((!previousState[driverNumber] || previousState[driverNumber].lastLapTime !== objData.lastLapTime) && objData.lastLapTime && objData.numberOfLaps) {
          console.log('----------------');
          console.log('Driver Number:', driverNumber);
          console.log('Last Lap Time:', objData.lastLapTime);
          console.log('Number Of Laps:', objData.numberOfLaps);
          console.log('----------------');
        }
  
        // Update the previous state
        previousState[driverNumber] = objData;
      }
  
    }

  
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  socket.on('close', () => {
    console.log('WebSocket connection closed.');
    //reconect
    setTimeout(() => {
      console.log('Reconnecting...');
      initializeWebSocket();
    }, 5000);
  });
};

const initializeWebSocket = async () => {1
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
server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});


let sessionStartTime = null;
let sessionDuration = null;
const updateRemainingTime = () => {
  if (sessionStartTime && sessionDuration) {
    const now = new Date();
    const elapsedTime = (now - sessionStartTime) / 1000; // time in seconds
    const remainingTime = sessionDuration - elapsedTime;
    if (remainingTime >= 0) {
      objectState.ExtrapolatedClock = { ...objectState.ExtrapolatedClock, Remaining: remainingTime };
    } else {
      objectState.ExtrapolatedClock = { ...objectState.ExtrapolatedClock, Remaining: 0 };
    }
  }
};


const processMessageData = async (data) => {
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