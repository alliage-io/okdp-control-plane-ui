import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { serviceApi } from '../../../core/api/service-api';
import { applyListEvent } from '../../../core/api/sse';
import type {
  MetricValue,
  ServiceInstance,
  ServiceMetrics,
} from '../../../core/models/service.model';
import { areaBasePath, parentLabel, tagClass } from '../services/service-utils';

function metricCell(metric: MetricValue | undefined): string {
  if (!metric || !metric.available) {
    return '—';
  }
  // limitRaw 0 = no limit configured; showing "/ 0" would read as exhausted.
  return metric.limitRaw > 0 ? `${metric.used} / ${metric.limit}` : metric.used;
}

type SummaryRow = ServiceInstance & { metrics?: ServiceMetrics };

/** Overview summary of every service instance deployed in the project:
 *  live status (SSE), resource usage and a link to the detail page. */
export default function DeployedServicesSummary({ projectId }: { projectId: string }) {
  const [instances, setInstances] = useState<ServiceInstance[]>([]);
  const [metrics, setMetrics] = useState<Record<string, ServiceMetrics>>({});
  const [loaded, setLoaded] = useState(false);
  // Metrics are fetched once per instance — SSE status churn must not
  // re-trigger the per-row requests.
  const fetchedMetricsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
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

  // DataTable memoizes its rows against `value`: metrics must be part of
  // the row objects, or cells would not refresh when they arrive.
  const rows = useMemo<SummaryRow[]>(
    () => instances.map((svc) => ({ ...svc, metrics: metrics[svc.name] })),
    [instances, metrics],
  );

  if (!loaded) {
    return null;
  }

  if (instances.length === 0) {
    return (
      <p className="m-0 text-base text-fg-muted">
        No services deployed in this project yet — use the quick actions below to get started.
      </p>
    );
  }

  return (
    <div className="table-wrapper">
      <DataTable value={rows} dataKey="name" className="minimal-table">
        <Column
          header="Instance"
          field="name"
          body={(svc: SummaryRow) => <span className="font-medium">{svc.name}</span>}
        />
        <Column
          header="Service"
          body={(svc: SummaryRow) => (
            <span className="text-fg-secondary">
              {parentLabel(svc.service)}
              <span className="ml-1.5 text-sm text-fg-muted">{svc.serviceTag}</span>
            </span>
          )}
        />
        <Column
          header="Status"
          body={(svc: SummaryRow) => (
            <span className={`okdp-tag ${tagClass(svc.status)}`} title={svc.statusMessage}>
              <span className="okdp-tag-dot"></span>
              {svc.status}
            </span>
          )}
        />
        <Column
          header="CPU"
          body={(svc: SummaryRow) => (
            <span className="text-sm text-fg-secondary">{metricCell(svc.metrics?.cpu)}</span>
          )}
        />
        <Column
          header="Memory"
          body={(svc: SummaryRow) => (
            <span className="text-sm text-fg-secondary">{metricCell(svc.metrics?.memory)}</span>
          )}
        />
        <Column
          style={{ textAlign: 'right' }}
          body={(svc: SummaryRow) => (
            <div className="actions">
              <Link
                to={`/projects/${projectId}/${areaBasePath(svc.service).join('/')}/${svc.name}`}
                className="action-link primary"
                style={{ textDecoration: 'none' }}
              >
                Open <i className="pi pi-arrow-right"></i>
              </Link>
            </div>
          )}
        />
      </DataTable>
    </div>
  );
}
