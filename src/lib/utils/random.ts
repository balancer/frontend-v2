import { randomBytes } from 'crypto';
import { encodeBytes32String } from './ethers-v6';

export function generateSalt() {
  return encodeBytes32String(generateRandomAsciiCharacters(31));
}

/**
  Generates a random ASCII string with the given length
  We only use ASCII to enforce that all the strings have 1 byte size so that the resulting string will have exactly length bytes size

  Based on https://github.com/sindresorhus/crypto-random-string
**/
const generateRandomAsciiCharacters = length => {
  const asciiPrintableCharacters = [
    ...'!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
  ];
  // Generating entropy is faster than complex math operations, so we use the simplest way
  const characterCount = asciiPrintableCharacters.length;
  const maxValidSelector =
    Math.floor(0x1_00_00 / characterCount) * characterCount - 1; // Using values above this will ruin distribution when using modular division
  const entropyLength = 2 * Math.ceil(1.1 * length); // Generating a bit more than required so chances we need more than one pass will be really low
  let string = '';
  let stringLength = 0;

  while (stringLength < length) {
    // In case we had many bad values, which may happen for character sets of size above 0x8000 but close to it
    const entropy = randomBytes(entropyLength);
    let entropyPosition = 0;

    const readUInt16LE = (uInt8Array, offset) =>
      uInt8Array[offset] + (uInt8Array[offset + 1] << 8);

    while (entropyPosition < entropyLength && stringLength < length) {
      const entropyValue = readUInt16LE(entropy, entropyPosition);
      entropyPosition += 2;
      if (entropyValue > maxValidSelector) {
        // Skip values which will ruin distribution when using modular division
        continue;
      }

      string += asciiPrintableCharacters[entropyValue % characterCount];
      stringLength++;
    }
  }

  return string;
};
