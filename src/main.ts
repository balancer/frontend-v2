import { createApp } from 'vue';

import Root from './Root.vue';
// import { initDependencies } from './dependencies';

// initDependencies();

const app = createApp(Root);

app.mount('#app');

export default app;
