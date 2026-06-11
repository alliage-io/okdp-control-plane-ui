import { ActionCard, QuickActions } from '../../shared/components/action-card';

/** /admin — control plane administration zone. Tiles fan out to the
 *  individual administration areas (identity only, for now). */
export default function AdminPage() {
  return (
    <section className="flex animate-[fadeInUp_0.4s_ease-out] flex-col gap-7">
      <div>
        <h1>Administration</h1>
        <p className="mt-1 text-base text-fg-secondary">
          Control plane administration. These settings apply to the whole platform.
        </p>
      </div>

      <QuickActions>
        <ActionCard
          to="/identity"
          icon="pi pi-users"
          tone="primary"
          title="Identity"
          description="Manage users and groups"
        />
        <ActionCard
          to="/admin/projects"
          icon="pi pi-folder"
          tone="purple"
          title="Projects"
          description="Delete projects from the platform"
        />
      </QuickActions>
    </section>
  );
}
