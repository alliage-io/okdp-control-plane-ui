/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { NAV_HIDDEN_KEY, NAV_SIZE_KEY } from '../storage-keys';

export type NavMenuSize = 'compact' | 'default' | 'large';

/** Entry/icon size of the lateral menu, one choice per collapse state. */
export interface NavMenuSizes {
  /** Entry size (text, icon, row height) when the sidebar is expanded. */
  expanded: NavMenuSize;
  /** Icon size when the sidebar is collapsed to the rail. */
  collapsed: NavMenuSize;
}

/** Factor each size applies to the menu's font/icon/padding metrics — the
 *  value of `--nav-item-scale` on the sidebar (1 everywhere else). */
export const NAV_SIZE_SCALE: Record<NavMenuSize, number> = {
  compact: 0.9,
  default: 1,
  large: 1.2,
};

export interface NavPrefsContextValue {
  /** Effective visibility: the user's explicit choice when there is one,
   *  the item's `defaultHidden` flag otherwise. */
  isNavItemHidden: (label: string, defaultHidden?: boolean) => boolean;
  setNavItemHidden: (label: string, hidden: boolean) => void;
  menuSizes: NavMenuSizes;
  setMenuSize: (state: keyof NavMenuSizes, size: NavMenuSize) => void;
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

function isNavMenuSize(value: unknown): value is NavMenuSize {
  return value === 'compact' || value === 'default' || value === 'large';
}

/** Stored size choices; unknown or corrupt values fall back per state. */
function storedSizes(): NavMenuSizes {
  try {
    const raw = localStorage.getItem(NAV_SIZE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<NavMenuSizes>;
      return {
        expanded: isNavMenuSize(parsed.expanded) ? parsed.expanded : 'default',
        collapsed: isNavMenuSize(parsed.collapsed) ? parsed.collapsed : 'default',
      };
    }
  } catch {
    // corrupt value — fall back to defaults
  }
  return { expanded: 'default', collapsed: 'default' };
}

/** Which lateral-menu entries the user hid or re-enabled, and how large the
 *  menu renders. Persisted per browser; shared between the project console
 *  (reader) and the settings page (writer). */
export function NavPrefsProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, boolean>>(storedOverrides);
  const [menuSizes, setMenuSizes] = useState<NavMenuSizes>(storedSizes);

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

  const setMenuSize = useCallback((state: keyof NavMenuSizes, size: NavMenuSize) => {
    setMenuSizes((prev) => {
      const next = { ...prev, [state]: size };
      localStorage.setItem(NAV_SIZE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <NavPrefsContext.Provider value={{ isNavItemHidden, setNavItemHidden, menuSizes, setMenuSize }}>
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
