import { create } from 'zustand';
import { stripeApi } from '../utils/api';
import { apiExtended as api } from '../utils/apiPatches';

// Define the structure of Stripe account status
interface StripeAccountStatus {
  stripeAccountId?: string;
  status?: 'PENDING' | 'ACTIVE' | 'RESTRICTED' | 'REJECTED' | 'DISABLED';
  detailsSubmitted: boolean;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  isTestMode: boolean;
}

// Define the structure for payout schedule
interface PayoutSchedule {
  schedule: 'daily' | 'weekly' | 'monthly' | 'manual';
  minimumAmount?: number;
}

// Interface for the Stripe store
interface StripeStore {
  // State
  isLoading: boolean;
  error: string | null;
  accountStatus: StripeAccountStatus;
  onboardingUrl: string | null;
  
  // Actions
  createConnectAccount: (accountType?: string) => Promise<void>;
  getAccountStatus: () => Promise<void>;
  getOnboardingLink: () => Promise<string | null>;
  updatePayoutSchedule: (schedule: string, minimumAmount?: number) => Promise<void>;
  disconnectAccount: () => Promise<void>;
  clearError: () => void;
}

const defaultAccountStatus: StripeAccountStatus = {
  detailsSubmitted: false,
  payoutsEnabled: false,
  chargesEnabled: false,
  isTestMode: true
};

const useStripeStore = create<StripeStore>((set, get) => ({
  // Initial state
  isLoading: false,
  error: null,
  accountStatus: defaultAccountStatus,
  onboardingUrl: null,

  // Actions
  createConnectAccount: async (accountType = 'EXPRESS') => {
    try {
      set({ isLoading: true, error: null });
      
      // Get vendor ID from auth store
      const authStore = (await import('./useAuthStore')).default;
      const vendorId = authStore.getState().user?.vendor?.id;
      
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }
      
      // Call the API to create a Connect account
      const response = await api.post(
        stripeApi.createConnectAccount(vendorId),
        { accountType }
      );
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update state with the new account data
      set({
        accountStatus: {
          ...get().accountStatus,
          stripeAccountId: response.accountId,
          isTestMode: response.isTestMode
        },
        onboardingUrl: response.accountLinkUrl
      });
      
      return response;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create Stripe Connect account' });
      console.error('Error creating Stripe Connect account:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  getAccountStatus: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Get vendor ID from auth store
      const authStore = (await import('./useAuthStore')).default;
      const vendorId = authStore.getState().user?.vendor?.id;
      
      if (!vendorId) {
        // Return early instead of throwing error if vendor ID isn't available yet
        console.log('No vendor ID available, skipping account status check');
        set({ isLoading: false });
        return;
      }
      
      // Call the API to get account status
      const response = await api.get(stripeApi.getAccountStatus(vendorId));
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update state with the account status
      set({
        accountStatus: {
          stripeAccountId: response.stripeAccountId,
          status: response.status,
          detailsSubmitted: response.detailsSubmitted,
          payoutsEnabled: response.payoutsEnabled,
          chargesEnabled: response.chargesEnabled,
          isTestMode: response.isTestMode
        }
      });
      
      // Update the user's vendor object with Stripe status
      const currentState = authStore.getState();
      if (currentState.user?.vendor) {
        authStore.setState({
          user: {
            ...currentState.user,
            vendor: {
              ...currentState.user.vendor,
              stripeAccountId: response.stripeAccountId,
              stripeAccountStatus: response.status,
              stripeOnboardingComplete: response.detailsSubmitted
            }
          }
        });
      }
      
      return response;
    } catch (error: any) {
      set({ error: error.message || 'Failed to get Stripe account status' });
      console.error('Error getting Stripe account status:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  getOnboardingLink: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Get vendor ID from auth store
      const authStore = (await import('./useAuthStore')).default;
      const vendorId = authStore.getState().user?.vendor?.id;
      
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }
      
      // Call the API to get onboarding link
      const response = await api.post(stripeApi.getOnboardingLink(vendorId));
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update state with the onboarding URL
      set({ onboardingUrl: response.accountLinkUrl });
      
      return response.accountLinkUrl;
    } catch (error: any) {
      set({ error: error.message || 'Failed to get Stripe onboarding link' });
      console.error('Error getting Stripe onboarding link:', error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  
  updatePayoutSchedule: async (schedule, minimumAmount) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get vendor ID from auth store
      const authStore = (await import('./useAuthStore')).default;
      const vendorId = authStore.getState().user?.vendor?.id;
      
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }
      
      // Ensure schedule is lowercase for Stripe API
      const normalizedSchedule = String(schedule).toLowerCase();
      
      // Validate schedule
      const validSchedules = ['daily', 'weekly', 'monthly', 'manual'];
      if (!validSchedules.includes(normalizedSchedule)) {
        const errorMsg = `Invalid schedule. Must be one of: daily, weekly, monthly, manual`;
        set({ error: errorMsg });
        console.error(errorMsg, { providedSchedule: schedule });
        return { error: errorMsg };
      }
      
      console.log('Making API call to update schedule:', { 
        normalizedSchedule, 
        minimumAmount,
        endpoint: stripeApi.updatePayoutSchedule(vendorId)
      });
      
      // Call the API to update payout schedule
      const response = await api.patch(
        stripeApi.updatePayoutSchedule(vendorId),
        { schedule: normalizedSchedule, minimumAmount }
      );
      
      if (response.error) {
        set({ error: response.error });
        console.error('API returned error:', response.error);
        return response;
      }
      
      // Refresh account status after updating payout schedule
      await get().getAccountStatus();
      
      return response;
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to update payout schedule';
      set({ error: errorMsg });
      console.error('Error updating payout schedule:', error);
      return { error: errorMsg };
    } finally {
      set({ isLoading: false });
    }
  },
  
  disconnectAccount: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Get vendor ID from auth store
      const authStore = (await import('./useAuthStore')).default;
      const vendorId = authStore.getState().user?.vendor?.id;
      
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }
      
      // Call the API to disconnect the account
      const response = await api.delete(stripeApi.disconnectAccount(vendorId));
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Reset account status
      set({ accountStatus: defaultAccountStatus, onboardingUrl: null });
      
      // Update the user's vendor object to reflect disconnection
      const currentState = authStore.getState();
      if (currentState.user?.vendor) {
        authStore.setState({
          user: {
            ...currentState.user,
            vendor: {
              ...currentState.user.vendor,
              stripeAccountId: undefined,
              stripeAccountStatus: undefined,
              stripeOnboardingComplete: false
            }
          }
        });
      }
      
      return response;
    } catch (error: any) {
      set({ error: error.message || 'Failed to disconnect Stripe account' });
      console.error('Error disconnecting Stripe account:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  clearError: () => set({ error: null })
}));

export default useStripeStore;
