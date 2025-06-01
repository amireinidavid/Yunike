import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api, authApi, axiosInstance, stripeApi } from '../utils/api';

// Types for auth store
interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  isVerified: boolean;
  profileImageUrl?: string;
  vendor?: {
    id: string;
    storeName: string;
    slug: string;
    logo?: string;
    banner?: string;
    verificationStatus: string;
    stripeAccountId?: string;
    stripeAccountStatus?: string;
    stripeOnboardingComplete?: boolean;
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  registrationId: string | null;
  requireOTP: boolean;
  otpEmail: string | null;
  otpPurpose: 'login' | 'register' | null;
  stripeConnectData: {
    accountId?: string;
    accountLinkUrl?: string;
    accountStatus?: string;
    onboardingComplete?: boolean;
  } | null;
}

interface AuthStore extends AuthState {
  // Registration
  register: (userData: RegisterData) => Promise<void>;
  verifyRegistrationOTP: (email: string, otp: string) => Promise<void>;
  resendRegistrationOTP: (email: string, registrationId: string) => Promise<void>;

  // Login
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  verifyLoginOTP: (email: string, otp: string, rememberMe?: boolean) => Promise<void>;
  resendLoginOTP: (email: string) => Promise<void>;
  adminLogin: (email: string, password: string, twoFactorCode?: string) => Promise<void>;

  // Logout and session management
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  getSessions: () => Promise<any[]>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;

  // Email verification
  verifyEmail: (userId: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;

  // Password management
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (userId: string, token: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;

  // User profile
  getProfile: () => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<void>;

  // OAuth
  googleAuth: (idToken: string) => Promise<void>;

  // Vendor profile
  createVendorProfile: (profileData: VendorProfileData) => Promise<void>;
  
  // Stripe Connect
  createStripeConnectAccount: (accountType?: string) => Promise<void>;
  getStripeAccountStatus: () => Promise<void>;
  getStripeOnboardingLink: () => Promise<string | null>;
  updateStripePayoutSchedule: (schedule: string, minimumAmount?: number) => Promise<void>;
  handleStripeRedirect: (status: 'success' | 'cancel') => Promise<void>;

  // Utility functions
  setError: (error: string | null) => void;
  clearState: () => void;
  setLoading: (isLoading: boolean) => void;

  // Direct token and user update for manual refresh
  setTokenAndUser: (token: string, user: User | null) => void;

  // Initialize authentication on app startup
  initializeAuth: () => Promise<boolean>;
}

// Types for function parameters
interface RegisterData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

interface ProfileData {
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
}

interface VendorProfileData {
  storeName: string;
  description?: string;
  shortDescription?: string;
  businessAddress: any;
  businessType?: string;
  foundedYear?: number;
  taxIdentification?: string;
  processingTime?: string;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  freeShippingThreshold?: number;
  socialLinks?: any;
  policies?: any;
  operatingHours?: any;
  tags?: string[];
}

// Create the auth store
const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      registrationId: null,
      requireOTP: false,
      otpEmail: null,
      otpPurpose: null,
      stripeConnectData: null,

      // Initialize authentication on app startup
      initializeAuth: async () => {
        console.log('🔄 Initializing auth state from storage...');
        try {
          set({ isLoading: true, error: null });
          
          // Check for tokens in localStorage
          const storedAccessToken = localStorage.getItem('accessToken');
          const storedRefreshToken = localStorage.getItem('refreshToken');
          
          console.log('🔐 Auth tokens in storage:', { 
            hasAccessToken: !!storedAccessToken, 
            hasRefreshToken: !!storedRefreshToken 
          });
          
          // If we have an access token, validate it by fetching user profile
          if (storedAccessToken) {
            console.log('🔄 Validating existing access token...');
            // Store it in the state first
            set({ accessToken: storedAccessToken });
            
            try {
              // Call getProfile() to validate the token, but don't rely on its return value
            await get().getProfile();

              // After calling getProfile, check the user in the state
              if (get().user) {
                console.log('✅ Access token validated successfully');
                set({
                  isAuthenticated: true,
                  isLoading: false
                });
            return true;
              } else {
                console.log('❌ Access token invalid, trying refresh token...');
                // Clear invalid access token
                localStorage.removeItem('accessToken');
              }
            } catch (error) {
              console.error('❌ Error validating access token:', error);
              // Clear invalid access token
              localStorage.removeItem('accessToken');
            }
          }
          
          // If access token validation failed but we have a refresh token, try to refresh
          if (storedRefreshToken) {
            console.log('🔄 Attempting to refresh with stored refresh token...');
            const refreshed = await get().refreshToken();
            
            if (refreshed) {
              console.log('✅ Token refreshed successfully during initialization');
              return true;
            } else {
              console.log('❌ Token refresh failed during initialization');
            }
          }
          
          // If we get here, auth failed
          set({
            isLoading: false,
            isAuthenticated: false,
            accessToken: null,
            user: null
          });
          
          return false;
        } catch (error: any) {
          console.error('❌ Auth initialization error:', error);
          set({
            isLoading: false,
            error: error.message,
            isAuthenticated: false,
            accessToken: null,
            user: null
          });
          return false;
        }
      },

      // Refresh token
      refreshToken: async () => {
        console.log('🔄 Attempting to refresh token from auth store...');
        
        try {
          set({ isLoading: true, error: null });
          
          // Check if we have a refresh token
          const storedRefreshToken = localStorage.getItem('refreshToken');
          if (!storedRefreshToken) {
            console.log('❌ No refresh token available for refresh');
            set({ isLoading: false, error: 'No refresh token available' });
            return false;
          }
          
          console.log('🔄 Sending refresh token request to API...');
          
          // Make a direct fetch call to avoid interceptor issues
          const API_URL = 'http://localhost:5001/api';
          const response = await fetch(`${API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken: storedRefreshToken }),
            credentials: 'include'
          });
          
          if (!response.ok) {
            console.error('❌ Failed to refresh token:', response.status);
            set({
              isLoading: false, 
              error: 'Failed to refresh token',
              isAuthenticated: false,
              accessToken: null
            });
            // Clear localStorage tokens on critical failures
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return false;
          }
          
          const data = await response.json();
          console.log('🔄 Refresh token response received');
          
          if (data.error || !data.accessToken) {
            console.error('❌ Failed to refresh token:', data.error || 'No token returned');
            set({
              isLoading: false, 
              error: data.error || 'Failed to refresh token',
              isAuthenticated: false,
              accessToken: null
            });
            // Clear localStorage tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return false;
          }
          
          // Store the new tokens
          const { accessToken, user } = data;
          
          // Save to localStorage first for reliability
          localStorage.setItem('accessToken', accessToken);
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
          
          // Then update the store
          set({
            accessToken,
            user: user || get().user, // Keep existing user data if not in response
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          console.log('✅ Token refreshed successfully and saved to localStorage');
          return true;
        } catch (error: any) {
          console.error('❌ Error refreshing token:', error);
          
          // Clear auth state on critical errors
          set({ 
            isLoading: false,
            error: error.message || 'Failed to refresh token',
            isAuthenticated: false,
            accessToken: null
          });
          
          // Clear localStorage tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          return false;
        }
      },

      // Get user profile
      getProfile: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.get(authApi.getProfile);
          
          if (response.error) {
            throw new Error(response.error);
          }
          
          if (response.user) {
            console.log('Received user profile data:', JSON.stringify(response.user, null, 2));
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false
            });
            return response.user;
          }
        } catch (error: any) {
          console.error('Profile fetch error:', error);
          set({ 
            error: error.message || 'Failed to get profile', 
            isLoading: false 
          });
          return null;
        }
      },

      // Set error helper
      setError: (error) => set({ error }),

      // Set loading helper
      setLoading: (isLoading) => set({ isLoading }),

      // Direct token and user update method for manual refresh
      setTokenAndUser: (token, user) => {
        console.log('🔐 Directly updating token and user in auth store');
        set({
          accessToken: token,
          user: user || get().user, // Keep existing user if none provided
          isAuthenticated: true,
          error: null
        });
      },

      // Clear state helper
      clearState: () => set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        error: null,
        registrationId: null,
        requireOTP: false,
        otpEmail: null,
        otpPurpose: null,
        stripeConnectData: null,
      }),

      // Registration flow
      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post(authApi.register, userData);
          
          if (response.error) {
            throw new Error(response.error);
          }

          if (response.requireOTP) {
            set({ 
              registrationId: response.registrationId,
              requireOTP: true,
              otpEmail: userData.email,
              otpPurpose: 'register',
              isLoading: false
            });
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Registration failed', 
            isLoading: false 
          });
        }
      },

      verifyRegistrationOTP: async (email, otp) => {
        try {
          const { registrationId } = get();
          if (!registrationId) {
            throw new Error('Registration session expired');
          }

          set({ isLoading: true, error: null });
          
          const response = await api.post(authApi.verifyRegistrationOTP, {
            email,
            otp,
            registrationId
          });
          
          if (response.error) {
            throw new Error(response.error);
          }

          set({
            user: response.user,
            accessToken: response.accessToken,
            isAuthenticated: true,
            requireOTP: false,
            otpEmail: null,
            otpPurpose: null,
            registrationId: null,
            isLoading: false
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'OTP verification failed', 
            isLoading: false 
          });
        }
      },

      resendRegistrationOTP: async (email, registrationId) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post(authApi.resendRegistrationOTP, {
            email,
            registrationId
          });
          
          if (response.error) {
            throw new Error(response.error);
          }

          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to resend OTP', 
            isLoading: false 
          });
        }
      },

      // Login flow
      login: async (email, password, rememberMe = false) => {
        try {
          set({ isLoading: true, error: null, requireOTP: false, otpEmail: null });
          
          const response = await api.post(authApi.login, { email, password });
          
          if (response.error) {
            throw new Error(response.error);
          }

          if (response.requireOTP) {
            set({ 
              requireOTP: true,
              otpEmail: email,
              otpPurpose: 'login',
              isLoading: false
            });
            return;
          }
          
          if (response.accessToken) {
            // Save tokens to localStorage for API access
            localStorage.setItem('accessToken', response.accessToken);
            if (response.refreshToken) {
              localStorage.setItem('refreshToken', response.refreshToken);
            }
            
            // Update store state
            set({
              accessToken: response.accessToken,
              isAuthenticated: true,
              user: response.user,
              isLoading: false,
              error: null
            });
            
            console.log('🔐 Login successful: tokens saved to localStorage');
            return response.user;
          }
          
          throw new Error('Login failed: No tokens received');
        } catch (error: any) {
          console.error('Login failed:', error);
          set({ 
            error: error.message || 'Login failed', 
            isLoading: false,
            isAuthenticated: false,
            accessToken: null,
            user: null
          });
        }
      },

      verifyLoginOTP: async (email, otp, rememberMe = false) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post(authApi.verifyLoginOTP, {
            email,
            otp,
            rememberMe
          });
          
          if (response.error) {
            throw new Error(response.error);
          }

          set({
            user: response.user,
            accessToken: response.accessToken,
            isAuthenticated: true,
            requireOTP: false,
            otpEmail: null,
            otpPurpose: null,
            isLoading: false
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'OTP verification failed', 
            isLoading: false 
          });
        }
      },

      resendLoginOTP: async (email) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post(authApi.resendLoginOTP, { email });
          
          if (response.error) {
            throw new Error(response.error);
          }

          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to resend OTP', 
            isLoading: false 
          });
        }
      },

      adminLogin: async (email, password, twoFactorCode) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post(authApi.adminLogin, {
            email,
            password,
            twoFactorCode
          });
          
          if (response.error) {
            throw new Error(response.error);
          }

          if (response.requiresTwoFactor) {
            // Admin requires 2FA code
            set({
              isLoading: false,
              requireOTP: true, // Reusing the OTP state for 2FA
              otpEmail: email,
              otpPurpose: 'login'
            });
            return;
          }

          set({
            user: response.user,
            accessToken: response.accessToken,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Admin login failed', 
            isLoading: false 
          });
        }
      },

      // Logout and session management
      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          await api.post(authApi.logout);
          
          // Clear auth state regardless of API response
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false
          });

          // Clear cookies manually to ensure they're removed
          document.cookie = 'accessToken=; Max-Age=0; path=/; domain=' + window.location.hostname;
          document.cookie = 'refreshToken=; Max-Age=0; path=/; domain=' + window.location.hostname;
        } catch (error: any) {
          // Still log out the user locally even if API call fails
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            error: error.message || 'Logout failed',
            isLoading: false
          });
        }
      },

      getSessions: async () => {
        try {
          const { accessToken } = get();
          if (!accessToken) {
            throw new Error('Not authenticated');
          }

          set({ isLoading: true, error: null });
          
          const response = await api.get(authApi.getSessions, accessToken);
          
          if (response.error) {
            throw new Error(response.error);
          }

          set({ isLoading: false });
          return response.sessions || [];
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to get sessions', 
            isLoading: false 
          });
          return [];
        }
      },

      revokeSession: async (sessionId) => {
        try {
          const { accessToken } = get();
          if (!accessToken) {
            throw new Error('Not authenticated');
          }

          set({ isLoading: true, error: null });
          
          const response = await api.delete(authApi.revokeSession(sessionId), accessToken);
          
          if (response.error) {
            throw new Error(response.error);
          }

          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to revoke session', 
            isLoading: false 
          });
        }
      },

      revokeAllSessions: async () => {
        try {
          const { accessToken } = get();
          if (!accessToken) {
            throw new Error('Not authenticated');
          }

          set({ isLoading: true, error: null });
          
          const response = await api.delete(authApi.revokeAllSessions, accessToken);
          
          if (response.error) {
            throw new Error(response.error);
          }

          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to revoke all sessions', 
            isLoading: false 
          });
        }
      },

      // Email verification
      verifyEmail: async (userId, code) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post(authApi.verifyEmail, { userId, code });
          
          if (response.error) {
            throw new Error(response.error);
          }

          // If user is logged in, update verification status
          const { user } = get();
          if (user && user.id === userId) {
            set({
              user: { ...user, isVerified: true }
            });
          }

          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to verify email', 
            isLoading: false 
          });
        }
      },

      resendVerification: async (email) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post(authApi.resendVerification, { email });
          
          if (response.error) {
            throw new Error(response.error);
          }

          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to resend verification email', 
            isLoading: false 
          });
        }
      },

      // Password management
      forgotPassword: async (email) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post(authApi.forgotPassword, { email });
          
          if (response.error) {
            throw new Error(response.error);
          }

          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to process forgot password request', 
            isLoading: false 
          });
        }
      },

      resetPassword: async (userId, token, password) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post(authApi.resetPassword, {
            userId,
            token,
            password
          });
          
          if (response.error) {
            throw new Error(response.error);
          }

          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to reset password', 
            isLoading: false 
          });
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        try {
          const { accessToken } = get();
          if (!accessToken) {
            throw new Error('Not authenticated');
          }

          set({ isLoading: true, error: null });
          
          const response = await api.post(
            authApi.changePassword, 
            { currentPassword, newPassword }, 
            accessToken
          );
          
          if (response.error) {
            throw new Error(response.error);
          }

          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to change password', 
            isLoading: false 
          });
        }
      },

      // User profile
      updateProfile: async (data) => {
        try {
          const { accessToken } = get();
          if (!accessToken) {
            throw new Error('Not authenticated');
          }

          set({ isLoading: true, error: null });
          
          const response = await api.put(
            authApi.updateProfile, 
            data, 
            accessToken
          );
          
          if (response.error) {
            throw new Error(response.error);
          }

          set({
            user: response.user,
            isLoading: false
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to update profile', 
            isLoading: false 
          });
        }
      },

      // OAuth
      googleAuth: async (idToken) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post(authApi.googleAuth, { idToken });
          
          if (response.error) {
            throw new Error(response.error);
          }

          set({
            user: response.user,
            accessToken: response.accessToken,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Google authentication failed', 
            isLoading: false 
          });
        }
      },

      // Vendor profile
      createVendorProfile: async (profileData: VendorProfileData) => {
        try {
          const { accessToken } = get();
          if (!accessToken) {
            throw new Error('Not authenticated');
          }

          set({ isLoading: true, error: null });
          
          const response = await api.post(authApi.createVendorProfile, profileData, accessToken);
          
          if (response.error) {
            throw new Error(response.error);
          }

          // Store stripe connect data if returned from API
          if (response.stripeConnect) {
            set({
              stripeConnectData: {
                accountId: response.stripeConnect.accountId,
                accountLinkUrl: response.stripeConnect.accountLinkUrl,
                accountStatus: 'PENDING',
                onboardingComplete: false
              }
            });
          }

          set({
            user: response.user,
            isLoading: false
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Vendor profile creation failed', 
            isLoading: false 
          });
        }
      },

      // Stripe Connect functions
      createStripeConnectAccount: async (accountType = 'EXPRESS') => {
        try {
          const { accessToken } = get();
          if (!accessToken) {
            throw new Error('Not authenticated');
          }

          set({ isLoading: true, error: null });
          
          const response = await api.post(
            stripeApi.createConnectAccount, 
            { accountType }, 
            accessToken
          );
          
          if (response.error) {
            throw new Error(response.error);
          }

          set({
            stripeConnectData: {
              accountId: response.data.accountId,
              accountLinkUrl: response.data.accountLinkUrl,
              accountStatus: 'PENDING',
              onboardingComplete: false
            },
            isLoading: false
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to create Stripe Connect account', 
            isLoading: false 
          });
        }
      },

      getStripeAccountStatus: async () => {
        try {
          const { accessToken } = get();
          if (!accessToken) {
            throw new Error('Not authenticated');
          }

          set({ isLoading: true, error: null });
          
          const response = await api.get(
            stripeApi.getAccountStatus, 
            accessToken
          );
          
          if (response.error) {
            throw new Error(response.error);
          }

          // Update user vendor object with Stripe status
          const { user } = get();
          if (user && user.vendor) {
            set({
              user: {
                ...user,
                vendor: {
                  ...user.vendor,
                  stripeAccountId: response.data.stripeAccountId,
                  stripeAccountStatus: response.data.status,
                  stripeOnboardingComplete: 
                    response.data.detailsSubmitted && 
                    response.data.payoutsEnabled && 
                    response.data.chargesEnabled
                }
              },
              stripeConnectData: {
                accountId: response.data.stripeAccountId,
                accountStatus: response.data.status,
                onboardingComplete: 
                  response.data.detailsSubmitted && 
                  response.data.payoutsEnabled && 
                  response.data.chargesEnabled
              },
              isLoading: false
            });
          } else {
            set({
              stripeConnectData: {
                accountId: response.data.stripeAccountId,
                accountStatus: response.data.status,
                onboardingComplete: 
                  response.data.detailsSubmitted && 
                  response.data.payoutsEnabled && 
                  response.data.chargesEnabled
              },
              isLoading: false
            });
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to get Stripe account status', 
            isLoading: false 
          });
        }
      },

      getStripeOnboardingLink: async () => {
        try {
          const { accessToken } = get();
          if (!accessToken) {
            throw new Error('Not authenticated');
          }

          set({ isLoading: true, error: null });
          
          const response = await api.get(
            stripeApi.getOnboardingLink, 
            accessToken
          );
          
          if (response.error) {
            throw new Error(response.error);
          }

          set({
            stripeConnectData: {
              ...get().stripeConnectData,
              accountLinkUrl: response.url
            },
            isLoading: false
          });
          
          return response.url;
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to get Stripe onboarding link', 
            isLoading: false 
          });
          return null;
        }
      },

      updateStripePayoutSchedule: async (schedule, minimumAmount) => {
        try {
          const { accessToken, user } = get();
          if (!accessToken || !user?.vendor?.id) {
            throw new Error('Not authenticated or no vendor profile');
          }

          set({ isLoading: true, error: null });
          
          const response = await api.put(
            stripeApi.updatePayoutSchedule(user.vendor.id), 
            { schedule, minimumAmount }, 
            accessToken
          );
          
          if (response.error) {
            throw new Error(response.error);
          }

          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to update payout schedule', 
            isLoading: false 
          });
        }
      },

      handleStripeRedirect: async (status) => {
        try {
          if (status === 'success') {
            // Refresh account status after successful onboarding
            await get().getStripeAccountStatus();
          } else {
            // If canceled, we may want to offer to restart the flow
            set({
              stripeConnectData: {
                ...get().stripeConnectData,
                accountLinkUrl: undefined
              }
            });
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to handle Stripe redirect', 
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'yunike-vendor-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Set up axios interceptors for token refresh
export function setupAuthInterceptors() {
  // Request interceptor - add token to all requests
  axiosInstance.interceptors.request.use(
    (config) => {
      const accessToken = useAuthStore.getState().accessToken;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle token refresh on 401 errors
  let isRefreshing = false;
  let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void }[] = [];

  // Process failed requests queue
  const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(promise => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });
    
    failedQueue = [];
  };

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // Log the intercepted error for debugging
      if (error.response?.status === 401) {
        console.log('Intercepted 401 error, path:', originalRequest.url);
      }
      
      // Skip if error is not 401 or it's a refresh token request to avoid infinite loops
      if (
        !error.response || 
        error.response.status !== 401 || 
        originalRequest.url === authApi.refreshToken ||
        originalRequest._retry
      ) {
        return Promise.reject(error);
      }
      
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        console.log('Token refresh in progress, queueing request');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            console.log('Retrying request with new token');
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      // Start refreshing process
      console.log('Starting token refresh process');
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshed = await useAuthStore.getState().refreshToken();
        
        if (refreshed) {
          console.log('Token refreshed successfully');
          const newToken = useAuthStore.getState().accessToken;
          // Update authorization header
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          // Process any queued requests
          processQueue(null, newToken);
          // Continue with the original request
          return axiosInstance(originalRequest);
        } else {
          console.log('Token refresh failed');
          // Refresh failed, handle logout or redirect
          processQueue(new Error('Failed to refresh token'));
          
          // Optionally redirect to login page if needed
          if (typeof window !== 'undefined') {
            console.log('Redirecting to login page');
            // Don't do automatic redirect as it might be disruptive
            // Instead set auth state to unauthenticated
            useAuthStore.getState().setError('Session expired. Please login again.');
            useAuthStore.getState().clearState();
          }
          
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('Error during refresh:', refreshError);
        processQueue(refreshError as Error);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
}

export default useAuthStore;
