import { pipeToWebWritable, pipeToNodeWritable } from '@vue/server-renderer';

import { escapeInject, stampPipe } from 'vite-plugin-ssr';
import { createPageApp } from './app';
import type { Writable } from 'stream';
import { PageContext } from './types';
import { App } from 'vue';

// By default we do not want to pre-render our pages.
// This makes pre-rendering opt-in by adding `doNotPrerender = false` to pages.
export const doNotPrerender = true;

export { render };
export { passToClient };

// See https://vite-plugin-ssr.com/data-fetching
const passToClient = ['urlParsed', 'pageProps', 'is404'];

async function render(pageContext: PageContext) {
  // This will be logged in the server console (not in the browser)
  const title = pageContext.exports.title
    ? pageContext.exports.title + ' — '
    : '';

  const faviconUrl = import.meta.env.BASE_URL + 'favicon.ico';

  const app = createPageApp(pageContext, false);

  const pageHtml = generatePageHtml(app, pageContext);

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1">

      <title>${title}vite-plugin-ssr</title>
      <link rel="icon" href="${faviconUrl}">

    </head>
      <body>
        <div id="app">${pageHtml}</div>
      </body>
    </html>`;

  return {
    documentHtml,
    pageContext: {
      enableEagerStreaming: true,
    },
  };
}

// https://github.com/cloudflare/wrangler2/issues/1481
// https://community.cloudflare.com/t/how-to-detect-the-cloudflare-worker-runtime/293715
function isWorker() {
  return (
    // @ts-ignore
    typeof WebSocketPair !== 'undefined' || typeof caches !== 'undefined'
  );
}

function generatePageHtml(app: App<Element>, pageContext: PageContext) {
  // In case of SPA the server does not render anything
  if (!pageContext.Page) return '';

  // Streaming is optional: we can use renderToString() instead.
  const pipe = isWorker()
    ? (writable: WritableStream) => {
        pipeToWebWritable(app, {}, writable);
      }
    : // While developing, we use Vite's development sever instead of a Cloudflare worker. Instead of `pipeToNodeWritable()`, we could as well use `renderToString()`.
      (writable: Writable) => {
        pipeToNodeWritable(app, {}, writable);
      };

  stampPipe(pipe, isWorker() ? 'web-stream' : 'node-stream');
  return pipe;
}
