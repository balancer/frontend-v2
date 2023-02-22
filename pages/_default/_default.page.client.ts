import { createPageApp } from './app';
import { PageContext } from './types';

import '@/assets/css/tailwind.css';

export async function render(pageContext: PageContext) {
  //app is declared in _default.page.server
  const isSPA = document.getElementById('app')?.innerHTML === '';
  const app = createPageApp(pageContext, isSPA);
  app.mount('#app');
}
