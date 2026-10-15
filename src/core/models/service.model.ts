import type { ListEvent } from '../api/sse';

// --- Platform Services (core OKDP, full lifecycle management) ---

export interface PlatformService {
  name: string;
  // The directories of the service's package in the catalogs,
  // `catalog/<name>/<version>/`, highest first.
  versions: string[];
  // The menu entry's default when the catalogs have it, else the highest.
  defaultVersion: string;
  description: string;
  icon?: string;
  category?: string;
  // The catalog repository (its name in platform/catalog.yaml) holding the
  // service's package. Read only: a service is in one catalog.
  repository?: string;
  // Display name shown in the console menu; the service `name` (its identity
  // and route) is used when empty.
  label?: string;
  // false for infrastructure-only packages (operators, storage backends) with
  // no console page; undefined when the catalog does not set it, which the
  // console treats as exposing a UI. Drives whether the service appears in the
  // catalog-driven project menu.
  exposesUI?: boolean;
}

/**
 * A console navigation section, from the Context (spec.context.okdp.categories,
 * served by GET /api/platform-categories). It gives a service's `category` key
 * a display label, an optional section icon and an order, so the project menu
 * is grouped and ordered from the catalog rather than hardcoded in the UI.
 */
export interface MenuCategory {
  key: string;
  label: string;
  icon?: string;
  /** Optional on the wire; categories without it sort as 0. */
  order?: number;
}

/**
 * Write payload for the catalog-management endpoints (POST/PUT
 * /api/platform-services): the service's console menu entry. The service's
 * package must be in a catalog (400 otherwise). `defaultVersion` is optional
 * — the highest version is deployed when it is omitted. The versions are the
 * catalogs': the server checks the ones given (and the default) against them,
 * a `catalog/<name>/<version>/` directory of a catalog repository, and
 * rejects the request (400) when one does not exist. Neither `versions` nor
 * `repository` is stored: the console sends neither.
 */
export interface PlatformServiceRequest {
  name: string;
  versions?: string[];
  defaultVersion?: string;
  description?: string;
  icon?: string;
  category?: string;
  repository?: string;
  label?: string;
  exposesUI?: boolean;
}

export interface DeployServiceRequest {
  service: string;
  tag?: string;
  instanceName?: string;
  parameters: Record<string, unknown>;
}

export interface ServiceInstance {
  name: string;
  /** Helm release name, `<project>-<instance>`. */
  releaseName: string;
  service: string;
  /** Package version: the catalog's `catalog/<service>/<version>/`. */
  serviceTag: string;
  /**
   * `Pending` (committed to Git, the GitOps engine has no HelmRelease or
   * Application for it yet), `Installing`, `Updating`, `Ready` or `Error`.
   */
  status: string;
  /**
   * Human-readable explanation set by the backend when status is not
   * "Ready": the GitOps engine's condition message (Flux Ready/Stalled, Argo
   * CD conditions or health), else the latest Warning event.
   */
  statusMessage?: string;
  targetNamespace: string;
  /** What the instance publishes (its compiled `okdp.info.yaml`); empty
   *  until it is compiled, or when it publishes none. */
  url?: string;
  /** Markdown usage notes the instance publishes (`okdp.info.yaml`). */
  usage?: string;
  parameters: Record<string, unknown>;
  /** The connections the instance is bound to. */
  connections?: ServiceConnection[];
  /** Creation of the engine object; empty while `Pending`. */
  createdAt?: string;
  /** Git commit SHA of the change. Only set on deploy and edit responses. */
  revision?: string;
}

/** One connection a deployed service is bound to. */
export interface ServiceConnection {
  name: string;
  namespace?: string;
  /** `Connection`: an external connection file the instance layers in.
   *  `Instance`: an output of another instance of the project. */
  kind: 'Connection' | 'Instance' | string;
  /** False while the connection file the instance layers in is missing. */
  resolved: boolean;
}

export type ServiceEvent = ListEvent<ServiceInstance>;

export interface Pod {
  name: string;
  status: string;
  ready: string;
  restarts: number;
  age: string;
  containers: PodContainer[];
}

export interface PodContainer {
  name: string;
  image: string;
  ready: boolean;
}

export interface MetricValue {
  usedRaw: number;
  limitRaw: number;
  used: string;
  limit: string;
  pct: number;
  available: boolean;
}

export interface ServiceMetrics {
  cpu: MetricValue;
  memory: MetricValue;
}

/** What one chart of an instance is rendered with
 *  (`GET …/services/:name/values`): the upstream chart's defaults under its
 *  compiled values in the deployments repository, next to those defaults. */
export interface RenderedValues {
  /** The chart key of the service chart (or the chart itself, for a chart
   *  without service definition). */
  name: string;
  /** The upstream chart that renders them. */
  chart: string;
  /** That chart, `<name>-<version>`. */
  chartVersion: string;
  /** Version of the instance's package the values were compiled for. */
  serviceVersion: string;
  /** The values.yaml the chart is rendered with: the chart's defaults
   *  coalesced under the compiled values. The compiled values only when the
   *  defaults could not be read (see `defaultsError`). */
  values: string;
  /** The upstream chart's own values.yaml, as published. Absent when it
   *  could not be read (see `defaultsError`). */
  defaults?: string;
  /** 1-based lines of `values` that differ from `defaults`: set by OKDP or
   *  the instance. The other lines are the chart's defaults. */
  changedLines: number[];
  /** Why the defaults are missing, or could not be compared. */
  defaultsError?: string;
}
