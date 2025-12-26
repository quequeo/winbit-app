import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-dom/client', () => ({
  default: {
    createRoot: vi.fn(() => ({ render: vi.fn() })),
  },
}));

vi.mock('./App', () => ({
  App: () => null,
}));

describe('main', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  it('mounts the app into #root', async () => {
    const mod = await import('react-dom/client');
    await import('./main.jsx');
    expect(mod.default.createRoot).toHaveBeenCalled();
  });
});
