import camelCase from 'lodash/camelCase';

const importedModules = import.meta.glob('./!(*.spec).ts', { eager: true });

const modules = {};

Object.keys(importedModules).forEach(fileName => {
  const moduleName = camelCase(fileName.replace(/(\.\/|\.ts)/g, ''));
  // @ts-ignore
  modules[moduleName] = importedModules[fileName].default;
});

export default modules;
