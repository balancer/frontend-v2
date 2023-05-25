import * as fs from 'fs';

export function allowListPool({
  network,
  poolType,
  poolId,
  poolDescription = '',
}) {
  const filePath = `./src/lib/config/${network}/pools.ts`;

  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // Looking for the last element in the array [poolType] > Allowlist
  const regex = new RegExp(
    `${poolType}:[\\s\\n]*{[^}]*AllowList:[\\s\n]*\\[([\\s\\S]+?)\\]`
  );

  const match = fileContent.match(regex);

  if (!match) throw Error('Pool type not found');

  const arrayContent = match[1].trim();

  if (arrayContent.includes(poolId))
    throw Error(`${poolId} is already allowlisted`);

  let updatedArrayContent = `${arrayContent} \n'${poolId}',`;

  if (poolDescription) updatedArrayContent += ` // ${poolDescription} \n`;

  // Replaces file with updated content:
  const updatedContent = fileContent.replace(arrayContent, updatedArrayContent);

  fs.writeFileSync(filePath, updatedContent);

  console.log(`💾 ${network}/pools.ts file updated.`);
}
