/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { NAV_HIDDEN_KEY } from '../storage-keys';

export interface NavPrefsContextValue {
  /** Labels of lateral-menu entries the user chose to hide. */
  hiddenNavItems: ReadonlySet<string>;
  setNavItemHidden: (label: string, hidden: boolean) => void;
}

const NavPrefsContext = createContext<NavPrefsContextValue | null>(null);

function storedHidden(): Set<string> {
  try {
    const raw = localStorage.getItem(NAV_HIDDEN_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    // corrupt value — fall back to everything visible
  }
  return new Set();
}

/** Which lateral-menu entries the user hid. Persisted per browser; shared
 *  between the project console (reader) and the settings page (writer). */
export function NavPrefsProvider({ children }: { children: ReactNode }) {
  const [hiddenNavItems, setHidden] = useState<Set<string>>(storedHidden);

  const setNavItemHidden = useCallback((label: string, hidden: boolean) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (hidden) {
        next.add(label);
      } else {
        next.delete(label);
      }
      localStorage.setItem(NAV_HIDDEN_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return (
    <NavPrefsContext.Provider value={{ hiddenNavItems, setNavItemHidden }}>
      {children}
    </NavPrefsContext.Provider>
  );
}

export function useNavPrefs(): NavPrefsContextValue {
  const ctx = useContext(NavPrefsContext);
  if (!ctx) {
    throw new Error('useNavPrefs must be used within a NavPrefsProvider');
  }
  return ctx;
}
