import { RouteLocationRaw, useRoute } from 'vue-router';

export function useReturnRoute() {
  const route = useRoute();

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

    return { name: 'home' };
  }

  return { getReturnRoute };
}
