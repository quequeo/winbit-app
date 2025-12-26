import emailjs from '@emailjs/browser';

const getEnv = (key) => {
  return import.meta.env?.[key] ?? globalThis?.process?.env?.[key];
};

const isConfigured = () => {
  const SERVICE_ID = getEnv('VITE_EMAILJS_SERVICE_ID');
  const PUBLIC_KEY = getEnv('VITE_EMAILJS_PUBLIC_KEY');

  return (
    SERVICE_ID &&
    PUBLIC_KEY &&
    SERVICE_ID !== 'PENDING_FROM_CHUECO' &&
    PUBLIC_KEY !== 'PENDING_FROM_CHUECO'
  );
};

export const sendWithdrawalRequest = async (data) => {
  try {
    const SERVICE_ID = getEnv('VITE_EMAILJS_SERVICE_ID');
    const TEMPLATE_ID_WITHDRAWAL = getEnv('VITE_EMAILJS_TEMPLATE_ID_WITHDRAWAL');
    const PUBLIC_KEY = getEnv('VITE_EMAILJS_PUBLIC_KEY');

    if (
      !isConfigured() ||
      !TEMPLATE_ID_WITHDRAWAL ||
      TEMPLATE_ID_WITHDRAWAL === 'PENDING_FROM_CHUECO'
    ) {
      throw new Error('Email service not configured yet');
    }

    const templateParams = {
      user_name: data.userName,
      user_email: data.userEmail,
      withdrawal_type: data.type,
      amount: data.amount,
      method: data.method || 'crypto',
      lemon_tag: data.lemonTag || 'N/A',
      timestamp: new Date().toLocaleString(),
    };

    await emailjs.send(SERVICE_ID, TEMPLATE_ID_WITHDRAWAL, templateParams, PUBLIC_KEY);

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const sendDepositRequest = async (data) => {
  try {
    const SERVICE_ID = getEnv('VITE_EMAILJS_SERVICE_ID');
    const TEMPLATE_ID_DEPOSIT = getEnv('VITE_EMAILJS_TEMPLATE_ID_DEPOSIT');
    const PUBLIC_KEY = getEnv('VITE_EMAILJS_PUBLIC_KEY');

    if (!isConfigured() || !TEMPLATE_ID_DEPOSIT || TEMPLATE_ID_DEPOSIT === 'PENDING_FROM_CHUECO') {
      throw new Error('Email service not configured yet');
    }

    const templateParams = {
      user_name: data.userName,
      user_email: data.userEmail,
      amount: data.amount,
      network: data.network,
      transaction_hash: data.transactionHash || 'N/A',
      method: data.method || 'crypto',
      lemon_tag: data.lemonTag || 'N/A',
      timestamp: new Date().toLocaleString(),
    };

    await emailjs.send(SERVICE_ID, TEMPLATE_ID_DEPOSIT, templateParams, PUBLIC_KEY);

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
