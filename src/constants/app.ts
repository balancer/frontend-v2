export const APP = {
  Network: import.meta.env.VUE_APP_NETWORK || '1',
  IsGnosisIntegration: import.meta.env.VUE_APP_GNOSIS_INTEGRATION === 'true'
};
