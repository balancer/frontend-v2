export enum Protocol {
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
  Gyro = 'gyro',
  Eigenlayer = 'eigenlayer',
}

export const protocolIconPaths: Record<Protocol, string> = {
  [Protocol.Eigenlayer]: new URL(
    '@/assets/images/icons/protocols/eigenlayer.jpg',
    import.meta.url
  ).href,
  [Protocol.Aave]: new URL(
    '@/assets/images/icons/protocols/aave.svg',
    import.meta.url
  ).href,
  [Protocol.Agave]: new URL(
    '@/assets/images/icons/protocols/agave.png',
    import.meta.url
  ).href,
  [Protocol.Beefy]: new URL(
    '@/assets/images/icons/protocols/beefy.svg',
    import.meta.url
  ).href,
  [Protocol.Euler]: new URL(
    '@/assets/images/icons/protocols/euler.svg',
    import.meta.url
  ).href,
  [Protocol.Yearn]: new URL(
    '@/assets/images/icons/protocols/yearn.svg',
    import.meta.url
  ).href,
  [Protocol.Gearbox]: new URL(
    '@/assets/images/icons/protocols/gearbox.svg',
    import.meta.url
  ).href,
  [Protocol.Idle]: new URL(
    '@/assets/images/icons/protocols/idle.svg',
    import.meta.url
  ).href,
  [Protocol.Morpho]: new URL(
    '@/assets/images/icons/protocols/morpho.svg',
    import.meta.url
  ).href,
  [Protocol.Tessera]: new URL(
    '@/assets/images/icons/protocols/tessera.svg',
    import.meta.url
  ).href,
  [Protocol.Sturdy]: new URL(
    '@/assets/images/icons/protocols/sturdy.png',
    import.meta.url
  ).href,
  [Protocol.Reaper]: new URL(
    '@/assets/images/icons/protocols/reaper.svg',
    import.meta.url
  ).href,
  [Protocol.Granary]: new URL(
    '@/assets/images/icons/protocols/granary.svg',
    import.meta.url
  ).href,
  [Protocol.Tetu]: new URL(
    '@/assets/images/icons/protocols/tetu.png',
    import.meta.url
  ).href,
  [Protocol.Zerovix]: new URL(
    '@/assets/images/icons/protocols/0vix.svg',
    import.meta.url
  ).href,
  [Protocol.Gyro]: new URL(
    '@/assets/images/icons/protocols/gyro.png',
    import.meta.url
  ).href,
};
