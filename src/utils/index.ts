import pkg from '../../package.json';

export function shorten(str = '') {
  return `${str.slice(0, 6)}...${str.slice(str.length - 4)}`;
}

export function jsonParse(input, fallback?) {
  if (typeof input !== 'string') {
    return fallback || {};
  }
  try {
    return JSON.parse(input);
  } catch (err) {
    return fallback || {};
  }
}

export async function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

export function clone(item) {
  return JSON.parse(JSON.stringify(item));
}

export function lsSet(key: string, value: any) {
  return localStorage.setItem(`${pkg.name}.${key}`, JSON.stringify(value));
}

export function lsGet(key: string) {
  const item = localStorage.getItem(`${pkg.name}.${key}`);
  return jsonParse(item, '');
}

export function lsRemove(key: string) {
  return localStorage.removeItem(`${pkg.name}.${key}`);
}

export function getInjected() {
  const web3: any = window['ethereum'];
  if (!web3) return;
  let injected = { name: 'Injected', id: 'web3' };
  if (web3.isMetaMask) injected = { name: 'MetaMask', id: 'metamask' };
  if (web3.isTrust) injected = { name: 'Trust Wallet', id: 'trustwallet' };
  if (web3.isStatus) injected = { name: 'Status', id: 'status' };
  if (web3.isFrame) injected = { name: 'Frame', id: 'frame' };
  return injected;
}
