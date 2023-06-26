export enum BoostedProtocol {
  Aave = 'aave',
  Agave = 'agave',
  Beefy = 'beefy',
  Euler = 'euler',
  Yearn = 'yearn',
  Gearbox = 'gearbox',
  Idle = 'idle',
  Morpho = 'morpho',
  Tessera = 'tessera',
  Sturdy = 'sturdy',
  Reaper = 'reaper',
  Tetu = 'tetu',
  Granary = 'granary',
  Zerovix = '0vix',
}

export const boostedProtocolIconPaths: Record<BoostedProtocol, string> = {
  [BoostedProtocol.Aave]: new URL(
    '@/assets/images/icons/protocols/aave.svg',
    import.meta.url
  ).href,
  [BoostedProtocol.Agave]: new URL(
    '@/assets/images/icons/protocols/agave.png',
    import.meta.url
  ).href,
  [BoostedProtocol.Beefy]: new URL(
    '@/assets/images/icons/protocols/beefy.svg',
    import.meta.url
  ).href,
  [BoostedProtocol.Euler]: new URL(
    '@/assets/images/icons/protocols/euler.svg',
    import.meta.url
  ).href,
  [BoostedProtocol.Yearn]: new URL(
    '@/assets/images/icons/protocols/yearn.svg',
    import.meta.url
  ).href,
  [BoostedProtocol.Gearbox]: new URL(
    '@/assets/images/icons/protocols/gearbox.svg',
    import.meta.url
  ).href,
  [BoostedProtocol.Idle]: new URL(
    '@/assets/images/icons/protocols/idle.svg',
    import.meta.url
  ).href,
  [BoostedProtocol.Morpho]: new URL(
    '@/assets/images/icons/protocols/morpho.svg',
    import.meta.url
  ).href,
  [BoostedProtocol.Tessera]: new URL(
    '@/assets/images/icons/protocols/tessera.svg',
    import.meta.url
  ).href,
  [BoostedProtocol.Sturdy]: new URL(
    '@/assets/images/icons/protocols/sturdy.png',
    import.meta.url
  ).href,
  [BoostedProtocol.Reaper]: new URL(
    '@/assets/images/icons/protocols/reaper.svg',
    import.meta.url
  ).href,
  [BoostedProtocol.Granary]: new URL(
    '@/assets/images/icons/protocols/granary.svg',
    import.meta.url
  ).href,
  [BoostedProtocol.Tetu]: new URL(
    '@/assets/images/icons/protocols/tetu.png',
    import.meta.url
  ).href,
  [BoostedProtocol.Zerovix]: new URL(
    '@/assets/images/icons/protocols/0vix.svg',
    import.meta.url
  ).href,
};
