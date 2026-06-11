import { Link } from 'react-router-dom';
import { useProjectContext } from '../../core/context/project-context';
import { ActionCard, QuickActions } from '../../shared/components/action-card';

/** /views — rich technology-specific views that don't fit the "one service,
 *  one instance list" shape of the lateral menu (currently the Spark pages).
 *  Reached from the user dropdown; tiles target the selected project. */
export default function CustomViewsPage() {
  const { currentProject } = useProjectContext();
  const projectName = currentProject?.name;

  return (
    <section className="flex animate-[fadeInUp_0.4s_ease-out] flex-col gap-7">
      <div>
        <h1>Custom views</h1>
        <p className="mt-1 text-base text-fg-secondary">
          {projectName ? (
            <>
              Specialized views for the <strong>{projectName}</strong> project.
            </>
          ) : (
            'Specialized views scoped to a project.'
          )}
        </p>
      </div>

      {projectName ? (
        <QuickActions>
          <ActionCard
            to={`/projects/${projectName}/spark/applications`}
            icon="pi pi-bolt"
            tone="blue"
            title="Spark Applications"
            description="Submitted Spark jobs and their live status"
          />
          <ActionCard
            to={`/projects/${projectName}/spark/history-server`}
            icon="pi pi-history"
            tone="purple"
            title="Spark History Server"
            description="Browse completed Spark applications"
          />
        </QuickActions>
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
