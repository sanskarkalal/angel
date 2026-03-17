import { create } from "zustand";

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  pronouns: string | null;
  birth_date: string | null; // ISO date string
  birth_time: string | null;
  birth_city: string | null;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  life_path_number: number | null;
  onboarding_story: string | null;
  intentions: string[] | null;
  photo_url: string | null;
  onboarding_complete: boolean;
  created_at: string;
}

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: true,
  setProfile: (profile) => set({ profile, loading: false }),
  setLoading: (loading) => set({ loading }),
  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    })),
  clearProfile: () => set({ profile: null }),
}));
