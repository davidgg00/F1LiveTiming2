<template>
  <div class="app-container">
    <HeaderInfo :gpName="OfficialName" :timeLeftSession="timeLeftSession" :trackStatus="TrackStatus"
      :lapCount="LapCount" class="header-info" />
    <div class="main">
      <DriverListComponent :drivers="sortedDriverList" :carData="CarData" :timingData="TimingData"
        :TimingAppData="TimingAppData" class="driver-list-wrapper" :timingStats="TimingStats" />
      <div class="wrapper">
        <Map :position="position" :drivers="sortedDriverList" :timingData="TimingData" :circuitKey="circuitKey" />
        <RaceControl :raceControlMessages="sortedMessages" />
      </div>
    </div>
  </div>
  <div class="control-buttons">
    <button @click="pause">Pausar</button>
    <button @click="resume">Reanudar</button>
    <button @click="readLines">Procesar archivo línea por línea</button>
  </div>
</template>

<script setup lang="ts">
import HeaderInfo from './components/HeaderInfo.vue';
import { ref, onMounted, computed, watch } from 'vue';
import { parseCompressed, deepObjectMerge } from './utils';
import DriverListComponent from './components/DriverList.vue';
import { State } from './interfaces/State.interface';
import Map from './components/Map.vue';
import RaceControl from './components/RaceControl.vue';
import { negotiate, connectWebSocket } from '../src/utils/socket';

const message = ref<string | null>(null);
let socket: WebSocket | null = null;

const state = ref<State>({});
const messages = ref<Message[]>([]);
const TimingAppData = computed(() => state.value?.TimingAppData || {});

const TimingStats = computed(() => state.value.TimingStats || {});

const sortedMessages = ref([]);

let prueba = {};

const LapCount = computed(() => state.value.LapCount || {});
const RaceControlMessages = computed(() => state.value.RaceControlMessages || {});
const TrackStatus = computed(() => state.value.TrackStatus || {});
const timeLeftSession = computed(() => state.value?.ExtrapolatedClock?.Remaining || '');
const sortedDriverList = computed(() => {
  const driversArray = Object.values(state.value.DriverList || {});
  const filteredAndSortedDrivers = driversArray
    .filter(driver => typeof driver !== 'boolean')
    .sort((a, b) => a.Line - b.Line);
  return filteredAndSortedDrivers;
});

const sessionPartPrefix = (name: string) => {
  switch (name) {
    case "Sprint Qualifying":
      return "SQ";
    case "Qualifying":
      return "Q";
    default:
      return "";
  }
};

const tes222 = computed(() => {
  const prueba = sessionPartPrefix(state.value.SessionInfo?.Name) + '' + TimingData.value.SessionPart;
  return prueba;
})

const circuitKey = computed(() => state.value.SessionInfo?.Meeting.Circuit.Key || {});
const OfficialName = computed(() => state.value.SessionInfo?.Meeting.Name + ' :   ' + state.value.SessionInfo?.Name + ' ' + sessionPartPrefix(state.value.SessionInfo?.Name) + '' + (TimingData.value.SessionPart && state.value.SessionInfo?.Name != 'Race' ? TimingData.value.SessionPart : '') || {});
const TimingData = computed(() => state.value.TimingData || {});
const CarData = computed(() => state.value.CarData || {});
const position = computed(() => state.value?.Position?.Position[state.value?.Position.Position.length - 1] || {});

interface Message {
  id: number;
  text: string;
}

watch(RaceControlMessages, (newValue) => {
  const messages = Object.values(newValue?.Messages || []);
  const newValueFormatted = messages?.map(message => {
    const date = new Date(message.Utc);
    const options = { hour: '2-digit', minute: '2-digit' };
    const timeString = date.toLocaleTimeString('en-GB', options);
    return {
      ...message,
      hour: timeString
    };
  }).sort((a, b) => new Date(b.Utc).getTime() - new Date(a.Utc).getTime());
  sortedMessages.value = newValueFormatted;
}, { immediate: true, deep: true });

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
        state.value = deepObjectMerge(state.value, lineJSON.R);
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
          state.value = deepObjectMerge(state.value, { [field]: value });
        }
      }
    }
  }
};

const readLines = async () => {
  try {
    const response = await fetch("prueba.data.txt");
    if (!response.body) {
      console.error("The response body is null");
      return;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result: string = '';
    let chunk = await reader.read();

    while (!chunk.done) {
      result += decoder.decode(chunk.value, { stream: true });
      const linesArray = result.split('\n');
      for (let i = 0; i < linesArray.length - 1; i++) {
        const line = linesArray[i].trim();
        if (line.length !== 0) {
          const lineJSON = JSON.parse(line);
          if (lineJSON.R) {
            if (lineJSON.R["CarData.z"])
              lineJSON.R["CarData"] = parseCompressed(lineJSON.R["CarData.z"]);
            if (lineJSON.R["Position.z"])
              lineJSON.R["Position"] = parseCompressed(lineJSON.R["Position.z"]);
            state.value = deepObjectMerge(state.value, lineJSON.R);
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
              state.value = deepObjectMerge(state.value, { [field]: value });
            }
          }
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      result = linesArray.pop() || '';
      chunk = await reader.read();
    }

    console.log('Salgo!!');
    if (result.trim().length !== 0) {
      const lineJSON = JSON.parse(result.trim());
      if (lineJSON.R) {
        console.log('Processing last line:', result);
      }
    }
  } catch (error) {
    console.error('Error al leer el archivo:', error);
  }
};

const initializeWebSocket = async () => {
  try {
    const negotiationData = await negotiate();
    const connectionToken = negotiationData.ConnectionToken;
    const cookie = negotiationData.Cookie;
    socket = new WebSocket('ws://localhost:3000');
    socket.onopen = () => {
      console.log('WebSocket connection established.');
      socket?.send(JSON.stringify({
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
    };

    socket.onmessage = async (event) => {
      setTimeout(() => {
        state.value = JSON.parse(event.data);
      }, tiempoPausa.value);

      prueba = JSON.parse(event.data);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed.');
    };
  } catch (error) {
    console.error('Initialization error:', error);
  }
};

const connectWebSocket = async (connectionToken, cookie) => {
  const hub = encodeURIComponent(JSON.stringify([{ name: "Streaming" }]));
  const encodedToken = encodeURIComponent(connectionToken);
  const url = `wss://livetiming.formula1.com/signalr/connect?clientProtocol=1.5&transport=webSockets&connectionToken=${encodedToken}&connectionData=${hub}`;

  const socket = new WebSocket(url);

  console.log(url);

  socket.onopen = () => {
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
  };

  socket.onmessage = (event) => {
    const data = event.data;
    // Process the message data
    setTimeout(() => {
      processMessageData(data.toString());
    }, tiempoPausa.value);



    // Store the latest message
    /* latestMessages.push(objectState);
    if (latestMessages.length > 100) { // Keep the last 100 messages
      latestMessages.shift();
    } */

  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed.');
    // Reconnect
    setTimeout(async () => {
      console.log('Reconnecting...');
      const negotiationData = await negotiate();
      const connectionToken2 = negotiationData.ConnectionToken;
      const cookie2 = negotiationData.Cookie;
      connectWebSocket(connectionToken2, cookie2);
    }, 1000);
  };
};



const pauseStartTime = ref<number | null>(null);
const tiempoPausa = ref<number>(0);
const intervalId = ref(null);
const pause = () => {
  if (!pauseStartTime.value) {
    pauseStartTime.value = Date.now();
    // Iniciar un intervalo que actualiza tiempoPausa cada 100 ms
    intervalId.value = setInterval(() => {
      tiempoPausa.value = Date.now() - pauseStartTime.value;
    }, 100);
  }
};

// Función para detener la pausa y actualizar la duración total de la pausa
const resume = () => {
  if (pauseStartTime.value) {
    // Detener el intervalo
    clearInterval(intervalId.value);
    intervalId.value = null;
    // Añadir la duración de la pausa al tiempo total de pausa acumulado
    const pauseDuration = Date.now() - pauseStartTime.value;
    tiempoPausa.value = pauseDuration;
    /* pauseStartTime.value = null;  */// Resetear el tiempo de inicio de la pausa
  }
};

onMounted(async () => {
  const negotiationData = await negotiate();
  const connectionToken = negotiationData.ConnectionToken;
  const cookie = negotiationData.Cookie;

  await connectWebSocket(connectionToken, cookie);
  /* await initializeWebSocket(); */
});
</script>

<style scoped>
body {
  background-color: #1e1e1e;
  color: white;
  font-family: Arial, sans-serif;
}

.main {
  display: flex;
  justify-content: space-between;
}

.driver-list-wrapper {
  width: 40%;
  border-right: 1px solid #444;
  background: #2a2a2a;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  overflow-y: auto;
}

.wrapper {
  display: flex;
  flex-direction: column;
  width: 60%;
  overflow-y: auto;
}

@media screen and (max-width: 1650px) {
  .driver-list-wrapper {
    width: 60% !important;
  }

  .wrapper {
    width: 40% !important;
  }
}

@media screen and (max-width: 1150px) {
  .main {
    flex-direction: column;
  }

  .driver-list-wrapper {
    width: 100% !important;
    border-right: none;
    border-bottom: 1px solid #444;
    min-height: 90vh;
  }

  .wrapper {
    width: 100% !important;
    display: flex !important;
    flex-direction: row !important;
  }

  .map-wrapper {
    width: 70% !important;
  }

  .race-control-container {
    width: 30% !important;
  }

  .app-container {
    height: auto !important;
  }
}

@media screen and (max-width: 950px) {
  .wrapper {
    flex-direction: column !important;
  }

  .map-wrapper {
    width: 100% !important;
  }

  .race-control-container {
    width: 100% !important;
  }
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header-info {
  flex: 0 0 auto;
}

.main {
  display: flex;
  justify-content: space-between;
  background: #161616;
  color: white;
  flex: 1 1 auto;
  overflow: hidden;
}

.driver-list-wrapper {
  width: 40%;
  border-right: 1px solid #444;
  background: #2a2a2a;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  overflow-y: auto;
}

.wrapper {
  display: flex;
  flex-direction: column;
  width: 60%;
  overflow-y: hidden;
  max-height: 100%;
}

button {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  border: none;
  background-color: #555;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #666;
}

.control-buttons {
  text-align: center;
  margin-top: 20px;
}
</style>
