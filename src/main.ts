import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura"; // This is the v4 way!
import App from "./App.vue";

const app = createApp(App);

// Configure PrimeVue v4 with the Aura preset
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: ".my-app-dark", // Optional: or 'system', false, etc.
    },
  },
});

app.mount("#app");
