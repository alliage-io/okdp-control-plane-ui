import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { projectApi, type Project, type ProjectEvent } from '../../../core/api/project-api';
import { applyListEvent } from '../../../core/api/sse';
import { logger } from '../../../core/services/logger';
import { useAuth } from '../../../core/auth/auth-context';
import { useProjectContext } from '../../../core/context/project-context';
import {
  PROJECT_COLOR_PALETTE,
  clearProjectColor,
  getProjectColor,
  setProjectColor,
} from '../../../core/services/project-colors';
import EmptyState from '../../../shared/components/empty-state';
import { formatCpuCores, formatMemoryBytes } from '../../project-console/services/service-utils';
import { useProjectStats, type ProjectStats } from './use-project-stats';

type ProjectRow = Project & { stats?: ProjectStats };

/** KPI cell: pulse while loading, em dash when the metric is unreported. */
function StatCell({
  stats,
  value,
}: {
  stats: ProjectStats | undefined;
  value: (stats: ProjectStats) => string | number | null;
}) {
  if (!stats || !stats.metricsLoaded) {
    return <div className="metric-bar h-[5px] w-[48px] animate-pulse"></div>;
  }
  const v = value(stats);
  return v === null ? (
    <span className="text-sm text-fg-muted">—</span>
  ) : (
    <span className="text-sm text-fg-secondary">{v}</span>
  );
}

export default function ProjectList() {
  const auth = useAuth();
  const isAdmin = auth.hasRole('admins');
  const { currentProjectId } = useProjectContext();
  const toast = useRef<Toast>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  // Mirror of `projects` so the SSE handler can decide on toasts without
  // side effects inside the state updater (updaters must stay pure).
  const projectsRef = useRef<Project[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [visible, setVisible] = useState(false);
  const [newProject, setNewProject] = useState<Project>({ name: '', description: '' });
  const [newColor, setNewColor] = useState<string>(PROJECT_COLOR_PALETTE[0]);

  const showSuccess = (detail: string) =>
    toast.current?.show({ severity: 'success', summary: 'Success', detail, life: 3000 });

  const showError = (detail: string) =>
    toast.current?.show({ severity: 'error', summary: 'Error', detail, life: 5000 });

  const applyProjects = (next: Project[]) => {
    projectsRef.current = next;
    setProjects(next);
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const handleProjectEvent = (event: ProjectEvent) => {
      const project = event.object;
      const exists = projectsRef.current.some((p) => p.name === project.name);

      if (event.type === 'ADDED' && !exists) {
        showSuccess(`Project ${project.name} created`);
      } else if (event.type === 'DELETED' && exists) {
        showSuccess(`Project ${project.name} deleted`);
        clearProjectColor(project.name);
      }

      applyProjects(applyListEvent(projectsRef.current, event, (p) => p.name));
    };

    projectApi
      .getProjects()
      .then((data) => {
        if (cancelled) return;
        applyProjects(data);
        setLoaded(true);
        unsubscribe = projectApi.subscribeProjects({
          next: handleProjectEvent,
          error: (err) => logger.error('Stream error', err),
        });
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
        showError('Failed to load projects');
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const showDialog = () => {
    setNewProject({ name: '', description: '' });
    setNewColor(PROJECT_COLOR_PALETTE[0]);
    setVisible(true);
  };

  const createProject = () => {
    // Store the color before the request: the watch ADDED event often beats
    // the HTTP response, and the new row must not flash the fallback color.
    setProjectColor(newProject.name, newColor);
    projectApi
      .createProject(newProject)
      .then(() => setVisible(false))
      .catch((err) => {
        clearProjectColor(newProject.name);
        showError('Failed to create project');
        logger.error('Failed to create project', err);
      });
  };

  const dialogFooter = (
    <div className="dialog-actions">
      <Button severity="secondary" outlined label="Cancel" onClick={() => setVisible(false)} />
      <Button disabled={!newProject.name} onClick={createProject} label="Create" />
    </div>
  );

  const empty = loaded && projects.length === 0;

  const projectStats = useProjectStats(projects.map((p) => p.name));

  // DataTable memoizes its rows against `value`: the KPI aggregates must be
  // part of the row objects for the cells to repaint when they change.
  const rows = useMemo<ProjectRow[]>(
    () => projects.map((p) => ({ ...p, stats: projectStats[p.name] })),
    [projects, projectStats],
  );

  return (
    <div className="workspace-container">
      {/* Top Bar: Title (Left) | Create Button (Right), vertically aligned */}
      <div className="top-bar">
        <h1>Projects</h1>
        {isAdmin && !empty && (
          <Button label="Create project" onClick={showDialog} className="create-btn" />
        )}
      </div>

      {!empty && (
        <div className="mb-5">
          <IconField>
            <InputIcon className="pi pi-search" />
            <InputText
              type="text"
              placeholder="Filter projects..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </IconField>
        </div>
      )}

      {empty ? (
        /* Getting started: the platform has no project yet. */
        <EmptyState
          icon="pi pi-sparkles"
          title="Welcome to OKDP"
          description={
            isAdmin
              ? 'There is no project on this platform yet. Create your first project to get started.'
              : 'There is no project you can access yet. Ask your platform administrator to create one and grant you access.'
          }
          action={
            isAdmin && (
              <Button
                label="Create your first project"
                icon="pi pi-plus"
                onClick={showDialog}
                className="create-btn mt-3"
              />
            )
          }
        />
      ) : (
        /* Data Table */
        <div className="table-wrapper">
          <DataTable
            value={rows}
            dataKey="name"
            globalFilter={globalFilter}
            globalFilterFields={['name', 'description']}
            className="minimal-table"
            emptyMessage="No projects found."
            rowClassName={() => 'workspace-row'}
          >
            <Column
              header="Name"
              field="name"
              style={{ width: '30%' }}
              body={(project: ProjectRow) => (
                <span className="flex items-center gap-2">
                  <Link
                    to={`/projects/${project.name}`}
                    className="flex items-center gap-2 text-lg font-semibold text-fg no-underline transition-colors duration-150 ease-smooth hover:text-primary hover:underline"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: getProjectColor(project.name) }}
                    ></span>
                    {project.name}
                  </Link>
                  {project.name === currentProjectId && (
                    <span
                      className="rounded-full border border-(--db-primary-200) bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary"
                      title="The project currently open in the console"
                    >
                      Current
                    </span>
                  )}
                </span>
              )}
            />
            <Column
              header="Description"
              field="description"
              style={{ width: '34%' }}
              className="description-cell"
              body={(project: Project) => project.description || '-'}
            />
            <Column
              header="Instances"
              style={{ width: '9%' }}
              body={(project: ProjectRow) => (
                <StatCell stats={project.stats} value={(s) => s.instances} />
              )}
            />
            <Column
              header="CPU"
              style={{ width: '9%' }}
              body={(project: ProjectRow) => (
                <StatCell
                  stats={project.stats}
                  value={(s) => (s.cpuUsed === null ? null : formatCpuCores(s.cpuUsed))}
                />
              )}
            />
            <Column
              header="Memory"
              style={{ width: '9%' }}
              body={(project: ProjectRow) => (
                <StatCell
                  stats={project.stats}
                  value={(s) => (s.memUsed === null ? null : formatMemoryBytes(s.memUsed))}
                />
              )}
            />
          </DataTable>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog
        header="Create new project"
        visible={visible}
        modal
        draggable={false}
        resizable={false}
        style={{ width: '600px' }}
        className="db-dialog"
        closable
        onHide={() => setVisible(false)}
        footer={dialogFooter}
      >
        <div className="dialog-content">
          <div className="field">
            <label htmlFor="name">Project name</label>
            <InputText
              id="name"
              value={newProject.name}
              onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
              className="w-full dialog-input"
              placeholder="e.g., analytics-prod"
            />
          </div>

          <div className="field">
            <label htmlFor="description">
              Description <span className="optional">(optional)</span>
            </label>
            <InputTextarea
              id="description"
              value={newProject.description}
              onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))}
              rows={5}
              className="w-full dialog-input"
              placeholder="Briefly describe the purpose of this project..."
            />
          </div>

          <div className="field">
            <label id="project-color-label">
              Color <span className="optional">(only visible to you)</span>
            </label>
            <div
              className="flex items-center gap-2"
              role="radiogroup"
              aria-labelledby="project-color-label"
            >
              {PROJECT_COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={newColor === color}
                  aria-label={`Project color ${color}`}
                  className={`h-7 w-7 cursor-pointer rounded-full border-2 transition-transform duration-150 ease-smooth hover:scale-110 ${
                    newColor === color
                      ? 'border-fg ring-2 ring-(--db-primary-200)'
                      : 'border-transparent'
                  }`}
                  style={{ background: color }}
                  onClick={() => setNewColor(color)}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </Dialog>

      <Toast ref={toast} position="bottom-right" />
    </div>
  );
}
