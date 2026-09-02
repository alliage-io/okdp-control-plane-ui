import { StatusTag } from '../../../shared/components/status-tag';
import { isTransitioning, statusHint, statusTone } from './service-utils';

/** The status pill of a service instance. `Pending` (committed to Git, the
 *  GitOps engine has not reconciled it yet) reads differently from the engine
 *  rolling the release out, so the two are not confused. */
export function ServiceStatusTag({
  status,
  statusMessage,
}: {
  status: string;
  statusMessage?: string;
}) {
  return (
    <StatusTag
      value={status || 'Unknown'}
      tone={statusTone(status)}
      pulse={isTransitioning(status)}
      icon={
        status === 'Pending' ? <i className="pi pi-clock text-[0.7rem]" aria-hidden /> : undefined
      }
      title={statusMessage || statusHint(status) || undefined}
    />
  );
}
