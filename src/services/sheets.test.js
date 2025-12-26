import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getInvestorData, getInvestorHistory } from './sheets';

describe('getInvestorData', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    global.fetch = vi.fn();
    process.env.VITE_GOOGLE_SHEETS_API_KEY = 'test-api-key';
    process.env.VITE_GOOGLE_SHEETS_ID = 'test-sheet-id';
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns error when credentials not configured', async () => {
    delete process.env.VITE_GOOGLE_SHEETS_API_KEY;
    delete process.env.VITE_GOOGLE_SHEETS_ID;

    const result = await getInvestorData('test@example.com');
    expect(result.data).toBeNull();
    expect(result.error).toBe('Google Sheets credentials not configured');
  });

  it('returns error when fetch fails', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });

    const result = await getInvestorData('test@example.com');
    expect(result.data).toBeNull();
    expect(result.error).toBe('Failed to fetch investor data');
  });

  it('returns error when no data in sheet', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ values: [] }),
    });

    const result = await getInvestorData('test@example.com');
    expect(result.data).toBeNull();
    expect(result.error).toBe('No data found in sheet');
  });

  it('returns error when investor not found (new dashboard sheet)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        values: [
          [
            'INVERSORES',
            'EMAIL',
            'CAPITAL ACTUAL',
            'REND ACUMULADO DESDE EL INICIO',
            'R.A. %',
            'RENDIMIENTO ACUMULADO ANUAL',
            'R.A.A %',
          ],
          ['001', 'other@example.com', '100', '10', '10%', '2', '2%'],
        ],
      }),
    });

    const result = await getInvestorData('test@example.com');
    expect(result.data).toBeNull();
    expect(result.error).toBe('Investor not found in database');
  });

  it('returns investor data for valid email (new dashboard sheet)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        values: [
          [
            'INVERSORES',
            'EMAIL',
            'CAPITAL ACTUAL',
            'REND ACUMULADO DESDE EL INICIO',
            'R.A. %',
            'RENDIMIENTO ACUMULADO ANUAL',
            'R.A.A %',
          ],
          ['008', 'test@example.com', '53.272', '7.934', '17,5%', '5356', '21,80%'],
        ],
      }),
    });

    const result = await getInvestorData('test@example.com');
    expect(result.error).toBeNull();
    expect(result.data.email).toBe('test@example.com');
    expect(result.data.balance).toBe(53272);
    expect(result.data.totalReturnUsd).toBe(7934);
    expect(result.data.totalReturnPct).toBe(17.5);
    expect(result.data.annualReturnUsd).toBe(5356);
    expect(result.data.annualReturnPct).toBe(21.8);
    expect(Array.isArray(result.data.historicalData)).toBe(true);
  });
});

describe('getInvestorHistory', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    global.fetch = vi.fn();
    process.env.VITE_GOOGLE_SHEETS_API_KEY = 'test-api-key';
    process.env.VITE_GOOGLE_SHEETS_ID = 'test-sheet-id';
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns history rows for investor when DASHBOARD has EMAIL', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          values: [
            [
              'INVERSORES',
              'EMAIL',
              'CAPITAL ACTUAL',
              'REND ACUMULADO DESDE EL INICIO',
              'R.A. %',
              'RENDIMIENTO ACUMULADO ANUAL',
              'R.A.A %',
            ],
            ['008', 'test@example.com', '53.272', '7.934', '17,5%', '5356', '21,80%'],
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          values: [
            ['CODIGO', 'FECHA', 'MOVIMIENTO', 'MONTO', 'SALDO PREVIO', 'SALDO POSTERIOR', 'ESTADO'],
            ['008', '15/04/2024', 'Depósito', '+USD 10.000', '25.000', '35.000', 'Completado'],
            ['001', '01/05/2024', 'Retiro', '-USD 5.000', '10.000', '5.000', 'Pendiente'],
          ],
        }),
      });

    const result = await getInvestorHistory('test@example.com');
    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      code: '008',
      movement: 'Depósito',
      amount: 10000,
      previousBalance: 25000,
      newBalance: 35000,
      status: 'Completado',
    });
  });

  it('uses CODIGOS mapping when DASHBOARD has no EMAIL', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          values: [
            [
              'INVERSORES',
              'CAPITAL ACTUAL',
              'REND ACUMULADO DESDE EL INICIO',
              'R.A. %',
              'RENDIMIENTO ACUMULADO ANUAL',
              'R.A.A %',
            ],
            ['008', '53.272', '7.934', '17,5%', '5356', '21,80%'],
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          values: [
            ['EMAIL', 'CODIGO'],
            ['test@example.com', '008'],
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          values: [
            ['CODIGO', 'FECHA', 'MOVIMIENTO', 'MONTO', 'SALDO PREVIO', 'SALDO POSTERIOR', 'ESTADO'],
            ['008', '15/04/2024', 'Depósito', '10000', '25000', '35000', 'Completado'],
          ],
        }),
      });

    const result = await getInvestorHistory('test@example.com');
    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].code).toBe('008');
  });
});
