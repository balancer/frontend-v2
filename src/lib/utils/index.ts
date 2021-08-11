import BigNumber from 'bignumber.js';
import pkg from '@/../package.json';
import { Ref } from 'vue';

export function shorten(str = '') {
  return `${str.slice(0, 6)}...${str.slice(str.length - 4)}`;
}

export async function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

export function clone(item) {
  return JSON.parse(JSON.stringify(item));
}

function lsAddVersion(value: any, version: string) {
  return {
    data: value,
    _version: version
  };
}

function lsGetKey(key: string) {
  return `${pkg.name}.${key}`;
}

export function lsSet(key: string, value: any, version?: string) {
  const data = version != null ? lsAddVersion(value, version) : value;

  return localStorage.setItem(lsGetKey(key), JSON.stringify(data));
}

export function lsGet<T = any>(
  key: string,
  defaultValue: any = null,
  version?: string
): T {
  const rawValue = localStorage.getItem(lsGetKey(key));

  if (rawValue != null) {
    try {
      const value = JSON.parse(rawValue);

      if (version != null) {
        return value._version === version ? value.data : defaultValue;
      }
      return value;
    } catch (e) {
      return defaultValue;
    }
  }

  return defaultValue;
}

export function lsRemove(key: string) {
  return localStorage.removeItem(lsGetKey(key));
}

export function getCurrentTs() {
  return parseInt((new Date().getTime() / 1e3).toString());
}

export function tsToBlockNumber(currentBlockNumber, ts) {
  const diffTs = getCurrentTs() - ts;
  return currentBlockNumber - parseInt((diffTs / 13.35).toString());
}

export function bnum(val: string | number | BigNumber): BigNumber {
  const number = typeof val === 'string' ? val : val ? val.toString() : '0';
  return new BigNumber(number);
}

export const bnumZero = bnum(0);

export function scale(input: BigNumber, decimalPlaces: number): BigNumber {
  const scalePow = new BigNumber(decimalPlaces.toString());
  const scaleMul = new BigNumber(10).pow(scalePow);
  return input.times(scaleMul);
}

export function shortenLabel(str, segLength = 4) {
  const firstSegment = str.substring(0, segLength + 2);
  const lastSegment = str.substring(str.length, str.length - segLength);
  return `${firstSegment}...${lastSegment}`;
}

/**
 * Wait for a reactive variable to change to an expected value.
 */
export async function forChange(
  reactiveVar: Ref<any>,
  expected: any,
  checkCount = 0,
  checkDelay = 500,
  checkLimit = 20
): Promise<void> {
  if (reactiveVar.value === expected || checkCount >= checkLimit) return;
  await sleep(checkDelay);
  await forChange(reactiveVar, expected, checkCount++);
}
