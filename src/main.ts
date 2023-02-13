import '@/assets/css/tailwind.css';
import '@/assets/css/index.css';

import { createApp } from 'vue';

import Root from './Root.vue';
// import { initDependencies } from './dependencies';

// initDependencies();

const app = createApp(Root);

app.mount('#app');

export default app;
