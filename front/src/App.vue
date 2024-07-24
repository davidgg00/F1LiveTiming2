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
      <div>
      </div>
    </div>
  </div>
  <div class="control-buttons">
    <button @click="readLines">Procesar archivo línea por línea</button>
  </div>
</template>

<script setup lang="ts">
import HeaderInfo from './components/HeaderInfo.vue';
import { ref, onMounted, computed, watch } from 'vue';
import DriverListComponent from './components/DriverList.vue';
import { State } from './interfaces/State.interface';
import Map from './components/Map.vue';
import RaceControl from './components/RaceControl.vue';
import { negotiate } from '../src/utils/socket';
import useReadLines from "./composables/useReadLines";
import useWebSocket from './composables/useWebSocket';


const state = ref<State>({});
const TimingAppData = computed(() => state.value?.TimingAppData || {});
const { readLines } = useReadLines(state);

const TimingStats = computed(() => state.value.TimingStats || {});

const sortedMessages = ref([]);

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

const circuitKey = computed(() => state.value.SessionInfo?.Meeting.Circuit.Key || {});
const OfficialName = computed(() => state.value.SessionInfo?.Meeting.Name + ' :   ' + state.value.SessionInfo?.Name + ' ' + sessionPartPrefix(state.value.SessionInfo?.Name) + '' + (TimingData.value.SessionPart && state.value.SessionInfo?.Name != 'Race' ? TimingData.value.SessionPart : '') || {});
const TimingData = computed(() => state.value.TimingData || {});
const CarData = computed(() => state.value.CarData || {});
const position = computed(() => state.value?.Position?.Position[state.value?.Position.Position.length - 1] || {});
const tiempoPausa = ref<number>(0);
const { connectWebSocket } = useWebSocket(state, tiempoPausa);


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


onMounted(async () => {
  const negotiationData = await negotiate();
  const connectionToken = negotiationData.ConnectionToken;
  /* await initializeWebSocket(connectionToken, cookie); */
  await connectWebSocket(connectionToken);
});
</script>

<style scoped src="./assets/styles/app.css"></style>
