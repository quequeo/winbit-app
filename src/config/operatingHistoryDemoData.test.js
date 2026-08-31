import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isOperatingHistoryDemoEnabled,
  getOperatingHistoryDemoData,
} from './operatingHistoryDemoData';

vi.mock('./devAuth', () => ({
  isDevBypassEnabled: vi.fn(() => false),
}));

describe('operatingHistoryDemoData', () => {
  beforeEach(() => {
    import.meta.env.DEV = true;
    import.meta.env.VITE_OPERATING_HISTORY_DEMO = undefined;
  });

  it('exports demo rows with contracts', () => {
    const rows = getOperatingHistoryDemoData();
    expect(rows.length).toBe(5);
    expect(rows[0].contract).toBe('MBT');
  });

  it('includes recent rows for 7D range', () => {
    const rows = getOperatingHistoryDemoData();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    expect(rows.some((row) => new Date(row.date).getTime() >= weekAgo)).toBe(true);
  });

  it('is disabled outside dev', () => {
    import.meta.env.DEV = false;
    expect(isOperatingHistoryDemoEnabled()).toBe(false);
  });

  it('is enabled when VITE_OPERATING_HISTORY_DEMO is true', () => {
    import.meta.env.VITE_OPERATING_HISTORY_DEMO = 'true';
    expect(isOperatingHistoryDemoEnabled()).toBe(true);
  });

  it('stays disabled without explicit demo flag', () => {
    import.meta.env.VITE_OPERATING_HISTORY_DEMO = undefined;
    expect(isOperatingHistoryDemoEnabled()).toBe(false);
  });
});
