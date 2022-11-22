import { App } from 'vue';

export async function registerGlobalComponents(app: App): Promise<void> {
  // Load global components from @/components/_global
  const modules = import.meta.globEager([
    '@/components/_global/**/*.{js,ts,vue}',
    '!@/components/_global/**/*.spec.ts',
    '!@/components/_global/**/*.stories.ts',
  ]);

  for (const filePath of Object.keys(modules)) {
    const excludedPatterns = ['.spec.', '.stories.'];
    if (excludedPatterns.some(pattern => filePath.includes(pattern))) continue;
    const componentName = getComponentName(filePath);
    // Ignore composables
    if (componentName.startsWith('use')) continue;

    const componentConfig = modules[filePath];
    app.component(componentName, componentConfig.default || componentConfig);
  }
}

function getComponentName(filePath) {
  return filePath.split('/').pop().split('.')[0];
}
