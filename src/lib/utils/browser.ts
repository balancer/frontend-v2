export enum MobileOS {
  Android = 'Android',
  IOS = 'iOS',
  Unknown = 'Unknown',
}

export function getMobileOperationSystemName(): MobileOS {
  const userAgent = window.navigator.userAgent || window.navigator.vendor;

  if (/android/i.test(userAgent)) {
    return MobileOS.Android;
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return MobileOS.IOS;
  }

  return MobileOS.Unknown;
}

export function setWindowLocation(url: string): void {
  const os = getMobileOperationSystemName();
  const timeout = os === MobileOS.IOS ? 200 : 0;

  // Hack to prevent "Attempt to use history.replaceState() more than 100 times per 30 seconds" error on IOS
  setTimeout(() => {
    window.location.href = url;
    location.reload();
  }, timeout);
}
