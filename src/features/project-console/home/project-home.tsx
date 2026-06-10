import { useProjectContext } from '../../../core/context/project-context';
import WelcomeBanner from '../../../shared/components/welcome-banner';
import SectionHeading from '../../../shared/components/section-heading';
import { ActionCard, QuickActions } from '../../../shared/components/action-card';
import EmptyState from '../../../shared/components/empty-state';
import CtaButton from '../../../shared/components/cta-button';
import './project-home.css';

export default function ProjectHome() {
  const context = useProjectContext();
  const project = context.currentProject;

  return (
    <section className="home">
      {project ? (
        <>
          <WelcomeBanner
            icon="pi pi-th-large"
            title={project.name}
            subtitle={project.description || 'Project Dashboard'}
          />

          <SectionHeading>Quick Actions</SectionHeading>
          <QuickActions>
            <ActionCard
              to={`/project/${project.name}/services/deploy`}
              icon="pi pi-play"
              tone="primary"
              title="Deploy Notebook"
              description="Launch a new Jupyter instance"
            />
            <ActionCard
              to={`/project/${project.name}/services`}
              icon="pi pi-server"
              tone="blue"
              title="View Instances"
              description="Monitor running notebooks"
            />
            <ActionCard
              to={`/project/${project.name}/secret-stores`}
              icon="pi pi-lock"
              tone="purple"
              title="Manage Secrets"
              description="Configure secret stores"
            />
          </QuickActions>
        </>
      ) : context.availableProjects.length === 0 ? (
        <EmptyState
          icon="pi pi-folder-open"
          title="No Projects Available"
          description="Your workspace is empty. Create your first project to get started."
          action={
            <CtaButton to="/admin/projects" icon="pi pi-plus">
              Create Project
            </CtaButton>
          }
        />
      ) : (
        <div className="loading-state">
          <i className="pi pi-spin pi-spinner"></i>
          <p>Loading project...</p>
        </div>
      )}
    </section>
  );
}
