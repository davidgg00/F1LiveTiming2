<template>
    <header>
        <div>
            <h1>{{ gpName }}</h1>
            <p>{{ formattedTimeLeft }}</p>
        </div>

        <div>
            <div :class="['flag', formattedTrackStatus.class]">
                <span>{{ formattedTrackStatus.message }}</span>
            </div>
            <div v-if="lapCount?.CurrentLap">
                <span class="lapCount">{{ lapCount.CurrentLap }} / {{ lapCount.TotalLaps }}</span>
            </div>
        </div>

    </header>
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted, onUnmounted, toRefs, watch } from 'vue';
import { parseTimeStringToDate, formatDateToTimeString } from '../utils/date';
import { getTrackStatusObject } from '../utils/track';

const props = defineProps({
    gpName: String,
    timeLeftSession: String,
    trackStatus: Object,
    lapCount: Object,
});


const { gpName, timeLeftSession, trackStatus, lapCount } = toRefs(props);
const endTime = ref(new Date());
const formattedTimeLeft = ref('');

const formattedTrackStatus = ref({})

let interval: ReturnType<typeof setInterval>;

onMounted(() => {
    endTime.value = parseTimeStringToDate(timeLeftSession.value);
    formattedTimeLeft.value = formatDateToTimeString(endTime.value);
    formattedTrackStatus.value = getTrackStatusObject(trackStatus.value?.Status);
    interval = setInterval(() => {
        const currentTime = endTime.value;

        if (
            currentTime.getHours() === 0 &&
            currentTime.getMinutes() === 0 &&
            currentTime.getSeconds() === 0
        ) {
            clearInterval(interval);
        } else {
            currentTime.setSeconds(currentTime.getSeconds() - 1);
            formattedTimeLeft.value = formatDateToTimeString(currentTime);
        }

    }, 1000);
});


onUnmounted(() => {
    clearInterval(interval);
});

watch(timeLeftSession, () => {
    endTime.value = parseTimeStringToDate(timeLeftSession.value);
    formattedTimeLeft.value = formatDateToTimeString(endTime.value);
});

watch(trackStatus, () => {
    formattedTrackStatus.value = getTrackStatusObject(trackStatus.value?.Status);
});
</script>

<style scoped>
@media screen and (max-width: 1150px) {
    h1 {
        font-size: 1em !important;
    }

    p {
        font-size: 0.8em !important;
    }

    .flag {
        padding: 5px 10px !important;
    }

    header {
        padding: 15px;
    }
}

@media screen and (max-width: 500px) {
    h1 {
        font-size: 0.8em !important;
    }

    p {
        font-size: 0.6em !important;
    }

    .flag {
        padding: 2.5px 5px !important;
    }
}

header {
    background-color: #1c1c1c;
    color: white;
    text-align: center;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #444;
}

h1 {
    font-size: 1.8em;
    margin: 0;
}

p {
    margin: 5px 0 0;
    font-size: 1.2em;
}

.flag {
    padding: 10px 20px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s;
}

.flag span,
.lapCount {
    font-size: 1.2em;
    font-weight: bold;
    margin: 0 10px;
}

.flag:hover {
    transform: scale(1.05);
}

.yellow-flag {
    background: #FFF400;
    color: #000;
}

.green-flag {
    background: #00C317;
    color: #fff;
}

.red-flag {
    background: #F5002B;
    color: #fff;
}

.flag.yellow-flag {
    animation: pulse 1s infinite alternate;
    /* Animación para el flag amarillo */
}

.flag.red-flag {
    animation: blink 1s infinite;
    /* Animación para el flag rojo */
}

@keyframes pulse {
    from {
        opacity: 1;
    }

    to {
        opacity: 0.5;
    }
}

@keyframes blink {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}
</style>
