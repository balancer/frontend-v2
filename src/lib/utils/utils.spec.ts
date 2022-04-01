import { Path } from 'vue-i18n';

import { formatWordListAsSentence } from '.';

describe('Utils', () => {
  function t(key: Path | number): string {
    return String(key);
  }
  describe('When using formatWordListAsSentence', () => {
    it('should convert a list of words to sentence format with more than 1 word', () => {
      const words = ['USD', 'BAL', 'MKR'];
      const formatted = formatWordListAsSentence(words, t);

      expect(formatted).toStrictEqual('USD, BAL and MKR');
    });

    it('should return just the first word if there is only one word in the list', () => {
      const words = ['USD'];
      const formatted = formatWordListAsSentence(words, t);

      expect(formatted).toStrictEqual('USD');
    });

    it('should return an empty string if there are no words', () => {
      const words = [];
      const formatted = formatWordListAsSentence(words, t);

      expect(formatted).toStrictEqual('');
    });
  });
});
