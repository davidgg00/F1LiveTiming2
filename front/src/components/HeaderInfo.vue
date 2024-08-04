<template>
    <header>
        <div class="wrapper">
            <div class="event-info">
                <h1>🏁 {{ gpName }}</h1>
                <h2>📍 Hungaroring, Budapest, Hungary</h2>
            </div>
            <div class="race-data">
                <div>
                    <span><span class="emoji">⏳</span> Time Left:</span>
                    <strong>{{ formattedTimeLeft }}</strong>
                </div>

                <div>
                    <div v-if="lapCount?.CurrentLap">
                        <span><span class="emoji">🏎️</span> Lap:</span>
                        <strong>{{ lapCount?.CurrentLap }}/{{ lapCount?.TotalLaps }}</strong>
                    </div>
                </div>


                <div>
                    <span><span class="emoji">🌡️</span> Air Temp:</span>
                    <strong>{{ weatherData?.AirTemp + 'ºC' }}</strong>
                </div>
                <div>
                    <span><span class="emoji">🔥</span> Track Temp:</span>
                    <strong>{{ weatherData?.TrackTemp + 'ºC' }}</strong>
                </div>
                <div>
                    <span><span class="emoji">💧</span> Humidity:</span>
                    <strong>{{ weatherData?.Humidity + '%' }}</strong>
                </div>
                <div>
                    <span><span class="emoji">🌬️</span> Wind:</span>
                    <strong>{{ weatherData?.WindSpeed }} m/s</strong>
                </div>
            </div>
        </div>


        <div>
            <div :class="['flag', formattedTrackStatus.class]">
                <span>{{ formattedTrackStatus.message }}</span>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { parseTimeStringToDate, formatDateToTimeString } from '../utils/date';
import { getTrackStatusObject } from '../utils/track';
import { useStateStore } from '../store/state';
import { storeToRefs } from 'pinia';

const stateStore = useStateStore();
const { state, timingData, extrapolatedClock, trackStatus, lapCount, weatherData } = storeToRefs(stateStore);
const endTime = ref<Date>(new Date());
const formattedTimeLeft = ref('');
const formattedTrackStatus = ref<{ class: string, message: string }>({ class: '', message: '' });
let interval: ReturnType<typeof setInterval>;
const gpName = computed(() => state.value.SessionInfo?.Meeting.Name + ' :   ' + state.value.SessionInfo?.Name + ' ' + sessionPartPrefix(state.value.SessionInfo?.Name) + '' + (timingData.value?.SessionPart && state.value.SessionInfo?.Name != 'Race' ? timingData.value?.SessionPart : '') || {});
const timeLeftSession = computed(() => extrapolatedClock.value?.Remaining || '');

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
const updateTimeLeft = () => {
    const currentTime = endTime.value;
    if (currentTime.getHours() === 0 && currentTime.getMinutes() === 0 && currentTime.getSeconds() === 0) {
        clearInterval(interval);
    } else {
        currentTime.setSeconds(currentTime.getSeconds() - 1);
        formattedTimeLeft.value = formatDateToTimeString(currentTime);
    }
};

const initializeTimeLeft = () => {
    endTime.value = parseTimeStringToDate(timeLeftSession.value);
    formattedTimeLeft.value = formatDateToTimeString(endTime.value);
};

const initializeTrackStatus = () => {
    formattedTrackStatus.value = getTrackStatusObject(trackStatus.value?.Status);
};

onMounted(() => {
    initializeTimeLeft();
    initializeTrackStatus();
    interval = setInterval(updateTimeLeft, 1000);
});

onUnmounted(() => {
    clearInterval(interval);
});

watch(timeLeftSession, initializeTimeLeft);
watch(trackStatus, initializeTrackStatus);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Roboto:wght@400;500;700&display=swap');

.wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

#lapWrapper {
    margin-top: 5px;
}

@media screen and (max-width: 1300px) {
    .race-data {
        display: none !important;
    }
}

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

    h2 {
        font-size: 0.6em !important;
    }

    p {
        font-size: 0.6em !important;
    }

    .flag {
        padding: 2.5px 5px !important;
    }
}

header {
    font-family: 'Roboto', sans-serif;
    background-color: #121212;
    color: white;
    padding: 20px 20px 20px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #444;
    max-width: 100%;
}

.race-data {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-left: 80px;
    gap: 20px;
}

.emoji {
    font-size: 20px !important;
    line-height: 1;
    margin-bottom: 5px;
}


.event-info {
    text-align: left;
}

.event-info h1 {
    margin: 0;
    font-size: 26px;
    color: #FFFFFF;
    font-weight: 700;
    font-family: 'Poppins', sans-serif;
}

.event-info h2 {
    margin: 5px 0 0 0;
    font-size: 20px;
    color: #AAAAAA;
    font-weight: 500;
    font-family: 'Poppins', sans-serif;
}

.countdown {
    display: flex;
    align-items: center;
}

.countdown div {
    text-align: center;
}

.race-data div span {
    display: block;
    font-size: 14px;
    color: #CCCCCC;
}

.countdown div strong {
    font-size: 18px;
    color: #FFFFFF;
    font-weight: 500;
}

.weather {
    display: flex;
    align-items: center;
}

.weather div {
    text-align: center;
    margin-right: 20px;
}

.weather div:last-child {
    margin-right: 0;
}

.weather div span {
    display: block;
    font-size: 14px;
    color: #CCCCCC;
}

.weather div strong {
    font-size: 18px;
    color: #FFFFFF;
    font-weight: 500;
}

.race-data div {
    display: flex;
    align-items: center;
    margin-right: 20px;
    flex-direction: column;
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
    margin: 0 20px;
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
}

.flag.red-flag {
    animation: blink 1s infinite;
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
