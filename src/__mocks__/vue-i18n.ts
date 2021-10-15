export function useI18n() {
  return {
    useI18n: jest.fn().mockImplementation(() => {
      return {
        t: jest.fn().mockImplementation()
      };
    })
  };
}
