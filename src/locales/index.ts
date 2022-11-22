// TODO: check if this is 100% equivalent to the previous expression
const modules = import.meta.globEager('./**/*.json');

export default Object.fromEntries(
  Object.keys(modules).map(fileName => [
    fileName.replace('./', '').replace('.json', ''),
    modules[fileName].default,
  ])
);
