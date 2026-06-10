import { useLocation, useNavigate } from 'react-router-dom';
import { useProjectContext } from '../../../core/context/project-context';
import { ServiceList } from './service-list';

export interface ServicesPageProps {
  title?: string;
  subtitle?: string;
  deployLabel?: string;
  serviceFilter?: string;
  emptyMessage?: string;
  emptyTitle?: string;
  breadcrumbParent?: string;
  breadcrumbCurrent?: string;
}

interface ServiceAreaDefaults {
  breadcrumbParent: string;
  breadcrumbCurrent: string;
  subtitle: string;
  emptyTitle: string;
  // URL segments under /project/:projectId for this page's "service area".
  // Routes for deploy/edit/detail are mirrored under each area so the
  // sidebar highlights the correct entry (otherwise anything under
  // /services/* lights up the Jupyter link, even when the user clicked
  // Deploy from the Spark History Server page).
  basePath: string[];
}

function areaDefaults(serviceFilter: string): ServiceAreaDefaults {
  switch (serviceFilter) {
    case 'jupyterhub':
      return {
        breadcrumbParent: 'Notebook',
        breadcrumbCurrent: 'Jupyter',
        subtitle:
          "Launch and manage per-user JupyterLab environments running in this project's namespace.",
        emptyTitle: 'Launch your first Jupyter instance',
        basePath: ['services'],
      };
    case 'spark-history-server':
      return {
        breadcrumbParent: 'Spark',
        breadcrumbCurrent: 'History Server',
        subtitle: 'Browse completed Spark applications and stream live job monitoring UIs.',
        emptyTitle: 'Deploy a Spark History Server',
        basePath: ['spark', 'history-server'],
      };
    case 'trino':
      return {
        breadcrumbParent: 'Lakehouse',
        breadcrumbCurrent: 'Trino',
        subtitle:
          'Distributed SQL query engine. Query data across the lakehouse and federated sources.',
        emptyTitle: 'Deploy Trino',
        basePath: ['lakehouse', 'trino'],
      };
    case 'polaris':
      return {
        breadcrumbParent: 'Lakehouse',
        breadcrumbCurrent: 'Polaris',
        subtitle: 'Iceberg-native data catalog. Centralize table metadata across engines.',
        emptyTitle: 'Deploy Polaris',
        basePath: ['lakehouse', 'polaris'],
      };
    case 'superset':
      return {
        breadcrumbParent: 'SQL & BI',
        breadcrumbCurrent: 'Superset',
        subtitle: 'Open-source dashboarding and ad-hoc data exploration.',
        emptyTitle: 'Deploy Superset',
        basePath: ['bi', 'superset'],
      };
    case 'airflow':
      return {
        breadcrumbParent: 'Data Engineering',
        breadcrumbCurrent: 'Airflow',
        subtitle: 'Workflow orchestrator. Schedule and monitor data pipelines as DAGs.',
        emptyTitle: 'Deploy Airflow',
        basePath: ['data-engineering', 'airflow'],
      };
    default:
      return {
        breadcrumbParent: 'Services',
        breadcrumbCurrent: 'Instances',
        subtitle: '',
        emptyTitle: 'No instances yet',
        basePath: ['services'],
      };
  }
}

export default function ServicesPage(props: ServicesPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const context = useProjectContext();

  const serviceFilter = props.serviceFilter || '';
  const defaults = areaDefaults(serviceFilter);

  const title = props.title || 'Service instances';
  const deployLabel = props.deployLabel || 'New instance';
  const emptyMessage = props.emptyMessage || 'No instances deployed yet.';
  const subtitle = props.subtitle || defaults.subtitle;
  const emptyTitle = props.emptyTitle || defaults.emptyTitle;
  const breadcrumbParent = props.breadcrumbParent || defaults.breadcrumbParent;
  const breadcrumbCurrent = props.breadcrumbCurrent || defaults.breadcrumbCurrent;
  const basePath = defaults.basePath;

  const goToDeploy = () => {
    const project = context.currentProject;
    if (!project) return;

    const params = new URLSearchParams({ returnTo: location.pathname + location.search });
    if (serviceFilter) {
      params.set('service', serviceFilter);
    }
    navigate(`/project/${project.name}/${basePath.join('/')}/deploy?${params.toString()}`);
  };

  return (
    <div className="services-list animate-in">
      <div className="page-heading">
        <div>
          <div className="breadcrumb-thin">
            <span>{breadcrumbParent}</span>
            <i className="pi pi-angle-right" style={{ fontSize: '10px' }}></i>
            <span className="bc-current">{breadcrumbCurrent}</span>
          </div>
          <h1 className="page-title">{title}</h1>
          <p className="page-sub">{subtitle}</p>
        </div>
        <button className="create-btn" onClick={goToDeploy}>
          <i className="pi pi-plus"></i>
          <span>{deployLabel}</span>
        </button>
      </div>

      <ServiceList
        serviceFilter={serviceFilter}
        emptyMessage={emptyMessage}
        emptyTitle={emptyTitle}
        basePath={basePath}
        onDeploy={goToDeploy}
      />
    </div>
  );
}
