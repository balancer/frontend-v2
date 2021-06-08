const ENV = process.env.VUE_APP_ENV || 'development';

const IS_DEV = ENV === 'development';
const IS_PROD = ENV === 'production';
const IS_STAGING = ENV === 'staging';

export { IS_DEV, IS_PROD, IS_STAGING, ENV };
