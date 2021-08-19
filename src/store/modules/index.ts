import camelCase from 'lodash/camelCase';

const modules = import.meta.globEager('./*.ts');
const moduleExports = {};

for (const path in modules) {
  if (path === './index.ts') continue;
  const moduleName = camelCase(path.replace(/(\.\/|\.ts)/g, ''));
  moduleExports[moduleName] = modules[path].default;
}

export default moduleExports;
