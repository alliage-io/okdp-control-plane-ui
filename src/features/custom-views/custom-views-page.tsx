import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjectContext } from '../../core/context/project-context';
import { serviceApi } from '../../core/api/service-api';
import { applyListEvent } from '../../core/api/sse';
import type { ServiceInstance } from '../../core/models/service.model';
import { logger } from '../../core/services/logger';
import { ActionCard, QuickActions } from '../../shared/components/action-card';
import SectionHeading from '../../shared/components/section-heading';

/** Services whose deployed instances expose a web UI worth a launcher tile. */
const UI_SERVICES: Record<
  string,
  { label: string; icon: string; tone: 'primary' | 'blue' | 'purple' }
> = {
  airflow: { label: 'Airflow', icon: 'pi pi-sitemap', tone: 'blue' },
  'spark-history-server': { label: 'Spark History Server', icon: 'pi pi-history', tone: 'purple' },
  superset: { label: 'Superset', icon: 'pi pi-chart-line', tone: 'primary' },
};

/** /views — service UI launchers plus rich technology-specific views that
 *  don't fit the "one service, one instance list" shape of the lateral menu
 *  (currently the Spark pages). Reached from the user dropdown; tiles target
 *  the selected project. */
export default function CustomViewsPage() {
  const { currentProject } = useProjectContext();
  const projectName = currentProject?.name;

  const [instances, setInstances] = useState<ServiceInstance[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Initial REST fetch + SSE merge, like every live list in the app.
  useEffect(() => {
    if (!projectName) return;
    let cancelled = false;
    setLoaded(false);
    setInstances([]);

    serviceApi
      .getServices(projectName)
      .then((data) => {
        if (cancelled) return;
        setInstances(data);
        setLoaded(true);
      })
      .catch((err) => {
        if (cancelled) return;
        logger.error('Failed to load services for views', err);
        setLoaded(true);
      });

    const unsubscribe = serviceApi.subscribeServices(projectName, {
      next: (event) => setInstances((current) => applyListEvent(current, event, (s) => s.name)),
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [projectName]);

  // The same gate as the instance list's "Open" action: a tile needs a URL,
  // and stays inert until the instance is Ready.
  const uiInstances = instances.filter((svc) => UI_SERVICES[svc.service] && svc.url);

  return (
    <section className="flex animate-[fadeInUp_0.4s_ease-out] flex-col gap-7">
      <div>
        <h1>Views</h1>
        <p className="mt-1 text-base text-fg-secondary">
          {projectName ? (
            <>
              Service UIs and specialized views for the <strong>{projectName}</strong> project.
            </>
          ) : (
            'Service UIs and specialized views scoped to a project.'
          )}
        </p>
      </div>

      {projectName ? (
        <>
          <div className="flex flex-col gap-3">
            <SectionHeading>Services</SectionHeading>
            {!loaded ? (
              <p className="m-0 flex items-center gap-2 text-base text-fg-muted">
                <i className="pi pi-spin pi-spinner"></i> Loading deployed services…
              </p>
            ) : uiInstances.length > 0 ? (
              <QuickActions>
                {uiInstances.map((svc) => {
                  const ui = UI_SERVICES[svc.service];
                  const ready = svc.status === 'Ready';
                  return (
                    <ActionCard
                      key={svc.name}
                      to={svc.url!}
                      external
                      disabled={!ready}
                      icon={ui.icon}
                      tone={ui.tone}
                      title={ui.label}
                      description={
                        ready ? `Open ${svc.name} in a new tab` : `${svc.name} — ${svc.status}`
                      }
                    />
                  );
                })}
              </QuickActions>
            ) : (
              <p className="m-0 text-base text-fg-muted">
                No deployed service exposes a web UI in this project yet.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <SectionHeading>Custom views</SectionHeading>
            <QuickActions>
              <ActionCard
                to={`/projects/${projectName}/spark/applications`}
                icon="pi pi-bolt"
                tone="blue"
                title="Spark Applications"
                description="Submitted Spark jobs and their live status"
              />
            </QuickActions>
          </div>
        </>
      ) : (
        <p className="m-0 text-base text-fg-muted">
          <Link to="/projects" className="text-primary">
            Select a project
          </Link>{' '}
          to access its views.
        </p>
      )}
    </section>
  );
}
