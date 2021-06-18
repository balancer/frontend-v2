import BigNumber from 'bignumber.js';
import pkg from '@/../package.json';
import { FixedPointNumber } from '@balancer-labs/sor2/dist/math/FixedPointNumber';
import { fnum } from '@balancer-labs/sor2/dist/math/lib/fixedPoint';

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

export function lsGet(key: string, fallback?: any) {
  const item = localStorage.getItem(`${pkg.name}.${key}`);
  return jsonParse(item, fallback);
}

export function lsRemove(key: string) {
  return localStorage.removeItem(`${pkg.name}.${key}`);
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

export function scale(input: BigNumber, decimalPlaces: number): BigNumber {
  const scalePow = new BigNumber(decimalPlaces.toString());
  const scaleMul = new BigNumber(10).pow(scalePow);
  return input.times(scaleMul);
}

export function scaleFp(
  input: FixedPointNumber,
  decimalPlaces: number
): FixedPointNumber {
  const scalePow = fnum(decimalPlaces.toString());
  const scaleMul = fnum(10).pow(scalePow);
  return input.mul(fnum(scaleMul));
}
