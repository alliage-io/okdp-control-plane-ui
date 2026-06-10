import { HttpError } from '../../../core/api/http';

/** Map an instance/pod status to the okdp tag color class. */
export function tagClass(status: string): string {
  switch (status) {
    case 'Ready':
    case 'Running':
      return 'okdp-tag-success';
    case 'Installing':
    case 'Updating':
      return 'okdp-tag-warn';
    case 'Error':
    case 'CrashLoopBackOff':
    case 'Failed':
      return 'okdp-tag-danger';
    default:
      return 'okdp-tag-info';
  }
}

/** Breadcrumb back-link label for a service name. */
export function parentLabel(service: string | undefined | null): string {
  if (service === 'jupyterhub') return 'Jupyter';
  if (service === 'spark-history-server') return 'History Server';
  if (service === 'trino') return 'Trino';
  if (service === 'polaris') return 'Polaris';
  if (service === 'superset') return 'Superset';
  if (service === 'airflow') return 'Airflow';
  return service || 'Services';
}

/** Extract the backend `error` field from a failed request, with fallback. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpError && err.body) {
    try {
      const parsed = JSON.parse(err.body);
      if (parsed && typeof parsed.error === 'string') {
        return parsed.error;
      }
    } catch {
      // not JSON — fall through
    }
  }
  return fallback;
}

/** Angular `date: 'mediumDate'` equivalent (e.g. "Jun 10, 2026"). */
export function formatMediumDate(value: string | undefined | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Angular `date: 'medium'` equivalent (e.g. "Jun 10, 2026, 1:15:00 PM"). */
export function formatMediumDateTime(value: string | undefined | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}
