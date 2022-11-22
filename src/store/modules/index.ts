import camelCase from 'lodash/camelCase';

const importedModules = import.meta.globEager('./!(*.spec).ts');

const modules = {};

Object.keys(importedModules).forEach(fileName => {
  const moduleName = camelCase(fileName.replace(/(\.\/|\.ts)/g, ''));
  modules[moduleName] = importedModules[fileName].default;
});

export default modules;
