import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { projectApi, type Project, type ProjectEvent } from '../../../core/api/project-api';
import { applyListEvent } from '../../../core/api/sse';
import { logger } from '../../../core/services/logger';
import { clearProjectColor, getProjectColor } from '../../../core/services/project-colors';
import DeleteConfirmDialog from '../../../shared/components/delete-confirm-dialog';

type ProjectRow = Project & { deleting: boolean };

/** /admin/projects — control plane administration of projects. Destructive
 *  operations live here (not on the /projects list): deletion goes through
 *  the type-to-confirm dialog. */
export default function AdminProjectsPage() {
  const toast = useRef<Toast>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const projectsRef = useRef<Project[]>([]);
  // Deletion runs until the backend's DELETED event removes the row; these
  // names render as "Deleting…" in the meantime.
  const [deletingNames, setDeletingNames] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

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
      if (event.type === 'DELETED') {
        clearProjectColor(project.name);
        setDeletingNames((names) => {
          if (!names.has(project.name)) return names;
          const next = new Set(names);
          next.delete(project.name);
          return next;
        });
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: `Project ${project.name} deleted`,
          life: 3000,
        });
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

  const deleteProject = (project: Project) => {
    setDeleteTarget(null);
    setDeletingNames((names) => new Set(names).add(project.name));
    projectApi.deleteProject(project.name).catch(() => {
      setDeletingNames((names) => {
        const next = new Set(names);
        next.delete(project.name);
        return next;
      });
      showError('Failed to delete project');
    });
  };

  // DataTable memoizes its rows against `value`: the deleting flag must be
  // part of the row objects for the cells to repaint when it flips.
  const rows = useMemo<ProjectRow[]>(
    () => projects.map((p) => ({ ...p, deleting: deletingNames.has(p.name) })),
    [projects, deletingNames],
  );

  return (
    <div className="workspace-container">
      <Link
        to="/admin"
        className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-fg-secondary no-underline transition-colors duration-150 ease-smooth hover:text-fg"
      >
        <i className="pi pi-arrow-left text-[0.75rem]"></i>
        Administration
      </Link>

      <div className="top-bar">
        <h1>Projects administration</h1>
      </div>
      <p className="-mt-4 mb-5 text-base text-fg-secondary">
        Delete projects from the platform. Deleting a project removes all its deployed services.
      </p>

      {loaded && projects.length === 0 ? (
        <p className="m-0 text-base text-fg-muted">There is no project on this platform.</p>
      ) : (
        <div className="table-wrapper">
          <DataTable
            value={rows}
            dataKey="name"
            className="minimal-table"
            emptyMessage="Loading projects…"
            rowClassName={(row: ProjectRow) =>
              row.deleting ? 'workspace-row opacity-50' : 'workspace-row'
            }
          >
            <Column
              header="Name"
              field="name"
              style={{ width: '30%' }}
              body={(project: ProjectRow) => (
                <span className="flex items-center gap-2 font-medium">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: getProjectColor(project.name) }}
                  ></span>
                  {project.name}
                </span>
              )}
            />
            <Column
              header="Description"
              field="description"
              style={{ width: '55%' }}
              className="description-cell"
              body={(project: ProjectRow) => project.description || '-'}
            />
            <Column
              style={{ width: '15%', textAlign: 'right' }}
              body={(project: ProjectRow) =>
                project.deleting ? (
                  <span className="flex items-center justify-end gap-1.5 px-2 py-1 text-sm font-medium text-fg-secondary">
                    <i className="pi pi-spin pi-spinner text-[0.85rem]"></i>
                    Deleting…
                  </span>
                ) : (
                  <Button
                    label="Delete"
                    icon="pi pi-trash"
                    severity="danger"
                    outlined
                    size="small"
                    onClick={() => setDeleteTarget(project)}
                  />
                )
              }
            />
          </DataTable>
        </div>
      )}

      <DeleteConfirmDialog
        resourceName={deleteTarget?.name ?? null}
        resourceKind="project"
        message={
          deleteTarget && (
            <>
              This will permanently delete <strong>{deleteTarget.name}</strong> and all its
              deployed services. This cannot be undone.
            </>
          )
        }
        onHide={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteProject(deleteTarget)}
      />

      <Toast ref={toast} position="bottom-right" />
    </div>
  );
}
