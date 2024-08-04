// src/composables/useWebSocket.ts
import { Ref } from "vue";
import { State } from "../interfaces/State.interface";
import { negotiate } from "../utils/socket";
import { processMessageData } from "./useProcessMessageData";

const useWebSocket = (
  state: Ref<State>,
  setState: (newState: any) => void,
  tiempoPausa: Ref<number>
) => {
  const connectWebSocket = async (connectionToken: string) => {
    const hub = encodeURIComponent(JSON.stringify([{ name: "Streaming" }]));
    const encodedToken = encodeURIComponent(connectionToken);
    const url = `wss://livetiming.formula1.com/signalr/connect?clientProtocol=1.5&transport=webSockets&connectionToken=${encodedToken}&connectionData=${hub}`;

    const socket = new WebSocket(url);

    console.log(url);

    socket.onopen = () => {
      console.log("WebSocket connection established.");
      socket.send(
        JSON.stringify({
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
        })
      );
    };

    socket.onmessage = (event) => {
      const data = event.data;
      // Process the message data
      setTimeout(() => {
        processMessageData(data.toString(), state, setState);
      }, tiempoPausa.value);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = async () => {
      console.log("WebSocket connection closed.");
      // Reconnect
      setTimeout(async () => {
        console.log("Reconnecting...");
        const negotiationData = await negotiate();
        const connectionToken2 = negotiationData.ConnectionToken;
        connectWebSocket(connectionToken2);
      }, 1000);
    };
  };

  return {
    connectWebSocket,
  };
};

export default useWebSocket;
