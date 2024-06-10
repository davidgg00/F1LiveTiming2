import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

const app = createApp(App);

// Registra el componente globalmente
app.component('EasyDataTable', Vue3EasyDataTable);

// Monta la aplicación en el elemento con el id 'app'
app.mount('#app');
