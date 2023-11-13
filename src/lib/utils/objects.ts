/**
 * Given an object like:
 *
 *    const obj = { Address1: { ADDRESS2: true } }
 *
 * converts all its keys to lowercase:
 *
 *    { address1: { address2: true } }
 *
 * User by config files to enable non-case-sensitive lookups.
 */
export function convertKeysToLowerCase(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToLowerCase(item));
  }

  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      const newKey = key.toLowerCase();
      newObj[newKey] = convertKeysToLowerCase(obj[key]);
    }
  }
  return newObj;
}
