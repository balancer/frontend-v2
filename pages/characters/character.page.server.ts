import { QueryClient, dehydrate } from '@tanstack/vue-query';
import type { PageContext } from '../_default/types';
import { getCharacter } from './characterData';

export { onBeforeRender };

async function onBeforeRender(pageContext: PageContext) {
  const { characterId } = pageContext.routeParams;
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(['characters', characterId], () =>
    getCharacter(characterId)
  );

  const vueQueryState = dehydrate(queryClient);

  return {
    pageContext: {
      pageProps: {
        vueQueryState,
        characterId,
      },
    },
  };
}
