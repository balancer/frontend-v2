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

export function isLessThanOrEqualTo(max: number) {
  return v => !v || parseFloat(v) <= max || `must be less than ${max}`;
}
