import type { ServiceInstance } from '../../core/models/service.model';

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
    service: 'superset',
    label: 'Superset',
    icon: 'pi pi-chart-line',
    tone: 'primary',
    categoryKey: 'sql-bi',
    navSegment: 'superset',
  },
];

export interface CustomView {
  label: string;
  description: string;
  icon: string;
  tone: ViewTone;
  /** NAV_CATEGORIES key the view is grouped under in the views sidebar. */
  categoryKey: string;
  path: (projectName: string) => string;
}

/** Rich technology-specific views that don't fit the "one service, one
 *  instance list" shape of the lateral menu (currently the Spark pages). */
export const CUSTOM_VIEWS: CustomView[] = [
  {
    label: 'Spark Applications',
    description: 'Submitted Spark jobs and their live status',
    icon: 'pi pi-bolt',
    tone: 'blue',
    categoryKey: 'data-engineering',
    path: (projectName) => `/projects/${projectName}/spark/applications`,
  },
];

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
