export enum BoostedProtocol {
  Aave = 'aave',
  Euler = 'euler',
  Yearn = 'yearn',
  Gearbox = 'gearbox',
  Sturdy = 'sturdy',
  Reaper = 'reaper',
}

export const boostedProtocolIconPaths: Record<BoostedProtocol, string> = {
  [BoostedProtocol.Aave]: new URL(
    '@/assets/images/icons/protocols/aave.svg',
    import.meta.url
  ).href,
  [BoostedProtocol.Euler]: new URL(
    '@/assets/images/icons/protocols/aave.svg',
    import.meta.url
  ).href,
  [BoostedProtocol.Yearn]: new URL(
    '@/assets/images/icons/protocols/aave.svg',
    import.meta.url
  ).href,
  [BoostedProtocol.Gearbox]: new URL(
    '@/assets/images/icons/protocols/aave.svg',
    import.meta.url
  ).href,
  [BoostedProtocol.Sturdy]: new URL(
    '@/assets/images/icons/protocols/aave.svg',
    import.meta.url
  ).href,
  [BoostedProtocol.Reaper]: new URL(
    '@/assets/images/icons/protocols/aave.svg',
    import.meta.url
  ).href,
};
