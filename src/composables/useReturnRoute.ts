import { RouteLocationRaw, useRoute, useRouter } from 'vue-router';

export function useReturnRoute() {
  const route = useRoute();
  const router = useRouter();

  function getReturnRoute(to?: RouteLocationRaw): RouteLocationRaw {
    const queryReturnRoute = route.query?.returnRoute as string;

    if (queryReturnRoute) {
      const queryReturnParams = route.query?.returnParams as string;

      if (queryReturnParams) {
        return {
          name: queryReturnRoute,
          params: JSON.parse(queryReturnParams),
        };
      }

      return { name: queryReturnRoute };
    } else if (to) return to;

    const prevPath = router.options.history.state.back;
    if (prevPath && typeof prevPath === 'string') {
      return prevPath;
    }
    return { name: 'home' };
  }

  return { getReturnRoute };
}
