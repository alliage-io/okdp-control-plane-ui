import WelcomeBanner from '../../../shared/components/welcome-banner';
import SectionHeading from '../../../shared/components/section-heading';
import { ActionCard, QuickActions } from '../../../shared/components/action-card';

export default function AdminHome() {
  return (
    <div className="flex animate-[fadeInUp_0.4s_ease-out] flex-col gap-7">
      <WelcomeBanner
        icon="pi pi-cog"
        title="Administration"
        subtitle="Manage your projects, users, and platform settings from here."
      />

      <SectionHeading>Manage</SectionHeading>
      <QuickActions>
        <ActionCard
          to="/projects"
          icon="pi pi-th-large"
          tone="primary"
          title="Projects"
          description="Create and manage data projects"
        />
        <ActionCard
          to="/identity"
          icon="pi pi-users"
          tone="purple"
          title="Identity"
          description="Manage users and access control"
        />
      </QuickActions>
    </div>
  );
}
