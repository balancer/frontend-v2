import i18n from '@/plugins/i18n';
import { bnum } from '.';
import { parse, isAfter, isSameDay } from 'date-fns';
import numeral from 'numeral';
import { isAddress } from '@ethersproject/address';

export function isRequired(field = '') {
  const _field = field ? `${field} ` : 'Input ';
  return v => !!v || `${_field}${i18n.global.t('isRequired')}`;
}

export function minChar(minLength: number, field = '') {
  const _field = field ? `${field} ` : '';
  return v =>
    !v ||
    v.length >= minLength ||
    `${_field}${i18n.global.t('mustBeAtLeast', [minLength])}`;
}

export function isPositiveCheck(number: number | string) {
  return bnum(number).isGreaterThanOrEqualTo(0);
}
export function isPositive() {
  return v =>
    !v ||
    isPositiveCheck(numeral(v).value() || 0) ||
    i18n.global.t('mustBePositive');
}

export function isLessThanOrEqualTo(max: number | string, msg = '') {
  return v =>
    !v ||
    bnum(v).isLessThanOrEqualTo(max) ||
    (msg ? msg : i18n.global.t('mustBeLessThan', [max]));
}

export const isEmailCheck = email => {
  const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(String(email).toLowerCase());
};

export function isEmail() {
  return v => !v || isEmailCheck(v) || i18n.global.t('mustBeValidEmail');
}

export function isUrlCheck(input: any) {
  const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
  const nonLocalhostDomainRE = /^[^\s.]+\.\S{2,}$/;

  if (typeof input !== 'string') {
    return false;
  }

  const match = input.match(protocolAndDomainRE);
  if (!match) {
    return false;
  }

  const everythingAfterProtocol = match[1];
  if (!everythingAfterProtocol) {
    return false;
  }

  if (nonLocalhostDomainRE.test(everythingAfterProtocol)) {
    return true;
  }

  return false;
}

//checks for dates in YYYY-MM-DD format
export function isDateCheck(date: string) {
  if (date.length !== 10) {
    return false;
  }

  const result = parse(date, 'yyyy-MM-dd', new Date());

  if (isNaN(result.getTime())) {
    return false;
  }

  return isAfter(result, new Date()) || isSameDay(result, new Date());
}

export function isTimeCheck(time: string) {
  if (time.length !== 5) {
    return false;
  }

  const result = parse(time, 'HH:mm', new Date());

  return !isNaN(result.getTime());
}

export function isValidAddress() {
  return v => !v || isAddress(v) || i18n.global.t('mustBeValidAddress');
}
