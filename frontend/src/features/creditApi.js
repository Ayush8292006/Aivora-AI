// frontend/src/features/creditApi.js
import api from '../../utils/axios.js';

// 1. Fetch user's wallet
export async function getWalletApi() {
  try {
    const { data } = await api.get('/api/credits/wallet');
    return data;
  } catch (error) {
    console.error('Fetch wallet error:', error.response?.data || error.message);
    return null;
  }
}

// 2. Fetch purchasable credit packages
export async function getPackagesApi() {
  try {
    const { data } = await api.get('/api/credits/packages');
    return data?.packages || [];
  } catch (error) {
    console.error('Fetch packages error:', error.response?.data || error.message);
    return [];
  }
}

// 3. Fetch user's credit transactions
export async function getTransactionsApi(page = 1, limit = 10) {
  try {
    const { data } = await api.get(`/api/credits/transactions?page=${page}&limit=${limit}`);
    return data;
  } catch (error) {
    console.error('Fetch transactions error:', error.response?.data || error.message);
    return { transactions: [], pagination: { total: 0, totalPages: 1 } };
  }
}

// 4. Fetch usage overview
export async function getUsageOverviewApi() {
  try {
    const { data } = await api.get('/api/credits/usage');
    return data;
  } catch (error) {
    console.error('Fetch usage error:', error.response?.data || error.message);
    return null;
  }
}

// 5. Fetch model-wise breakdown
export async function getUsageByModelApi() {
  try {
    const { data } = await api.get('/api/credits/usage/models');
    return data?.models || [];
  } catch (error) {
    console.error('Fetch usage by model error:', error.response?.data || error.message);
    return [];
  }
}

// 6. Fetch conversation usage list
export async function getConversationUsageListApi() {
  try {
    const { data } = await api.get('/api/credits/usage/conversations');
    return data?.conversations || [];
  } catch (error) {
    console.error('Fetch conversation usage error:', error.response?.data || error.message);
    return [];
  }
}

// 7. Fetch single chat usage
export async function getChatUsageApi(conversationId) {
  if (!conversationId) return null;
  try {
    const { data } = await api.get(`/api/credits/usage/chat/${conversationId}`);
    return data;
  } catch (error) {
    console.error('Fetch chat usage error:', error.response?.data || error.message);
    return null;
  }
}

// 8. Create Razorpay Payment Order
export async function createPaymentOrderApi(packageCode) {
  try {
    const { data } = await api.post('/api/payments/create-order', { packageCode });
    return data;
  } catch (error) {
    console.error('Create payment order error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to initialize payment');
  }
}

// 9. Verify Razorpay Payment Signature
export async function verifyPaymentApi(paymentPayload) {
  try {
    const { data } = await api.post('/api/payments/verify', paymentPayload);
    return data;
  } catch (error) {
    console.error('Verify payment error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Payment signature verification failed');
  }
}

// 10. Initialize or get Guest Session
export async function getGuestSessionApi() {
  try {
    const { data } = await api.post('/api/guest/session');
    return data?.guestSession;
  } catch (error) {
    console.error('Guest session error:', error.response?.data || error.message);
    return null;
  }
}

// 11. Convert Guest Session to User
export async function convertGuestApi(guestSessionId) {
  try {
    const { data } = await api.post('/api/guest/convert', { guestSessionId });
    return data;
  } catch (error) {
    console.error('Convert guest error:', error.response?.data || error.message);
    return null;
  }
}

// 12. Admin API - Get Users
export async function getAdminUsersApi(page = 1, limit = 20) {
  try {
    const { data } = await api.get(`/api/admin/credits/users?page=${page}&limit=${limit}`);
    return data;
  } catch (error) {
    console.error('Admin users error:', error.response?.data || error.message);
    return null;
  }
}

// 13. Admin API - Adjust Credits
export async function adjustUserCreditsApi(targetUserId, amount, reason) {
  try {
    const { data } = await api.post('/api/admin/credits/adjust', { targetUserId, amount, reason });
    return data;
  } catch (error) {
    console.error('Adjust credits error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to adjust user credits');
  }
}

// 14. Admin API - Analytics
export async function getAdminAnalyticsApi() {
  try {
    const { data } = await api.get('/api/admin/credits/analytics');
    return data?.analytics || null;
  } catch (error) {
    console.error('Admin analytics error:', error.response?.data || error.message);
    return null;
  }
}
