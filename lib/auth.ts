import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  providerId: string | null;
  businessName: string | null;
  subscriptionTier: 'unclaimed' | 'claimed' | 'basic' | 'premium' | null;
  setAuth: (data: {
    token: string;
    provider_id: string;
    business_name: string;
    subscription_tier: string;
  }) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      providerId: null,
      businessName: null,
      subscriptionTier: null,
      setAuth: (data) =>
        set({
          token: data.token,
          providerId: data.provider_id,
          businessName: data.business_name,
          subscriptionTier: data.subscription_tier as AuthState['subscriptionTier'],
        }),
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pg_token');
        }
        set({
          token: null,
          providerId: null,
          businessName: null,
          subscriptionTier: null,
        });
      },
    }),
    {
      name: 'parentglue-auth',
      partialize: (state) => ({
        token: state.token,
        providerId: state.providerId,
        businessName: state.businessName,
        subscriptionTier: state.subscriptionTier,
      }),
    }
  )
);
