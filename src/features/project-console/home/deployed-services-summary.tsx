import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import type {
  MetricValue,
  ServiceInstance,
  ServiceMetrics,
} from '../../../core/models/service.model';
import { areaBasePath, parentLabel, tagClass } from '../services/service-utils';
import type { ProjectServicesSummary } from './use-project-services-summary';

/** Compact version of the detail page's metric card: used / limit over a
 *  tone-colored usage bar. `metric` undefined = request still in flight. */
function MetricCell({ metric }: { metric: MetricValue | undefined }) {
  if (!metric) {
    return <div className="metric-bar h-[5px] w-[110px] animate-pulse"></div>;
  }
  if (!metric.available) {
    return <span className="text-sm text-fg-muted">—</span>;
  }
  // limitRaw 0 = no limit configured; a bar against 0 would read as exhausted.
  if (metric.limitRaw <= 0) {
    return (
      <span className="text-sm text-fg-secondary">
        {metric.used} <span className="text-xs text-fg-muted">· no limit</span>
      </span>
    );
  }
  const tone = metric.pct > 0.8 ? 'tone-danger' : metric.pct > 0.6 ? 'tone-warn' : '';
  return (
    <div className="flex w-[110px] flex-col gap-1">
      <span className="text-sm text-fg-secondary">
        {metric.used} <span className="text-fg-muted">/ {metric.limit}</span>
      </span>
      <div className="metric-bar h-[5px]!">
        <div
          className={`metric-fill ${tone}`}
          style={{ width: `${Math.min(metric.pct, 1) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}

type SummaryRow = ServiceInstance & { metrics?: ServiceMetrics };

/** Overview summary of every service instance deployed in the project:
 *  live status (SSE), resource usage and a link to the detail page. */
export default function DeployedServicesSummary({
  projectId,
  summary,
}: {
  projectId: string;
  summary: ProjectServicesSummary;
}) {
  const { instances, metrics, loaded } = summary;

  // DataTable memoizes its rows against `value`: metrics must be part of
  // the row objects, or cells would not refresh when they arrive.
  const rows = useMemo<SummaryRow[]>(
    () => instances.map((svc) => ({ ...svc, metrics: metrics[svc.name] })),
    [instances, metrics],
  );

  if (!loaded) {
    return (
      <div className="flex items-center gap-3 py-2">
        <i className="pi pi-spin pi-spinner text-[18px] text-primary"></i>
        <div>
          <strong className="text-fg">Loading deployed services…</strong>
          <div className="text-sm text-fg-muted">Fetching service instances and metrics.</div>
        </div>
      </div>
    );
  }

  if (instances.length === 0) {
    return <p className="m-0 text-base text-fg-muted">No services deployed in this project yet.</p>;
  }

  return (
    <div className="table-wrapper">
      <DataTable value={rows} dataKey="name" className="minimal-table">
        <Column
          header="Instance"
          field="name"
          body={(svc: SummaryRow) => (
            <Link
              to={`/projects/${projectId}/${areaBasePath(svc.service).join('/')}/${svc.name}`}
              className="font-medium text-fg no-underline transition-colors duration-150 ease-smooth hover:text-primary hover:underline"
            >
              {svc.name}
            </Link>
          )}
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
        <Column header="CPU" body={(svc: SummaryRow) => <MetricCell metric={svc.metrics?.cpu} />} />
        <Column
          header="Memory"
          body={(svc: SummaryRow) => <MetricCell metric={svc.metrics?.memory} />}
        />
      </DataTable>
    </div>
  );
}
