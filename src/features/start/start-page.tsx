import { Navigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/auth-context';
import { useProjectContext } from '../../core/context/project-context';
import CtaButton from '../../shared/components/cta-button';

/** Standalone view shown at /home when the platform has no project yet. */
function GettingStarted() {
  const auth = useAuth();
  const isAdmin = auth.hasRole('admins');

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-surface-secondary p-6">
      <div className="flex items-center gap-2">
        <img src="/images/okdp-notext.svg" alt="okdp" className="h-auto w-8" />
        <span className="text-2xl font-bold tracking-[-0.02em] text-fg">okdp</span>
        <span className="text-2xl font-normal text-fg-secondary">console</span>
      </div>

      <div className="flex w-full max-w-[480px] flex-col items-center gap-2 rounded-2xl border border-border-light bg-surface p-8 text-center shadow-(--db-shadow-card)">
        <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
          <i className="pi pi-sparkles text-[1.3rem] text-primary"></i>
        </div>
        <h1 className="m-0 text-xl font-semibold text-fg">Welcome to OKDP</h1>
        <p className="m-0 text-base text-fg-secondary">
          There is no project on this platform yet.
        </p>
        {isAdmin ? (
          <>
            <p className="m-0 text-base text-fg-secondary">
              Create your first project to get started.
            </p>
            <CtaButton to="/projects" icon="pi pi-plus">
              Create your first project
            </CtaButton>
          </>
        ) : (
          <p className="m-0 text-base text-fg-secondary">
            Ask your platform administrator to create a project and grant you access.
          </p>
        )}
      </div>

      <button
        className="cursor-pointer border-none bg-transparent text-sm text-fg-muted underline-offset-2 hover:text-fg-secondary hover:underline"
        onClick={() => auth.logout()}
      >
        Sign out
      </button>
    </div>
  );
}

/**
 * Authenticated entry point (/home): routes to the default project when one
 * exists, otherwise shows the getting-started view.
 */
export default function StartPage() {
  const { availableProjects, isLoading, getLastSelectedProjectId } = useProjectContext();

  if (isLoading) {
    return null;
  }

  if (availableProjects.length > 0) {
    const lastId = getLastSelectedProjectId();
    const target = availableProjects.find((p) => p.name === lastId) ?? availableProjects[0];
    return <Navigate to={`/project/${target.name}`} replace />;
  }

  return <GettingStarted />;
}
