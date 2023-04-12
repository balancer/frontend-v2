import { router } from '.';

export interface RouteTo {
  name?: string;
}

export function resolveRoute(to: RouteTo) {
  if (!to?.name) throw new Error(`Provided route (${to}) must have name`);
  return router.resolve({ name: to.name, params: { networkSlug: 'ethereum' } })
    .matched[0].components?.default;
}
