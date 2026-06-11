import { useEffect, useRef, useState } from 'react';
import { serviceApi } from '../../../core/api/service-api';
import { applyListEvent } from '../../../core/api/sse';
import type { ServiceInstance, ServiceMetrics } from '../../../core/models/service.model';

export interface ProjectServicesSummary {
  instances: ServiceInstance[];
  metrics: Record<string, ServiceMetrics>;
  loaded: boolean;
}

/** Live picture of the project's deployed services: initial REST fetch
 *  merged with SSE updates, plus one metrics request per instance. Shared
 *  by the overview KPI strip and the deployed-services table. */
export function useProjectServicesSummary(projectId: string | undefined): ProjectServicesSummary {
  const [instances, setInstances] = useState<ServiceInstance[]>([]);
  const [metrics, setMetrics] = useState<Record<string, ServiceMetrics>>({});
  const [loaded, setLoaded] = useState(false);
  // Metrics are fetched once per instance — SSE status churn must not
  // re-trigger the per-row requests.
  const fetchedMetricsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setInstances([]);
    setMetrics({});
    setLoaded(false);
    fetchedMetricsRef.current = new Set();

    serviceApi
      .getServices(projectId)
      .then((data) => {
        if (cancelled) return;
        setInstances(data);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });

    const unsubscribe = serviceApi.subscribeServices(projectId, {
      next: (event) => setInstances((list) => applyListEvent(list, event, (s) => s.name)),
      error: () => undefined,
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    // SSE events churn the `instances` array identity, re-running this
    // effect while requests are in flight; staleness is therefore keyed on
    // the per-project fetch set (replaced when projectId changes), not on a
    // per-run cancelled flag.
    const fetched = fetchedMetricsRef.current;
    for (const svc of instances) {
      if (fetched.has(svc.name)) continue;
      fetched.add(svc.name);
      serviceApi
        .getServiceMetrics(projectId, svc.name)
        .then((m) => {
          if (fetchedMetricsRef.current === fetched) {
            setMetrics((prev) => ({ ...prev, [svc.name]: m }));
          }
        })
        .catch(() => undefined);
    }
  }, [instances, projectId]);

  return { instances, metrics, loaded };
}
