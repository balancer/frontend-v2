export function isRequired(field = '') {
  const _field = field ? `${field} ` : '';
  return v => !!v || `${_field}is required`;
}

export function minChar(minLength: number, field = '') {
  const _field = field ? `${field} ` : '';
  return v =>
    !v ||
    v.length >= minLength ||
    `${_field}must be at least ${minLength} characters`;
}

export function isSameAs(val: string, field = '') {
  return v => !v || v === val || `must be the same as ${field}`;
}

export function isNumberCheck(val) {
  return !isNaN(parseFloat(val)) && isFinite(val);
}
export function isNumber() {
  return v => !v || isNumberCheck(v) || 'must be a valid number';
}

export function isInt() {
  return v => !v || Number.isInteger(parseFloat(v)) || 'must be integer';
}

export function isPositiveCheck(number: number) {
  return number >= 0;
}
export function isPositive() {
  return v => !v || isPositiveCheck(v) || 'must be a positive number';
}

export function isLessThanOrEqualTo(max: number, msg = '') {
  return v =>
    !v || parseFloat(v) <= max || (msg ? msg : `must be less than ${max}`);
}

export const isEmailCheck = email => {
  const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(String(email).toLowerCase());
};

export function isEmail() {
  return v => !v || isEmailCheck(v) || 'Must be a valid email';
}
