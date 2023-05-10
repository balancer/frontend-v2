export function randomAddress(): string {
  const characters = '0123456789abcdef';
  let address = '0x';

  for (let i = 0; i < 40; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    address += characters[randomIndex];
  }

  return address;
}

// popular token addresses used in unit tests
export const nativeAssetAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'; //Goerli native asset address (ETH)
export const wethAddress = '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1'; //Goerli Weth address
export const daiAddress = '0x8c9e6c40d3402480ACE624730524fACC5482798c';
export const balAddress = '0xfA8449189744799aD2AcE7e0EBAC8BB7575eff47';
export const tetherAddress = '0x1f1f156E0317167c11Aa412E3d1435ea29Dc3cCE';
export const groAddress = '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7';
