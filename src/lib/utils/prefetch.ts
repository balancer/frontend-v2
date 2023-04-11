export function extractPrefetchAssets(input: string | undefined) {
  if (!input) return [];
  // Detect strings between brackets
  const matchArray = input.match(/\[(.*?)\]/);
  if (!matchArray) return [];
  return JSON.parse(matchArray[0]).map(asset => asset.replace('"', ''));
}
