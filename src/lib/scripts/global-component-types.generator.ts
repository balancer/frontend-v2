const parsePath = require('parse-filepath');
const requireContext = require('require-context');
// const fs = require('fs');
const path = require('path');
// import Jazzicon from 'vue3-jazzicon/src/components';

function generateGlobalComponentTypes(): void {
  const req = requireContext(
    path.resolve(__dirname, '../../components/_global'),
    true,
    /^((?!(stories|spec)).)*\.(js|ts|vue)$/i
  );

  const importStatements: string[] = [];
  const globalComponentsMapStatements: string[] = [];
  for (const filePath of req.keys()) {
    const pathObj = parsePath(filePath);
    const name = pathObj.name;
    const path = `@/components/_global/${pathObj.absolute}`;

    importStatements.push(`import ${name} from '${path}';`);

    globalComponentsMapStatements.push(`${name}: typeof ${name};`);
  }

  const importsString = importStatements.join('\n');
  const fileContent = `${importsString}\n
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
${globalComponentsMapStatements.map(s => `    ${s}`).join('\n')}
  }
}
`;
  console.log(fileContent);
  // fs.writeFileSync(`./src/types/global-components.d.ts`, )
}
generateGlobalComponentTypes();
