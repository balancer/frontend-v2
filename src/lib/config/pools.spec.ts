import config from './';

function getDuplicatedAddresses(poolAddresses) {
  const loweCaseAddresses = poolAddresses.map(address => address.toLowerCase());
  const duplicatedIndexes = addresses =>
    addresses.filter((address, index) => addresses.indexOf(address) !== index);
  return duplicatedIndexes(loweCaseAddresses);
}

function detectDuplicates(
  networkName: string,
  allowlistType: 'Stable' | 'Weighted' | 'Investment',
  addresses: string[]
) {
  const duplicatedPoolAddresses = getDuplicatedAddresses(addresses);
  if (duplicatedPoolAddresses.length > 0)
    throw new Error(
      `Network ${networkName}: found duplicated pool addresses in ${allowlistType} Allowlist: ${duplicatedPoolAddresses}
      Review /src/lib/config/${networkName}/pools.ts to remove duplicates.
      It could be that 2 similar allowlist PRs were created at the same time.
      `
    );
}

function detectDuplicatesInVotingList(
  networkName: string,
  addresses: string[]
) {
  const duplicatedPoolAddresses = getDuplicatedAddresses(addresses);
  if (duplicatedPoolAddresses.length > 0)
    throw new Error(
      `Network ${networkName}: found duplicated pool addresses in Stakable.VotingListPools: ${duplicatedPoolAddresses}
      Review /src/lib/config/${networkName}/pools.ts to remove duplicates.
      `
    );
}

test('Detect duplicated pool addresses in Staking.VotingGaugePools addresses', async () => {
  Object.values(config).forEach(networkConfig => {
    detectDuplicates(
      networkConfig.network,
      'Stable',
      networkConfig.pools.Stable.AllowList
    );
    detectDuplicates(
      networkConfig.network,
      'Weighted',
      networkConfig.pools.Weighted.AllowList
    );
    detectDuplicates(
      networkConfig.network,
      'Investment',
      networkConfig.pools.Investment.AllowList
    );
  });
});

test('Detect duplicated pool addresses in voting list', async () => {
  Object.values(config).forEach(networkConfig => {
    detectDuplicatesInVotingList(
      networkConfig.network,
      networkConfig.pools.Stakable.VotingGaugePools
    );
  });
});
