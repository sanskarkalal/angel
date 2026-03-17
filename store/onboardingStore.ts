import { create } from "zustand";

export interface OnboardingData {
  name: string;
  pronouns: string;
  birth_date: string; // ISO date
  birth_time: string;
  birth_city: string;
  onboarding_story: string;
  intentions: string[];
  photo_uri: string | null;
}

interface OnboardingState {
  data: Partial<OnboardingData>;
  setData: (updates: Partial<OnboardingData>) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  data: {
    intentions: ["", "", ""],
  },
  setData: (updates) =>
    set((state) => ({ data: { ...state.data, ...updates } })),
  reset: () => set({ data: { intentions: ["", "", ""] } }),
}));
