const ENV = process.env.VUE_APP_ENV || 'development';

const IS_DEV = ENV === 'development';
const IS_STAGING = ENV === 'staging';
const IS_PROD = ENV === 'production';

export { ENV, IS_DEV, IS_PROD, IS_STAGING };
