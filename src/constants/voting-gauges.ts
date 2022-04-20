import ALL_VOTING_GAUGES from '../../public/data/voting-gauges.json';

export const KOVAN_VOTING_GAUGES = ALL_VOTING_GAUGES.filter(
  gauge => gauge.network === 42
);

export const MAINNET_VOTING_GAUGES = ALL_VOTING_GAUGES.filter(
  gauge => gauge.network !== 42
);
