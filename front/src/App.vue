<template>
  <Loading v-model:active="isLoading" :opacity="1" :color="'#ccc'" :loader="'dots'" :background-color="'#171717'" />
  <div class="app-container">
    <HeaderInfo class="header-info" />
    <div class="main">
      <DriverListComponent class="driver-list-wrapper" />
      <div class="wrapper">
        <Map />
        <RaceControl />
      </div>
      <div>
      </div>
    </div>
    <footer class="footer">
      <p>This live timing information is not affiliated with, endorsed, or approved by Formula 1 or any of its partners.
        All rights to the content belong to their respective owners. This site is intended for informational purposes
        only. For official Formula 1 content, please visit the official Formula 1 website.
      </p>
    </footer>
  </div>
  <div class="control-buttons">
    <button @click="readLines">Procesar archivo línea por línea</button>
  </div>
</template>

<script setup lang="ts">
import HeaderInfo from './components/HeaderInfo.vue';
import { ref, onMounted } from 'vue';
import DriverListComponent from './components/DriverList.vue';
import Map from './components/Map.vue';
import RaceControl from './components/RaceControl.vue';
import { negotiate } from '../src/utils/socket';
import useReadLines from "./composables/useReadLines";
import useWebSocket from './composables/useWebSocket';
import { useStateStore } from './store/state';
import { storeToRefs } from 'pinia';

const stateStore = useStateStore();
const { setState } = stateStore;
const { state, isLoading } = storeToRefs(stateStore);
const { readLines } = useReadLines(state, setState);
const tiempoPausa = ref<number>(0);
const { connectWebSocket } = useWebSocket(state, setState, tiempoPausa);


onMounted(async () => {
  const negotiationData = await negotiate();
  const connectionToken = negotiationData.ConnectionToken;
  await connectWebSocket(connectionToken);
});
</script>

<style scoped src="./assets/styles/app.css"></style>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>