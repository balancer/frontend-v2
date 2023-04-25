/**
 * This is a temporary file to be able to use new ethers-v6 utils until the complete ethers-v5 to ethers-v6 is completed.
 */

import { zeroPadBytes } from './data';

/**
 *  Encodes %%text%% as a Bytes32 string.
 *
 *  This is a temporary file to be able to use new ethers-v6 utils until the complete ethers-v5 to ethers-v6 is completed.
 *  https://docs.ethers.org/v6/api/abi/#encodeBytes32String
 *  https://docs.ethers.org/v6/migrating/#migrate-utils
 */
export function encodeBytes32String(text: string): string {
  // Get the bytes
  const bytes = toUtf8Bytes(text);

  // Check we have room for null-termination
  if (bytes.length > 31) {
    throw new Error('bytes32 string must be less than 32 bytes');
  }

  // Zero-pad (implicitly null-terminates)
  return zeroPadBytes(bytes, 32);
}

/**
 *  The stanard normalization forms.
 */
type UnicodeNormalizationForm = 'NFC' | 'NFD' | 'NFKC' | 'NFKD';

/**
 *  Returns the UTF-8 byte representation of %%str%%.
 *
 *  If %%form%% is specified, the string is normalized.
 */
function toUtf8Bytes(str: string, form?: UnicodeNormalizationForm): Uint8Array {
  if (form != null) {
    str = str.normalize(form);
  }

  const result: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);

    if (c < 0x80) {
      result.push(c);
    } else if (c < 0x800) {
      result.push((c >> 6) | 0xc0);
      result.push((c & 0x3f) | 0x80);
    } else if ((c & 0xfc00) == 0xd800) {
      i++;
      const c2 = str.charCodeAt(i);

      // Surrogate Pair
      const pair = 0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff);
      result.push((pair >> 18) | 0xf0);
      result.push(((pair >> 12) & 0x3f) | 0x80);
      result.push(((pair >> 6) & 0x3f) | 0x80);
      result.push((pair & 0x3f) | 0x80);
    } else {
      result.push((c >> 12) | 0xe0);
      result.push(((c >> 6) & 0x3f) | 0x80);
      result.push((c & 0x3f) | 0x80);
    }
  }

  return new Uint8Array(result);
}
