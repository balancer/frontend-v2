import { balancer } from '@/lib/balancer.sdk';
// import { JsonRpcSigner } from '@ethersproject/providers';

export default async function mockGeneralizedJoin(
  poolId: string,
  tokenAddresses: string[],
  amounts: string[],
  signerAddress: string,
  wrapLeafTokens: boolean,
  slippage: string,
  authorisation: string
) {
  // console.log('MOCK', {
  //   poolId,
  //   tokenAddresses,
  //   amounts,
  //   signerAddress,
  //   wrapLeafTokens,
  //   slippage,
  //   signer,
  //   authorisation,
  // });

  const generalisedJoinQuery = await balancer.pools.generalisedJoin(
    poolId,
    tokenAddresses,
    amounts,
    signerAddress,
    wrapLeafTokens,
    slippage,
    authorisation
  );
  // console.log({ generalisedJoinQuery });
  return generalisedJoinQuery;
}
