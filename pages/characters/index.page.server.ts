import { getCharacters, initialPage } from './characterData';

export { onBeforeRender };

async function onBeforeRender() {
  const initialData = await getCharacters(initialPage);

  return {
    pageContext: {
      pageProps: {
        initialData,
      },
    },
  };
}
