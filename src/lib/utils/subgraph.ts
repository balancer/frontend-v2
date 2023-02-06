import { jsonToGraphQLQuery } from 'json-to-graphql-query';

export async function subgraphRequest<T = any>({
  url,
  query,
  options = {},
}: {
  url: string;
  query: any;
  options?: any;
}): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify({ query: jsonToGraphQLQuery({ query }) }),
  });
  const { data }: { data: T } = await res.json();
  return data;
}
