import { UAParser } from 'ua-parser-js';

export enum OS {
  Android = 'Android',
  IOS = 'iOS',
  Unknown = 'Unknown',
}

export function useUserAgent() {
  const parser = new UAParser(window.navigator.userAgent);
  const { type } = parser.getDevice();

  const isMobile = type === 'mobile' || type === 'tablet';

  function getOS(): OS {
    const platform = parser.getOS().name;

    switch (platform) {
      case 'iOS':
        return OS.IOS;
      case 'Android':
        return OS.Android;
      default:
        return OS.Unknown;
    }
  }

  const isIos = getOS() === OS.IOS;
  const isAndroid = getOS() === OS.Android;

  return {
    isMobile,
    isIos,
    isAndroid,
  };
}
