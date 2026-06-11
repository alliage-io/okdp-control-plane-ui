import type { ReactNode } from 'react';
import { siApachespark } from 'simple-icons';
import type { ServiceInstance } from '../../core/models/service.model';
import { BrandIcon, type BrandGlyph } from '../../shared/components/brand-icon';
import { navItemBySegment, navItemIcon } from '../project-console/nav-config';

export type ViewTone = 'primary' | 'blue' | 'purple';

export interface UiServiceView {
  /** ServiceInstance.service value of the deployed instances. */
  service: string;
  label: string;
  /** primeicons class for the tile; the sidebar prefers the brand logo. */
  icon: string;
  tone: ViewTone;
  /** NAV_CATEGORIES key the view is grouped under in the views sidebar. */
  categoryKey: string;
  /** Lateral-menu item segment, for the brand-logo lookup. */
  navSegment: string;
}

/** Services whose deployed instances expose a web UI worth a launcher tile. */
export const UI_SERVICE_VIEWS: UiServiceView[] = [
  {
    service: 'airflow',
    label: 'Airflow',
    icon: 'pi pi-sitemap',
    tone: 'blue',
    categoryKey: 'data-engineering',
    navSegment: 'airflow',
  },
  {
    service: 'spark-history-server',
    label: 'Spark History Server',
    icon: 'pi pi-history',
    tone: 'purple',
    categoryKey: 'data-engineering',
    navSegment: 'spark/history-server',
  },
  {
    service: 'jupyterhub',
    label: 'JupyterHub',
    icon: 'pi pi-desktop',
    tone: 'primary',
    categoryKey: 'notebooks',
    navSegment: 'jupyterhub',
  },
  {
    service: 'superset',
    label: 'Superset',
    icon: 'pi pi-chart-line',
    tone: 'primary',
    categoryKey: 'sql-bi',
    navSegment: 'superset',
  },
];

export interface BuiltInView {
  label: string;
  description: string;
  /** primeicons fallback when the view has no brand logo. */
  icon: string;
  /** Brand logo of the underlying technology. */
  brand?: BrandGlyph;
  /** Small primeicons glyph overlaid on the brand logo, telling sibling
   *  views of the same technology apart. */
  badge?: string;
  tone: ViewTone;
  /** NAV_CATEGORIES key the view is grouped under in the views sidebar. */
  categoryKey: string;
  path: (projectName: string) => string;
}

/** Rich technology-specific views that don't fit the "one service, one
 *  instance list" shape of the lateral menu (currently the Spark pages). */
export const BUILT_IN_VIEWS: BuiltInView[] = [
  {
    label: 'Spark Applications',
    description: 'Submitted Spark jobs and their live status',
    icon: 'pi pi-bolt',
    brand: siApachespark,
    badge: 'pi pi-bolt',
    tone: 'blue',
    categoryKey: 'data-engineering',
    path: (projectName) => `/projects/${projectName}/views/spark/applications`,
  },
];

/** Brand logo (with its badge) when the view has one, primeicons fallback
 *  otherwise — the views' counterpart of nav-config's navItemIcon. The badge
 *  inherits the surrounding text color, so it adapts to tiles and sidebar
 *  items alike. */
export function builtInViewIcon(view: BuiltInView): ReactNode {
  if (!view.brand) return view.icon;
  if (!view.badge) return <BrandIcon icon={view.brand} />;
  return (
    <span className="relative inline-flex shrink-0">
      <BrandIcon icon={view.brand} />
      <i
        className={`${view.badge} absolute -right-1 -bottom-0.5 rounded-full bg-surface p-px text-[0.5rem] leading-none`}
      ></i>
    </span>
  );
}

/** Brand logo borrowed from the service's lateral-menu entry, primeicons
 *  fallback otherwise — tiles and sidebar items show a service the same way. */
export function uiServiceViewIcon(view: UiServiceView): ReactNode {
  const navItem = navItemBySegment(view.navSegment);
  return navItem ? navItemIcon(navItem) : view.icon;
}

export interface UiServiceLauncher {
  svc: ServiceInstance;
  view: UiServiceView;
}

/** Instances that get a launcher — the same gate as the instance list's
 *  "Open" action: a known UI service exposing a URL. */
export function uiServiceLaunchers(instances: ServiceInstance[]): UiServiceLauncher[] {
  return instances.flatMap((svc) => {
    const view = UI_SERVICE_VIEWS.find((v) => v.service === svc.service);
    return view && svc.url ? [{ svc, view }] : [];
  });
}
