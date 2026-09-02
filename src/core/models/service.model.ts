import type { ListEvent } from '../api/sse';

// --- Platform Services (core OKDP, full lifecycle management) ---

export interface PlatformService {
  name: string;
  versions: string[];
  defaultVersion: string;
  description: string;
  icon?: string;
  category?: string;
  // Per-service package repository override (defaults to the Context's global
  // packageRepository when empty). Versions are resolved against this registry.
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
 * /api/platform-services). `defaultVersion` is optional on the wire — the
 * server falls back to the first version when it is omitted. The server also
 * validates each version against the OCI registry (quay.io) and rejects the
 * request (400) when a version does not exist. `repository` overrides the
 * package registry for this service; omitted means the global one is used.
 */
export interface PlatformServiceRequest {
  name: string;
  versions: string[];
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
  /** Chart version. */
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
  /** From the instance descriptor; empty until the chart has rendered it. */
  url?: string;
  /** Markdown usage notes from the instance descriptor. */
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
