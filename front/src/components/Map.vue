<template>
  <div class="map-wrapper">
    <div v-if="!points.length || !bounds[0] || !bounds[1] || !bounds[2] || !bounds[3]" class="h-full w-full p-2"
      style="min-height: 35rem;">
      <div class="h-full w-full animate-pulse rounded-lg bg-zinc-800" />
    </div>
    <svg v-else :viewBox="`${bounds[0]} ${bounds[1]} ${bounds[2]} ${bounds[3]}`" class="h-full w-full xl:max-h-screen"
      xmlns="http://www.w3.org/2000/svg">
      <path class="stroke-gray-800" :stroke-width="100" stroke-linejoin="round" fill="transparent" :d="pathD" />
      <g v-for="driverPoint in interpolatedDriverPoints" :key="driverPoint.racingNumber">
        <circle :cx="driverPoint.rotatedPosition.x" :cy="driverPoint.rotatedPosition.y" r="100"
          :fill="driverPoint.TeamColour" stroke="black" stroke-width="2" :opacity="driverPoint.inPit ? 0.5 : 1"
          class="animate-move" />
        <foreignObject :x="driverPoint.rotatedTextPosition.x + 50" :y="driverPoint.rotatedTextPosition.y - 100"
          width="600" height="400" class="animate-move">
          <div
            :style="{ color: driverPoint.TeamColour, textAlign: 'center', fontSize: '200px', fontWeight: 'bold', textShadow: '1px 1px 2px black', opacity: driverPoint.inPit ? 0.5 : 1 }">
            {{ driverPoint.driverName }}
          </div>
        </foreignObject>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, PropType, toRefs } from 'vue';
import { useStateStore } from '../store/state';
import { storeToRefs } from 'pinia';

const stateStore = useStateStore();
const { timingData, sortedDriverList, sessionInfo, position } = storeToRefs(stateStore);
const positions = computed(() => position.value?.Position[position.value?.Position.length - 1] || {});
const circuitKey = computed(() => sessionInfo.value?.Meeting.Circuit.Key || {});
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
  if (typeof circuitKey.value !== 'number') return;
  const response = await fetch(`https://api.multiviewer.app/api/v1/circuits/${circuitKey.value}/2024`);
  return await response.json();
};

const points = ref([]);
const rotation = ref(0);
const bounds = ref([null, null, null, null]);
const centerX = ref(null);
const centerY = ref(null);

const driverPoints = ref([]);
const interpolatedDriverPoints = ref([]);

const lerp = (start, end, t) => start + (end - start) * t;

const interpolatePositions = () => {
  const t = 0.05; // Adjust this value for smoother interpolation
  interpolatedDriverPoints.value = driverPoints.value.map(driverPoint => {
    const prev = driverPoint.prevPosition || driverPoint.rotatedPosition;
    const next = driverPoint.rotatedPosition;
    const newX = lerp(prev.x, next.x, t);
    const newY = lerp(prev.y, next.y, t);

    return {
      ...driverPoint,
      rotatedPosition: { x: newX, y: newY },
      rotatedTextPosition: { x: newX + 150, y: newY },
      prevPosition: next,
    };
  });
};

const updateDriverPoints = () => {
  if (Object.keys(positions.value).length > 0) {
    driverPoints.value = Object.keys(positions.value?.Entries).map(key => {
      const driver = sortedDriverList.value.find(driver => driver.RacingNumber === key);
      const teamColour = driver ? driver.TeamColour : null;
      const driverName = driver ? driver.Tla : null;
      const inPit = timingData.value.Lines[key] ? timingData.value.Lines[key].InPit : null;
      const rotatedPosition = rotate(positions.value.Entries[key].X, positions.value.Entries[key].Y, rotation.value, centerX.value, centerY.value);
      const rotatedTextPosition = rotate(positions.value.Entries[key].X + 150, positions.value.Entries[key].Y, rotation.value, centerX.value, centerY.value);
      return {
        racingNumber: key,
        TeamColour: `#${teamColour}`,
        driverName,
        inPit,
        rotatedPosition,
        rotatedTextPosition,
      };
    });
    interpolatePositions();
  }
};

const updateMapData = async () => {
  const data = await fetchMapData();
  if (!data) return;
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

watch(circuitKey, () => {
  fetchMapData();
  updateMapData();
}, { immediate: true, deep: true });

onMounted(async () => {
  await updateMapData();
  setInterval(() => {
    interpolatePositions();
  }, 100);
  setTimeout(() => {
    updateDriverPoints();
  }, 1000);
});

const pathD = computed(() => {
  if (points.value.length === 0) return '';
  return `M${points.value[0].x},${points.value[0].y} ${points.value.map((point) => `L${point.x},${point.y}`).join(' ')}`;
});
</script>

<style scoped>
svg {
  max-height: 100%;
}

.stroke-gray-800 {
  stroke: #ccc;
  filter: drop-shadow(0px 0px 150px rgba(134, 134, 134, 0.5));
}

.map-wrapper {
  border-bottom: 1px solid #444;
  height: 60%;
}

.animate-move {
  transition: cx 1s linear, cy 1s linear, x 1s linear, y 1s linear;
}

.animate-fade {
  transition: opacity 1s linear;
}
</style>
