<template>
  <div class="map-wrapper">
    <div class="h-full w-full p-2" v-if="!points.length || !bounds[0] || !bounds[1] || !bounds[2] || !bounds[3]"
      style="min-height: 35rem;">
      <div class="h-full w-full animate-pulse rounded-lg bg-zinc-800" />
    </div>
    <svg v-else :viewBox="`${bounds[0]} ${bounds[1]} ${bounds[2]} ${bounds[3]}`" class="h-full w-full xl:max-h-screen"
      xmlns="http://www.w3.org/2000/svg">
      <!-- Dibujar el camino del mapa usando los puntos rotados -->
      <path class="stroke-gray-800" :stroke-width="100" stroke-linejoin="round" fill="transparent"
        :d="`M${points[0].x},${points[0].y} ${points.map((point) => `L${point.x},${point.y}`).join(' ')}`" />

      <!-- Grupo del conductor -->
      <g v-for="driverPoint in driverPoints">
        <circle :cx="rotate(driverPoint.X, driverPoint.Y, rotation, centerX, centerY).x"
          :cy="rotate(driverPoint.X, driverPoint.Y, rotation, centerX, centerY).y" r="100"
          :fill="driverPoint.TeamColour" stroke="black" stroke-width="2" :opacity="driverPoint.inPit ? '0.5' : 1" />
        <text :x="rotate(driverPoint.X + 150, driverPoint.Y, rotation, centerX, centerY).x"
          :y="rotate(driverPoint.X + 60, driverPoint.Y, rotation, centerX, centerY).y" font-size="200"
          :fill="driverPoint.TeamColour" dominant-baseline="middle" visibility="visible" stroke="black"
          stroke-width="0.5" :opacity="driverPoint.inPit ? '0.5' : 1">
          {{ driverPoint.driverName }}
        </text>
      </g>
    </svg>
  </div>
</template>


<script setup lang="ts">

import { DriverList } from '../interfaces/Driver.interface';
import { TimingData } from '../interfaces/TimingData.interface';
import { PositionElement } from '../interfaces/WelcomePosition.interface';
import { ref, onMounted, toRefs, watch, PropType } from 'vue';


const props = defineProps({
  position: Object<PositionElement>,
  drivers: {
    type: Array as PropType<DriverList>,
    required: true,
    default: [],
  },
  timingData: {
    type: Object as PropType<TimingData>,
    required: true,
    default: {},
  },
  circuitKey: {
    type: Number,
    required: true,
  },
});

const { position, drivers, timingData, circuitKey } = toRefs(props);
const space = 1000;
const rotationFIX = 90;

const rad = (deg) => deg * (Math.PI / 180);

const rotate = (x, y, a, px, py) => {
  const c = Math.cos(rad(a));
  const s = Math.sin(rad(a));

  x -= px;
  y -= py;

  const newX = x * c - y * s;
  const newY = y * c + x * s;

  return { y: newX + px, x: newY + py };
};

const fetchMapData = async () => {
  const response = await fetch(`https://api.multiviewer.app/api/v1/circuits/${circuitKey.value}/2024`);
  return await response.json();
};

const mapData = ref(null);
const points = ref([]);
const rotation = ref(0);
const bounds = ref([null, null, null, null]);
const centerX = ref(null);
const centerY = ref(null);

const driverPoints = ref(null);

const updateDriverPoints = () => {
  if (Object.keys(position.value).length > 0) {
    driverPoints.value = Object.keys(position.value?.Entries).map(key => {
      // Encuentra el driver correspondiente en drivers.value
      const driver = drivers.value.find(driver => driver.RacingNumber === key);
      // Añade la propiedad TeamColour si existe el driver
      const teamColour = driver ? driver.TeamColour : null;
      const driverName = driver ? driver.Tla : null;

      const inPit = timingData.value.Lines[key] ? timingData.value.Lines[key].InPit : null;

      return {
        racingNumber: key,
        TeamColour: '#' + teamColour,  // Añade la propiedad TeamColour
        ...position.value.Entries[key],
        driverName,
        inPit,
      };
    });
  }
};

const updateMapData = async () => {
  const data = await fetchMapData();

  centerX.value = (Math.max(...data.x) - Math.min(...data.x)) / 2;
  centerY.value = (Math.max(...data.y) - Math.min(...data.y)) / 2;

  const fixedRotation = data.rotation + rotationFIX;

  const rotatedPoints = data.x.map((x, index) => rotate(x, data.y[index], fixedRotation, centerX.value, centerY.value));

  const pointsX = rotatedPoints.map((item) => item.x);
  const pointsY = rotatedPoints.map((item) => item.y);

  const cMinX = Math.min(...pointsX) - space;
  const cMinY = Math.min(...pointsY) - space;
  const cWidthX = Math.max(...pointsX) - cMinX + space * 2;
  const cWidthY = Math.max(...pointsY) - cMinY + space * 2;

  points.value = rotatedPoints;
  bounds.value = [cMinX, cMinY, cWidthX, cWidthY];
  rotation.value = fixedRotation;
};


watch(position, () => {
  updateDriverPoints();
}, { immediate: true });

watch(circuitKey, (newValue, oldValue) => {
  console.log('circuitKey changed ' + newValue + ' ' + oldValue);
  circuitKey.value = newValue;
  fetchMapData();
  updateMapData();
}, { immediate: true });

const driverPosition = ref({ x: 200, y: 500 });
const driverName = ref('Driver Name');



onMounted(async () => {
  await updateMapData();
  driverPosition.value = { x: -1590, y: 970 }; // Establecer la posición del conductor
  driverName.value = 'Conductor'; // Establecer el nombre del conductor
});
</script>

<style scoped>
.stroke-gray-800 {
  stroke: #ccc;
  filter: drop-shadow(0px 0px 150px rgba(134, 134, 134, 0.5));
  /* Agregar sombra a las líneas */
}

.map-wrapper {
  height: fit-content;
  border-bottom: 1px solid #444;
}
</style>
