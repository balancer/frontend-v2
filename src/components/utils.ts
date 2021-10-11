export function useClassName<T>(state: T, classes: [T, string][]) {
  return (classes.find(_class => _class[0] === state) || [])[1] || '';
}
