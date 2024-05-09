import '@/assets/css/tailwind.css';
import '@/assets/css/index.css';
import 'vue3-virtual-scroller/dist/vue3-virtual-scroller.css';

import { createApp } from 'vue';
import registerDirectives from '@/plugins/directives';
import { registerPlugins } from '@/plugins';
import initSentry from '@/plugins/sentry';
import Jazzicon from 'vue3-jazzicon/src/components';

import Root from './Root.vue';
import { initDependencies } from './dependencies';

initDependencies();

const app = createApp(Root);

app.component('Jazzicon', Jazzicon);

registerPlugins(app);
registerDirectives(app);
initSentry(app);

app.mount('#app');

// https://vitejs.dev/guide/build#load-error-handling
window.addEventListener('vite:preloadError', event => {
  console.log('Reloading page after new version deployment. ', { event });
  window.location.reload();
});

export default app;
