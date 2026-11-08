import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Standard Zustand Store Template
 * Features: Persistence, Actions, and Selectors logic.
 */

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      
      setTheme: (theme) => set({ theme }),
      
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),
    }),
    {
      name: 'ui-storage', // key in localStorage
    }
  )
);

// Usage:
// const theme = useUIStore((state) => state.theme);
// const toggle = useUIStore((state) => state.toggleSidebar);
