<script setup lang="ts">
import { watch, ref } from 'vue';
import { useStateStore } from '../store/state';
import { storeToRefs } from 'pinia';

const stateStore = useStateStore();
const { raceControlMessages } = storeToRefs(stateStore);
const sortedMessages = ref([]);

watch(raceControlMessages, (newValue) => {
    if (newValue?.Messages) {
        if (!Array.isArray(newValue.Messages)) {
            newValue.Messages = Object.values(newValue.Messages);
        }
        const newValueFormatted = newValue.Messages.map(message => {
            const date = new Date(message.Utc);
            const options = { hour: '2-digit', minute: '2-digit' };
            const timeString = date.toLocaleTimeString('en-GB', options);
            return {
                ...message,
                hour: timeString
            };
        }).sort((a, b) => new Date(b.Utc) - new Date(a.Utc)); // Orden descendente

        sortedMessages.value = newValueFormatted;
    } else {
        sortedMessages.value = [];
    }
}, { immediate: true, deep: true });
</script>

<template>
    <div class="race-control-container">
        <div class="title">Race Control Messages</div>
        <div class="race-control-messages">
            <div v-for="(message, index) in sortedMessages" :key="index" class="race-control-message">
                <span class="message-text">{{ message.Message }}</span>
                <span class="message-hour">{{ message?.hour }}</span>
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