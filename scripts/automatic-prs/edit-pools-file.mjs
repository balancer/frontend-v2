import * as fs from 'fs';

export function allowListPool({
  network,
  allowListType,
  poolAddress,
  comment = '',
}) {
  const filePath = `./src/lib/config/${network}/pools.ts`;

  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // Looking for the last element in the array [allowListType] > Allowlist
  const regex = new RegExp(
    `${allowListType}:[\\s\\n]*{[^}]*AllowList:[\\s\n]*\\[([\\s\\S]+?)\\]`
  );

  const match = fileContent.match(regex);

  if (!match) throw Error('Pool type not found');

  const arrayContent = match[1].trim();

  let updatedArrayContent = `${arrayContent} \n'${poolAddress}'`;

  if (comment) updatedArrayContent += ` // ${comment} \n`;

  // Replaces file with updated content:
  const updatedContent = fileContent.replace(arrayContent, updatedArrayContent);

  fs.writeFileSync(filePath, updatedContent);

  console.log(`💾 ${network}/pools.ts file updated.`);
}
