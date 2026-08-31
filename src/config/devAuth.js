export const isDevBypassEnabled = () =>
  import.meta.env.DEV &&
  import.meta.env.VITE_DEV_BYPASS_AUTH === 'true' &&
  Boolean(import.meta.env.VITE_DEV_USER_EMAIL);

export const getDevBypassUser = () => ({
  email: import.meta.env.VITE_DEV_USER_EMAIL,
  displayName: import.meta.env.VITE_DEV_USER_NAME || import.meta.env.VITE_DEV_USER_EMAIL,
  authMethod: 'dev',
});
