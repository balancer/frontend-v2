import i18n from '@/plugins/i18n';
import { isAddress } from '@ethersproject/address';

export function isGreaterThanOrEqualTo(min: number, msg = '') {
  return v =>
    !v ||
    parseFloat(v) >= min ||
    (msg ? msg : i18n.global.t('mustBeGreaterThan', [min]));
}

export function maxChar(maxLength: number, field = '') {
  const _field = field ? `${field} ` : '';
  return v =>
    (v || '').length <= maxLength ||
    `${_field}${i18n.global.t('mustBeLessThanChars', [maxLength])}`;
}

export function isValidAddress() {
  return v => !v || isAddress(v) || i18n.global.t('mustBeValidAddress');
}

export function isSymbol() {
  const regex = /^[0-9A-Z-]+$/;

  return v => !v || regex.test(v) || 'Must be valid symbol';
}
