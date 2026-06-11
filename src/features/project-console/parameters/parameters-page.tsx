import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { projectApi } from '../../../core/api/project-api';
import { useProjectContext } from '../../../core/context/project-context';
import SectionHeading from '../../../shared/components/section-heading';
import DeleteConfirmDialog from '../../../shared/components/delete-confirm-dialog';

/** /projects/:projectId/parameters — per-project settings: description
 *  update and project deletion (moved here from the former /admin/projects
 *  page, keeping the type-to-confirm dialog). */
export default function ParametersPage() {
  const { currentProject } = useProjectContext();
  const toast = useRef<Toast>(null);

  const projectName = currentProject?.name ?? '';
  const savedDescription = currentProject?.description ?? '';

  const [draft, setDraft] = useState(savedDescription);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Re-seed the editor when the selected project changes (the project
  // switcher preserves the /parameters sub-route) or when an SSE MODIFIED
  // event delivers a fresh description.
  useEffect(() => {
    setDraft(savedDescription);
  }, [projectName, savedDescription]);

  // The description is "dirty" only when it differs from the saved one —
  // saving an unchanged (or still nonexistent) description must not hit
  // the API.
  const dirty = draft.trim() !== savedDescription.trim();

  const saveDescription = () => {
    if (!dirty || !currentProject) return;
    setSaving(true);
    projectApi
      .updateProject({ name: currentProject.name, description: draft.trim() })
      .then(() => {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Project description updated',
          life: 3000,
        });
      })
      .catch(() => {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update the project description',
          life: 5000,
        });
      })
      .finally(() => setSaving(false));
  };

  const deleteProject = () => {
    if (!currentProject) return;
    setConfirmDelete(false);
    setDeleting(true);
    // On success the backend's DELETED event removes the project from the
    // context list; the context then navigates away from the dead project.
    projectApi.deleteProject(currentProject.name).catch(() => {
      setDeleting(false);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete the project',
        life: 5000,
      });
    });
  };

  return (
    <section className="flex animate-[fadeInUp_0.4s_ease-out] flex-col gap-7">
      <div>
        <h1>Parameters</h1>
        <p className="mt-1 text-base text-fg-secondary">
          Settings for the <strong>{projectName}</strong> project.
        </p>
      </div>

      <SectionHeading>Description</SectionHeading>
      <div className="flex max-w-[560px] flex-col gap-3 rounded-lg border border-border-light bg-surface px-4 py-3">
        <label htmlFor="project-description" className="text-sm font-semibold text-fg">
          Project description
        </label>
        <InputTextarea
          id="project-description"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          autoResize
          placeholder="Describe the purpose of this project"
          className="w-full"
        />
        <div className="flex justify-end">
          <Button
            label="Save"
            icon="pi pi-check"
            size="small"
            disabled={!dirty}
            loading={saving}
            onClick={saveDescription}
          />
        </div>
      </div>

      <SectionHeading>Danger zone</SectionHeading>
      <div className="flex max-w-[560px] items-center justify-between gap-4 rounded-lg border border-border-light bg-surface px-4 py-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-fg">Delete this project</span>
          <span className="text-xs text-fg-muted">
            Removes the project and all its deployed services. This cannot be undone.
          </span>
        </div>
        {deleting ? (
          <span className="flex shrink-0 items-center gap-1.5 px-2 py-1 text-sm font-medium text-fg-secondary">
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
            className="shrink-0"
            onClick={() => setConfirmDelete(true)}
          />
        )}
      </div>

      <DeleteConfirmDialog
        resourceName={confirmDelete ? projectName : null}
        resourceKind="project"
        message={
          confirmDelete && (
            <>
              This will permanently delete <strong>{projectName}</strong> and all its deployed
              services. This cannot be undone.
            </>
          )
        }
        onHide={() => setConfirmDelete(false)}
        onConfirm={deleteProject}
      />

      <Toast ref={toast} position="bottom-right" />
    </section>
  );
}
