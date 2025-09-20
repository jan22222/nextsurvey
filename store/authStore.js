import { create } from "zustand";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../lib/firebase"; // Pfad anpassen falls nötig

const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  // Initialisiert den Listener
  initAuth: () => {
    onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
  },

  // Login Funktion
  login: async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  },

  // Logout Funktion
  logout: async () => {
    await signOut(auth);
  },
}));

export default useAuthStore;

