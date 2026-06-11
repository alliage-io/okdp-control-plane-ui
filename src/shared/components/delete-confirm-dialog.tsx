import { useEffect, useState, type ReactNode } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

interface DeleteConfirmDialogProps {
  /** Name of the resource being deleted; null hides the dialog. */
  resourceName: string | null;
  /** Lowercase resource kind for the copy (e.g. "project", "instance"). */
  resourceKind: string;
  /** Extra consequence warning rendered above the confirmation input. */
  message?: ReactNode;
  onHide: () => void;
  onConfirm: (name: string) => void;
}

/** GitHub-style destructive confirmation: the resource name must be typed
 *  (or pasted) before the Delete button arms. */
export default function DeleteConfirmDialog({
  resourceName,
  resourceKind,
  message,
  onHide,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [typed, setTyped] = useState('');

  // Fresh input each time the dialog opens for a (possibly new) resource.
  useEffect(() => setTyped(''), [resourceName]);

  const armed = resourceName !== null && typed === resourceName;
  const confirm = () => {
    if (armed) onConfirm(resourceName);
  };

  return (
    <Dialog
      header={`Delete this ${resourceKind}?`}
      visible={resourceName !== null}
      modal
      draggable={false}
      resizable={false}
      style={{ width: '460px' }}
      className="db-dialog"
      onHide={onHide}
      footer={
        <div className="dialog-actions">
          <Button severity="secondary" outlined label="Cancel" onClick={onHide} />
          <Button severity="danger" label="Delete" disabled={!armed} onClick={confirm} />
        </div>
      }
    >
      <div className="dialog-content">
        {message && <p className="m-0 text-sm text-fg-secondary">{message}</p>}
        <div className="field">
          <label htmlFor="delete-confirm-input">
            Type <strong className="select-all">{resourceName}</strong> to confirm
          </label>
          <InputText
            id="delete-confirm-input"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirm();
            }}
            className="w-full dialog-input"
            placeholder={resourceName ?? ''}
            autoFocus
          />
        </div>
      </div>
    </Dialog>
  );
}
