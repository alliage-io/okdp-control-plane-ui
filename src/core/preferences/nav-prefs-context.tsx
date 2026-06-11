/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { NAV_HIDDEN_KEY } from '../storage-keys';

export interface NavPrefsContextValue {
  /** Effective visibility: the user's explicit choice when there is one,
   *  the item's `defaultHidden` flag otherwise. */
  isNavItemHidden: (label: string, defaultHidden?: boolean) => boolean;
  setNavItemHidden: (label: string, hidden: boolean) => void;
}

const NavPrefsContext = createContext<NavPrefsContextValue | null>(null);

/** Stored per-item overrides (label → hidden). Items the user never touched
 *  are absent and follow their default. The legacy format was a plain array
 *  of hidden labels — folded into overrides on read. */
function storedOverrides(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(NAV_HIDDEN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as string[] | Record<string, boolean>;
      if (Array.isArray(parsed)) {
        return Object.fromEntries(parsed.map((label) => [label, true]));
      }
      return parsed;
    }
  } catch {
    // corrupt value — fall back to defaults
  }
  return {};
}

/** Which lateral-menu entries the user hid or re-enabled. Persisted per
 *  browser; shared between the project console (reader) and the settings
 *  page (writer). */
export function NavPrefsProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, boolean>>(storedOverrides);

  const isNavItemHidden = useCallback(
    (label: string, defaultHidden?: boolean) => overrides[label] ?? defaultHidden ?? false,
    [overrides],
  );

  const setNavItemHidden = useCallback((label: string, hidden: boolean) => {
    setOverrides((prev) => {
      const next = { ...prev, [label]: hidden };
      localStorage.setItem(NAV_HIDDEN_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <NavPrefsContext.Provider value={{ isNavItemHidden, setNavItemHidden }}>
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
