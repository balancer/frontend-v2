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

export interface SubgraphMetadataCID {
  typename: string;
  value: string;
  key: string;
  description: string;
}

export interface SubgraphMetadataIPFS {
  poolId: string;
  metadata: SubgraphMetadataCID[];
}
