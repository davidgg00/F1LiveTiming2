<script setup lang="ts">
import { defineProps, toRefs, PropType, watch, ref } from 'vue';
import { RaceControlMessages } from '../interfaces/RaceControlMessages.interface';

const props = defineProps({
    raceControlMessages: {
        type: Object as PropType<RaceControlMessages>,
        required: true
    }
});

const { raceControlMessages } = toRefs(props);

/* const sortedMessages = computed(() => {
    return raceControlMessages.value?.Messages?.sort((a, b) => a.Utc - b.Utc);
}); */

const sortedMessages = ref([]);

watch(raceControlMessages, (newValue) => {
    const newValueFormatted = newValue?.Messages?.map(message => {
        const date = new Date(message.Utc);
        return {
            ...message,
            hour: `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`
        };
    }).sort((a, b) => new Date(b.Utc).getTime() - new Date(a.Utc).getTime()); // Orden descendente
    sortedMessages.value = newValueFormatted;
}, { immediate: true, deep: true });
</script>

<template>
    <div class="race-control-container">
        <div class="title">Race Control Messages</div>
        <div class="race-control-messages">
            <div v-for="(message, index) in raceControlMessages" :key="index" class="race-control-message">
                <span class="message-text">{{ message.Message }}</span>
                <span class="message-hour">{{ message.hour }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
@media screen and (max-width: 1150px) {
    .race-control-messages {
        padding: 10px !important;
    }

    .message-text {
        font-size: 0.8em !important;
    }

    .message-hour {
        font-size: 0.7em !important;
    }
}

.race-control-container {
    width: 99%;
    margin: 0 auto;
    font-family: Arial, sans-serif;
    background-color: #161616;
    padding: 20px 0px;
    border-radius: 10px;
    height: 20%;
}

.title {
    text-align: center;
    font-size: 1.5em;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 20px;
}

.race-control-messages {
    max-height: 400px;
    overflow-y: auto;
    padding-right: 10px;
}

.race-control-messages::-webkit-scrollbar {
    width: 12px;
}

.race-control-messages::-webkit-scrollbar-track {
    background: #2a2a2a;
    border-radius: 10px;
}

.race-control-messages::-webkit-scrollbar-thumb {
    background-color: #4a4a4a;
    border-radius: 10px;
    border: 3px solid #2a2a2a;
}

.race-control-message {
    background-color: #333333;
    border: 1px solid #444444;
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.message-text {
    font-size: 1.2em;
    color: #ffffff;
}

.message-hour {
    font-size: 0.9em;
    color: #aaaaaa;
    font-style: italic;
}
</style>