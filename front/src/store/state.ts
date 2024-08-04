import { defineStore } from "pinia";
import { State } from "../interfaces/State.interface";
import { computed, ref } from "vue";

export const useStateStore = defineStore("state", () => {
  const state = ref<State>({});

  const setState = (newState: Partial<State>) => {
    state.value = { ...state.value, ...newState };
  };

  const extrapolatedClock = computed(() => state.value.ExtrapolatedClock);
  const timingStats = computed(() => state.value.TimingStats);
  const timingAppData = computed(() => state.value.TimingAppData);
  const weatherData = computed(() => state.value.WeatherData);
  const trackStatus = computed(() => state.value.TrackStatus);
  const driverList = computed(() => state.value.DriverList);
  const raceControlMessages = computed(() => state.value.RaceControlMessages);
  const sessionInfo = computed(() => state.value.SessionInfo);
  const timingData = computed(() => state.value.TimingData);
  const carData = computed(() => state.value.CarData);
  const position = computed(() => state.value.Position);
  const lapCount = computed(() => state.value.LapCount);

  const sortedDriverList = computed(() => {
    const driversArray = Object.values(state.value.DriverList || {});
    const filteredAndSortedDrivers = driversArray
      .filter((driver) => typeof driver !== "boolean")
      .sort((a, b) => a.Line - b.Line);
    return filteredAndSortedDrivers;
  });

  return {
    state,
    setState,
    extrapolatedClock,
    timingStats,
    timingAppData,
    weatherData,
    trackStatus,
    driverList,
    raceControlMessages,
    sessionInfo,
    timingData,
    carData,
    position,
    lapCount,
    sortedDriverList,
  };
});
