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

  it('propagates error when DASHBOARD returns 500 (no fallback)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await getInvestorData('test@example.com');
    expect(result.data).toBeNull();
    expect(result.error).toBe('Failed to fetch investor data');
  });

  it('falls back to first sheet when DASHBOARD returns 400', async () => {
    global.fetch.mockRejectedValueOnce({ status: 400 }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        values: [
          ['email', 'name', 'balance', 'totalInvested', 'returns'],
          ['test@example.com', 'Ana', '5000', '4000', '1000'],
        ],
      }),
    });

    const result = await getInvestorData('test@example.com');
    expect(result.error).toBeNull();
    expect(result.data.email).toBe('test@example.com');
    expect(result.data.balance).toBe(5000);
  });

  it('returns error when dashboard sheet columns not configured', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        values: [
          ['INVERSORES', 'EMAIL', 'CAPITAL ACTUAL'],
          ['001', 'test@example.com', '100'],
        ],
      }),
    });

    const result = await getInvestorData('test@example.com');
    expect(result.data).toBeNull();
    expect(result.error).toBe('Dashboard sheet columns not configured');
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

  it('falls back to investorCode when DASHBOARD has no EMAIL column and investor not found by email', async () => {
    const dashboardNoEmail = {
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
    };
    const inversoresWithMapping = {
      ok: true,
      json: async () => ({
        values: [
          ['EMAIL', 'CODIGO', 'NOMBRE'],
          ['test@example.com', '008', 'Juan'],
        ],
      }),
    };
    const historialSheet = {
      ok: true,
      json: async () => ({
        values: [
          ['CODIGO', 'FECHA', 'MOVIMIENTO'],
          ['008', '15/04/2024', 'Depósito'],
        ],
      }),
    };
    global.fetch
      .mockResolvedValueOnce(dashboardNoEmail)
      .mockResolvedValueOnce(dashboardNoEmail)
      .mockResolvedValueOnce(inversoresWithMapping)
      .mockResolvedValueOnce(inversoresWithMapping)
      .mockResolvedValueOnce(historialSheet);

    const result = await getInvestorData('test@example.com');
    expect(result.error).toBeNull();
    expect(result.data.email).toBe('test@example.com');
    expect(result.data.name).toBe('Juan');
    expect(result.data.balance).toBe(53272);
  });

  it('returns investor data via legacy parsing when DASHBOARD sheet missing', async () => {
    global.fetch.mockRejectedValueOnce({ status: 404 }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        values: [
          ['email', 'name', 'balance', 'totalInvested', 'returns', 'd1', 'd2', 'd3'],
          ['test@example.com', 'Juan', '1000', '800', '200', '800', '900', '1000'],
        ],
      }),
    });

    const result = await getInvestorData('test@example.com');
    expect(result.error).toBeNull();
    expect(result.data.email).toBe('test@example.com');
    expect(result.data.name).toBe('Juan');
    expect(result.data.balance).toBe(1000);
    expect(result.data.totalInvested).toBe(800);
    expect(result.data.returns).toBe(200);
    expect(result.data.historicalData).toHaveLength(3);
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

  it('returns error when history sheet columns not configured', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          values: [
            ['INVERSORES', 'EMAIL', 'CAPITAL ACTUAL'],
            ['008', 'test@example.com', '100'],
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          values: [
            ['CODIGO', 'FECHA'],
            ['008', '15/04/2024'],
          ],
        }),
      });

    const result = await getInvestorHistory('test@example.com');
    expect(result.data).toBeNull();
    expect(result.error).toBe('History sheet columns not configured');
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

  it('returns error when credentials not configured', async () => {
    delete process.env.VITE_GOOGLE_SHEETS_API_KEY;
    delete process.env.VITE_GOOGLE_SHEETS_ID;

    const result = await getInvestorHistory('test@example.com');
    expect(result.data).toBeNull();
    expect(result.error).toBe('Google Sheets credentials not configured');
  });

  it('returns error when history sheet has no data', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          values: [
            ['INVERSORES', 'EMAIL', 'CAPITAL ACTUAL'],
            ['008', 'test@example.com', '53.272'],
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ values: [] }),
      });

    const result = await getInvestorHistory('test@example.com');
    expect(result.data).toBeNull();
    expect(result.error).toBe('No data found in sheet');
  });

  it('returns error when history sheet columns not configured', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          values: [
            ['INVERSORES', 'EMAIL', 'CAPITAL ACTUAL'],
            ['008', 'test@example.com', '53.272'],
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          values: [
            ['CODIGO', 'FECHA'], // Missing MOVIMIENTO, MONTO, SALDO PREVIO, SALDO POSTERIOR, ESTADO
          ],
        }),
      });

    const result = await getInvestorHistory('test@example.com');
    expect(result.data).toBeNull();
    expect(result.error).toBe('History sheet columns not configured');
  });

  it('rethrows when INVERSORES returns 500', async () => {
    const err500 = new Error('Server error');
    err500.status = 500;
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          values: [
            ['INVERSORES', 'CAPITAL ACTUAL'],
            ['001', '100'],
          ],
        }),
      })
      .mockRejectedValueOnce(err500);

    const result = await getInvestorHistory('test@example.com');
    expect(result.data).toBeNull();
    expect(result.error).toBe('Server error');
  });

  it('falls back to CORREOS when INVERSORES returns 404', async () => {
    const err404 = new Error('Not found');
    err404.status = 404;
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          values: [
            ['INVERSORES', 'CAPITAL ACTUAL'],
            ['001', '100'],
          ],
        }),
      })
      .mockRejectedValueOnce(err404)
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

  it('returns error when CORREOS sheet returns 404', async () => {
    const err404 = new Error('Not found');
    err404.status = 404;
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          values: [
            ['INVERSORES', 'CAPITAL ACTUAL'],
            ['001', '100'],
          ],
        }),
      })
      .mockRejectedValueOnce(err404)
      .mockRejectedValueOnce(err404);

    const result = await getInvestorHistory('unknown@example.com');
    expect(result.data).toBeNull();
    expect(result.error).toBe('Investor email mapping not configured');
  });

  it('returns error when investor not in CORREOS', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          values: [
            ['INVERSORES', 'CAPITAL ACTUAL'],
            ['001', '100'],
          ],
        }),
      })
      .mockRejectedValueOnce({ status: 404 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          values: [
            ['EMAIL', 'CODIGO'],
            ['other@example.com', '009'],
          ],
        }),
      });

    const result = await getInvestorHistory('notfound@example.com');
    expect(result.data).toBeNull();
    expect(result.error).toBe('Investor email mapping not configured');
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
