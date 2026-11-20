import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  availableCredits: 100,
  totalPurchasedCredits: 0,
  totalBonusCredits: 100,
  totalConsumedCredits: 0,
  walletStatus: 'active',
  packages: [],
  transactions: [],
  guestSession: {
    sessionId: null,
    questionsUsed: 0,
    maxQuestions: 4,
    questionsRemaining: 4,
    canChat: true
  },
  currentChatUsage: {
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    totalCreditsConsumed: 0,
    lastModelUsed: 'Auto'
  },
  isPricingModalOpen: false,
  isExhaustedModalOpen: false,
  isUsageModalOpen: false,
  isGuestLimitModalOpen: false
};

const creditSlice = createSlice({
  name: 'credit',
  initialState,
  reducers: {
    setWallet: (state, action) => {
      if (action.payload) {
        state.availableCredits = action.payload.availableCredits ?? state.availableCredits;
        state.totalPurchasedCredits = action.payload.totalPurchasedCredits ?? state.totalPurchasedCredits;
        state.totalBonusCredits = action.payload.totalBonusCredits ?? state.totalBonusCredits;
        state.totalConsumedCredits = action.payload.totalConsumedCredits ?? state.totalConsumedCredits;
        state.walletStatus = action.payload.status ?? state.walletStatus;
      }
    },
    setPackages: (state, action) => {
      state.packages = action.payload || [];
    },
    setTransactions: (state, action) => {
      state.transactions = action.payload || [];
    },
    setGuestSession: (state, action) => {
      if (action.payload) {
        state.guestSession = {
          ...state.guestSession,
          ...action.payload
        };
      }
    },
    decrementGuestQuestions: (state) => {
      const used = (state.guestSession.questionsUsed || 0) + 1;
      const remaining = Math.max(0, (state.guestSession.maxQuestions || 4) - used);
      state.guestSession.questionsUsed = used;
      state.guestSession.questionsRemaining = remaining;
      state.guestSession.canChat = remaining > 0;
    },
    setCurrentChatUsage: (state, action) => {
      if (action.payload) {
        state.currentChatUsage = {
          ...state.currentChatUsage,
          ...action.payload
        };
      }
    },
    openPricingModal: (state) => {
      state.isPricingModalOpen = true;
    },
    closePricingModal: (state) => {
      state.isPricingModalOpen = false;
    },
    openExhaustedModal: (state) => {
      state.isExhaustedModalOpen = true;
    },
    closeExhaustedModal: (state) => {
      state.isExhaustedModalOpen = false;
    },
    openUsageModal: (state) => {
      state.isUsageModalOpen = true;
    },
    closeUsageModal: (state) => {
      state.isUsageModalOpen = false;
    },
    openGuestLimitModal: (state) => {
      state.isGuestLimitModalOpen = true;
    },
    closeGuestLimitModal: (state) => {
      state.isGuestLimitModalOpen = false;
    }
  }
});

export const {
  setWallet,
  setPackages,
  setTransactions,
  setGuestSession,
  decrementGuestQuestions,
  setCurrentChatUsage,
  openPricingModal,
  closePricingModal,
  openExhaustedModal,
  closeExhaustedModal,
  openUsageModal,
  closeUsageModal,
  openGuestLimitModal,
  closeGuestLimitModal
} = creditSlice.actions;

export default creditSlice.reducer;
