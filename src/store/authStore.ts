import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isTokenExpired } from "../lib/tokenExpiry";

interface AuthState {
  token: string | null;
  userName: string | null;
  setSession: (token: string, userName: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userName: null,
      setSession: (token, userName) => set({ token, userName }),
      logout: () => set({ token: null, userName: null }),
    }),
    {
      name: "itelect4-auth",
      partialize: (state) => ({
        token: state.token,
        userName: state.userName,
      }),
      // localStorage keeps the token after the tab closes, but the token
      // itself expires after 2 hours. Someone returning the next day
      // should arrive signed out, not "signed in" with a token the API
      // will refuse.
      onRehydrateStorage: () => (state) => {
        if (state?.token && isTokenExpired(state.token)) {
          state.logout();
        }
      },
    }
  )
);

export default useAuthStore;