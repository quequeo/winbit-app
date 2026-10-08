const LEGACY_HOSTS = ['winbit-6579c.web.app', 'winbit-6579c.firebaseapp.com'];
const CURRENT_ORIGIN = 'https://app.winbit.com.ar';

// `/__/` is reserved by Firebase Hosting (Google sign-in handler); never redirect it.
export const getLegacyRedirectUrl = ({ hostname, pathname = '/', search = '', hash = '' } = {}) => {
  if (!LEGACY_HOSTS.includes(hostname)) return null;
  if (pathname.startsWith('/__/')) return null;
  return `${CURRENT_ORIGIN}${pathname}${search}${hash}`;
};
