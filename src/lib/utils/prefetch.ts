export function extractPrefetchAssets(input: string | undefined) {
  if (!input) return [];
  // Detect strings between brackets
  const matchArray = input.match(/\[(.*?)\]/);
  if (!matchArray) return [];
  return parse(matchArray[0]).map(asset => asset.replace('"', ''));
}

function parse(match): any {
  try {
    return JSON.parse(match);
  } catch (e) {
    // If the match is not a valid JSON, we just ignore it
    return [];
  }
}
