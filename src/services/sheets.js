const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID;

export const getInvestorData = async (email) => {
  try {
    if (!API_KEY || !SHEET_ID || SHEET_ID === 'PENDING_FROM_CHUECO') {
      throw new Error('Google Sheets credentials not configured');
    }

    const range = 'A:Z';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch investor data');
    }
    
    const result = await response.json();
    const rows = result.values || [];
    
    if (rows.length === 0) {
      throw new Error('No data found in sheet');
    }
    
    const investorRow = rows.find(row => row[0]?.toLowerCase() === email.toLowerCase());
    
    if (!investorRow) {
      throw new Error('Investor not found in database');
    }
    
    const historicalData = investorRow.slice(5).map((value, index) => ({
      date: `Day ${index + 1}`,
      balance: parseFloat(value) || 0,
    })).filter(item => item.balance > 0);
    
    return {
      data: {
        email: investorRow[0],
        name: investorRow[1],
        balance: parseFloat(investorRow[2]) || 0,
        totalInvested: parseFloat(investorRow[3]) || 0,
        returns: parseFloat(investorRow[4]) || 0,
        historicalData,
        lastUpdated: new Date().toISOString(),
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error.message,
    };
  }
};

