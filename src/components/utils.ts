export function getActiveClassName<T>(state: T, classes: [T, string][]) {
  return (classes.find(_class => _class[0] === state) || [])[1] || '';
}
