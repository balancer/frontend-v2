export default function useEnv() {
  const appDomain = process.env.VUE_APP_DOMAIN || 'app.balancer.fi';

  return { appDomain };
}
