<script setup lang="ts">

import { PropType, defineProps, toRefs, watch, ref } from 'vue';
/* import DriverComponent from './Driver.vue';
import { CarData } from '../interfaces/CarData'; */
import { TimingData, TimingDataLine } from '../interfaces/TimingData.interface';
import { DriverList } from '../interfaces/Driver.interface';

import type { BodyRowClassNameFunction, Header, Item } from "vue3-easy-data-table";
import Sector from './Sector.vue';
import { Stint } from '../interfaces/TimingAppData.interface';

interface DriverDataTable {
    position?: number;
    name?: string;
    lap?: number;
    gap?: string;
    stint?: Stint;
    sectors?: TimingDataLine;
    time?: string;
    fastestLap?: boolean;
    TeamColor?: string;
    lapTimeClass?: string;
}

const headers: Header[] = [
    { text: "Position", value: "position" },
    { text: "Name", value: "name" },
    { text: "Lap", value: "lap" },
    { text: "Interval", value: "interval" },
    { text: "GAP", value: "gap" },
    { text: "STINT", value: "stint" },
    { text: "Sectors", value: "sectors" },
    { text: "Time", value: "time" },
];

const props = defineProps({
    drivers: {
        type: Array as PropType<DriverList>,
        required: true,
        default: [],
    },
    carData: Object as PropType<CarData>,
    timingData: Object as PropType<TimingData>,
    TimingAppData: Object,
    timingStats: Object,
});

const { /* carData, */ timingData, timingStats, drivers, TimingAppData } = toRefs(props);

const driverData = ref<DriverDataTable[]>([]);
const items = ref<Item[]>([]);
const formatData = async () => {
    const drivers2: DriverDataTable[] = [];
    for (const driver of drivers.value) {
        const driverNumber = driver.RacingNumber;
        const driverTiming = timingData.value?.Lines?.[driverNumber];
        const fastestLap = timingStats.value?.Lines?.[driver.RacingNumber]?.PersonalBestLapTime?.Position == 1;

        const stints = Object.values(TimingAppData.value?.Lines?.[parseInt(driver.RacingNumber)]?.Stints);
        const currentStint = stints ? stints[stints.length - 1] : null;
        console.log(driverTiming);
        const interval =
            driverTiming?.IntervalToPositionAhead?.Value ??
            (timingData.value?.Lines?.[driverNumber]?.Stats ? timingData.value?.Lines?.[driverNumber]?.Stats[timingData?.value?.SessionPart ? timingData.value?.SessionPart - 1 : 0].TimeDifftoPositionAhead : null) ??
            timingData.value?.Lines?.[driverNumber]?.TimeDiffToPositionAhead;

        const gap =
            driverTiming?.GapToLeader ??
            (timingData.value?.Lines?.[driverNumber]?.Stats ? timingData.value?.Lines?.[driverNumber]?.Stats[timingData?.value?.SessionPart ? timingData.value?.SessionPart - 1 : 0].TimeDiffToFastest : null) ??

            timingData.value?.Lines?.[driverNumber].TimeDiffToFastest;
        let lapTimeClass = '';
        if (driverTiming?.LastLapTime?.OverallFastest) {
            lapTimeClass = 'overall-fastest';
        } else if (driverTiming?.LastLapTime?.PersonalFastest) {
            lapTimeClass = 'personal-fastest';
        }

        const driverDataItem: DriverDataTable = {
            position: driver.Line,
            lap: driverTiming?.NumberOfLaps,
            gap: gap,
            interval: interval,
            name: driver.Tla,
            stint: currentStint,
            sectors: driverTiming,
            time: driverTiming?.LastLapTime?.Value || '',
            fastestLap,
            teamColor: driver.TeamColour,
            lapTimeClass: lapTimeClass,
            retired: timingData.value?.Lines?.[driverNumber].Retired,
            stopped: timingData.value?.Lines?.[driverNumber].Stopped,
            knockedOut: timingData.value?.Lines?.[driverNumber].KnockedOut,
        };

        drivers2.push(driverDataItem);
    }

    driverData.value = drivers2;
    items.value = drivers2;
};

const isDriverKnockedOut: BodyRowClassNameFunction = (item: Item): string => {
    if (item.stopped || item.retired || item.knockedOut) return 'opacity-row';
    return '';
};

watch(drivers, async (newValue, oldValue) => {
    formatData();
});

</script>

<template>
    <div v-if="props.drivers.length > 0" class="driver-table-container">
        <EasyDataTable :headers="headers" :items="items" :hide-footer="true" table-class-name="customize-table"
            header-text-direction="center" body-text-direction="center" :body-row-class-name="isDriverKnockedOut">
            <template #item-position="{ position, teamColor }">
                <div class="posColor">
                    <p class="position">{{ position }}</p>
                    <span :style="{ backgroundColor: '#' + teamColor }" class="stats-color">&nbsp;</span>
                </div>
            </template>
            <template #item-name="{ name, fastestLap }">
                <p class="driver-name" :class="fastestLap ? 'fastest-lap' : ''">{{ name }}</p>
            </template>
            <template #item-sectors="{ sectors }">
                <Sector :line="sectors" />
            </template>
            <template #item-stint="{ stint }">
                <div class="tyre-container">
                    <img v-if="stint?.Compound" :src="'/images/tires/' + stint?.Compound.toUpperCase() + '.svg'"
                        alt="Tires Image">
                    <img v-else src="/images/tires/UNKNOWN.svg" alt="Tires Image">
                    <p>{{ stint?.TotalLaps }}</p>
                </div>
            </template>
            <template #item-time="{ time, lapTimeClass }">
                <p class="lap-time" :class="lapTimeClass">{{ time }}</p>
            </template>
            <template #item-gap="{ gap }">
                <p class="gap"> {{ gap }}</p>
            </template>
            <template #item-interval="{ interval }">
                <p class="gap"> {{ interval }}</p>
            </template>
            <template #item-lap="{ lap }">
                <p class="nlap"> {{ lap }}</p>
            </template>
        </EasyDataTable>
    </div>
</template>

<style scoped>
/* Ajustar tamaño de fuente y padding para que la tabla quepa sin scroll horizontal */
.driver-table-container {
    height: 100%;
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: #888 #2a2a2a;
}

.driver-table-container::-webkit-scrollbar {
    width: 10px;
    height: 10px;
    /* Añadido para el scrollbar horizontal */
}

.driver-table-container::-webkit-scrollbar-track {
    background: #2a2a2a;
    border-radius: 10px;
}

.driver-table-container::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 10px;
    border: 2px solid #2a2a2a;
}

.driver-table-container::-webkit-scrollbar-thumb:hover {
    background-color: #555;
}

.nlap,
.gap {
    font-size: 0.9em;
    /* Ajustado el tamaño de la fuente */
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

.posColor {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stats-color {
    width: 5px;
    display: inline-block;
    margin: 0 10px;
    height: 100%;
}

.tyre-container {
    display: flex;
    align-items: center;
    justify-content: center;
}

.tyre-container img {
    width: 18px;
    height: 18px;
}

.position {
    width: 25px;
    text-align: center;
    font-size: 1em;
}

.driver-name {
    width: 55px;
    text-align: center;
    padding: 2px;
    font-size: 1em;
}

.customize-table {
    --easy-table-border: 1px solid #445269;
    --easy-table-row-border: 1px solid #445269;

    --easy-table-header-font-size: 10px;
    --easy-table-header-font-color: #fff;
    --easy-table-header-background-color: #161616;

    --easy-table-header-item-padding: 5px 10px;

    --easy-table-body-even-row-font-color: #fff;
    --easy-table-body-even-row-background-color: #161616;

    --easy-table-body-row-font-color: #fff;
    --easy-table-body-row-background-color: #161616;
    --easy-table-body-row-height: 30px;
    --easy-table-body-row-hover-color: #282828;

    --easy-table-item-padding: 0px 5px;
    font-weight: bold;
}

.lap-time {
    font-size: 1em;
}
</style>
