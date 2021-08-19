const modules = import.meta.globEager('./*.json');
const moduleExports = {};

for (const path in modules) {
  const moduleName = path.replace(/(\.\/|\.json)/g, '');
  moduleExports[moduleName] = modules[path];
}

export default moduleExports;
