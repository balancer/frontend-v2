export enum MobileOS {
  Android = 'Android',
  IOS = 'iOS',
  Unknown = 'Unknown',
}

export function useUserAgent() {
  /**
   * @description
   * Detect mobile operation system and resolve it as string
   *
   * @return MobileOS
   */
  function getOperationSystemName(): MobileOS {
    const userAgent = window.navigator.userAgent;

    if (/android/i.test(userAgent)) {
      return MobileOS.Android;
    }

    if (/iPad|iPhone|iPod/.test(userAgent)) {
      return MobileOS.IOS;
    }

    return MobileOS.Unknown;
  }

  const isIos = getOperationSystemName() === MobileOS.IOS;
  const isAndroid = getOperationSystemName() === MobileOS.Android;

  return {
    getOperationSystemName,
    isIos,
    isAndroid,
  };
}
