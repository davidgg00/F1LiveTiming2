import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";

import Vue3EasyDataTable from "vue3-easy-data-table";
import "vue3-easy-data-table/dist/style.css";

const app = createApp(App);
const pinia = createPinia();
// Registra el componente globalmente
app.use(pinia);
app.component("EasyDataTable", Vue3EasyDataTable);

// Monta la aplicación en el elemento con el id 'app'
app.mount("#app");
