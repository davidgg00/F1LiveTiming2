<script setup lang="ts">
import { /* ref, */ defineProps, toRefs, computed, PropType } from 'vue';
import { CarData as CarDataInterface } from '../interfaces/CarData.interface';
import Sector from './Sector.vue';
import { Driver as DriverInterface } from '../interfaces/Driver.interface';
import { TimingData as TimingDataInterface } from '../interfaces/TimingData.interface';
import { TimingAppData } from '../interfaces/TimingAppData.interface';
import { TimingStats } from '../interfaces/TimingStats.interface';

//receive driver prop
const props = defineProps({
    driver: {
        type: Object as PropType<DriverInterface>,
        required: true,
    },
    carData: {
        type: Object as PropType<CarDataInterface>,
        required: true,
    },
    timingData: {
        type: Object as PropType<TimingDataInterface>,
        required: true,
    },
    timingAppData: {
        type: Object as PropType<TimingAppData>,
        required: true,
    },
    timingStats: {
        type: Object as PropType<TimingStats>,
        required: true,
    },
});



const { driver, carData, timingData, timingAppData, timingStats } = toRefs(props);
const drsEnabledValues = [10, 12, 14];
const speed = computed(() => {
    const lengthCarDataEntries = carData.value?.Entries?.length;
    /* carData.value.Entries[lengthCarDataEntries].Cars["1"].Channels["0"]  */
    return `${carData.value.Entries[lengthCarDataEntries - 1].Cars[driver.value.RacingNumber]?.Channels[2]}km/h`;
});

const driverTiming = computed(() => {
    return timingData.value?.Lines?.[driver.value.RacingNumber];
});

const currentStint = computed(() => {
    const stints = Object.values(timingAppData.value?.Lines?.[parseInt(driver.value.RacingNumber)]?.Stints);
    const currentStint = stints ? stints[stints.length - 1] : null;

    return currentStint;
});

const fastestLap = computed(() => {
    if (timingStats.value?.Lines?.[driver.value.RacingNumber]?.PersonalBestLapTime?.Position == 1) {
        return 'fastest-lap';
    }

    return '';
})

const drs = computed(() => {
    const lengthCarDataEntries = carData.value?.Entries?.length;
    if (drsEnabledValues.includes(carData.value.Entries[lengthCarDataEntries - 1].Cars[driver.value.RacingNumber]?.Channels[45]))
        return 'Enabled';
    else
        return 'Disabled';
    return carData.value.Entries[lengthCarDataEntries - 1].Cars[driver.value.RacingNumber].Channels[45];
    return `${carData.value.Entries[lengthCarDataEntries - 1].Cars[driver.value.RacingNumber]}`;
});

const lapTimeClass = computed(() => {
    if (driverTiming.value?.LastLapTime?.OverallFastest) {
        return 'overall-fastest';
    } else if (driverTiming.value?.LastLapTime?.PersonalFastest) {
        return 'personal-fastest';
    } {
        return '';
    }
});

</script>

<template>
    <div class="driver-data">
        <p class="position">{{ driver.Line }}</p>
        <span :style="{ backgroundColor: '#' + driver.TeamColour }" class="stats-color">&nbsp;</span>
        <p class="driver-name" :class="fastestLap">{{ driver.Tla }}</p>
        <p class="nlap">L {{ driverTiming?.NumberOfLaps }}</p>
        <p class="gap"> {{ driverTiming?.TimeDiffToFastest }}</p>
        <div class="tyre-container">
            <img v-if="currentStint?.Compound" :src="'/images/tires/' + currentStint?.Compound.toUpperCase() + '.svg'"
                alt="Tires Image">
            <img v-else src="/images/tires/UNKNOWN.svg" alt="Tires Image">
            <p>{{ currentStint?.TotalLaps }}</p>
        </div>
        <Sector :line="driverTiming" />
        <p class="lap-time" :class="lapTimeClass">{{ driverTiming.LastLapTime.Value || '--' }}</p>
    </div>
</template>


<style scoped>
.driver-data {
    display: flex;
    align-items: center;
    width: 100%;
    font-weight: bold;
    border-bottom: 1px solid #444;
    padding: 10px 0;
    background-color: #1a1a1a;
    color: #fff;
    transition: background-color 0.3s;
}

.driver-data:hover {
    background-color: #333;
}

.position {
    width: 30px;
    text-align: center;
    font-size: 1.2em;
}

.stats-color {
    width: 5px;
    height: 30px;
    display: inline-block;
    margin: 0 10px;
}

.driver-name {
    width: 80px;
    text-align: center;
    font-size: 1.1em;
    padding: 5px;
}

.nlap,
.gap {
    width: 60px;
    text-align: center;
    font-size: 0.9em;
}

.tyre-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
}

.tyre-container img {
    width: 25px;
    height: 25px;
    margin-right: 5px;
}

.lap-time {
    width: 90px;
    text-align: center;
    font-size: 1em;
    padding: 5px;
    margin-left: auto;
}

.personal-fastest {
    color: #00ff00;
}

.overall-fastest {
    color: #ff00ff;
}

.fastest-lap {
    background-color: #800080;
    color: #fff;
    padding: 2px 5px;
    border-radius: 5px;
}

.driver-name.fastest-lap {
    padding: 5px;
    border-radius: 5px;
}
</style>
