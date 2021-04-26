const PAIRS = 'pairs';

interface Pair {
  inputAsset: string;
  outputAsset: string;
}

export default class Storage {
  static saveInputAsset(chainId: number, asset: string): void {
    const pairs = getPairs();
    pairs[chainId].inputAsset = asset;
    localStorage.setItem(PAIRS, JSON.stringify(pairs));
  }

  static saveOutputAsset(chainId: number, asset: string): void {
    const pairs = getPairs();
    pairs[chainId].outputAsset = asset;
    localStorage.setItem(PAIRS, JSON.stringify(pairs));
  }

  static getPair(chainId: number): Pair {
    const pairs = getPairs();
    return pairs[chainId];
  }
}

function getPairs() {
  const defaultPairs = {
    1: {
      inputAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      outputAsset: '0xba100000625a3754423978a60c9317c58a424e3D'
    },
    42: {
      inputAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      outputAsset: '0x41286Bb1D3E870f3F750eB7E1C25d7E48c8A1Ac7'
    }
  };

  const pairstring = localStorage.getItem(PAIRS);
  const pairs = JSON.parse(pairstring || '{}');
  return {
    ...defaultPairs,
    ...pairs
  };
}
