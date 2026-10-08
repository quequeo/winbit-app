import { describe, it, expect } from 'vitest';
import { getLegacyRedirectUrl } from './legacyHostRedirect';

describe('getLegacyRedirectUrl', () => {
  it('redirects the legacy web.app host to the current domain', () => {
    expect(getLegacyRedirectUrl({ hostname: 'winbit-6579c.web.app', pathname: '/' })).toBe(
      'https://app.winbit.com.ar/',
    );
  });

  it('redirects the legacy firebaseapp.com host', () => {
    expect(
      getLegacyRedirectUrl({ hostname: 'winbit-6579c.firebaseapp.com', pathname: '/login' }),
    ).toBe('https://app.winbit.com.ar/login');
  });

  it('preserves path, query string and hash', () => {
    expect(
      getLegacyRedirectUrl({
        hostname: 'winbit-6579c.web.app',
        pathname: '/history',
        search: '?tab=2',
        hash: '#top',
      }),
    ).toBe('https://app.winbit.com.ar/history?tab=2#top');
  });

  it('never redirects the Firebase reserved /__/ paths', () => {
    expect(
      getLegacyRedirectUrl({
        hostname: 'winbit-6579c.firebaseapp.com',
        pathname: '/__/auth/handler',
      }),
    ).toBeNull();
  });

  it('does not redirect the current domain or local hosts', () => {
    expect(getLegacyRedirectUrl({ hostname: 'app.winbit.com.ar', pathname: '/' })).toBeNull();
    expect(getLegacyRedirectUrl({ hostname: 'localhost', pathname: '/' })).toBeNull();
    expect(getLegacyRedirectUrl()).toBeNull();
  });
});
