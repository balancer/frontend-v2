export type Address = string;
export type QueryArgs = Record<string, any>;
export type QueryAttrs = Record<string, any>;
export type QueryBuilder = (
  args?: QueryArgs,
  attrs?: QueryAttrs,
  name?: string
) => Record<string, any>;

export interface SubgraphMetadata {
  id: string;
  address: string;
  metadataCID: string;
}
