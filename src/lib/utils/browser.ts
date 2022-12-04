export enum MobileBrowser {
  Chrome = 'Chrome',
  Firefox = 'Firefox',
  Safari = 'Safari',
  Opera = 'Opera',
  Unknown = 'Unknown',
}

export function getIosBrowserName(): MobileBrowser {
  const userAgent = window.navigator.userAgent;

  if (/OPR/i.test(userAgent)) {
    return MobileBrowser.Opera;
  }

  // detect Chrome on IOS
  if (/Chrome|CriOS/i.test(userAgent)) {
    return MobileBrowser.Chrome;
  }

  // detect Firefox on IOS
  if (/Firefox|FxiOS/i.test(userAgent)) {
    return MobileBrowser.Firefox;
  }

  if (/Safari/i.test(userAgent)) {
    return MobileBrowser.Safari;
  }

  return MobileBrowser.Unknown;
}

export function setWindowLocation(url: string): void {
  const browserName = getIosBrowserName();
  const timeout =
    browserName === MobileBrowser.Chrome ||
    browserName === MobileBrowser.Firefox
      ? 100
      : 0;

  // Hack to prevent "Attempt to use history.replaceState() more than 100 times per 30 seconds" error
  setTimeout(() => {
    window.location.href = url;
    location.reload();
  }, timeout);
}
