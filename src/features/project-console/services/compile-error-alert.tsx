/**
 * The compiler's refusal of an instance (400, code `does-not-compile`):
 * nothing was committed. Its message is shown as the server wrote it, one
 * problem per line, until the next attempt.
 */
export function CompileErrorAlert({ message }: { message: string }) {
  return (
    <div className="alert alert-danger compile-error" role="alert">
      <i className="pi pi-exclamation-circle"></i>
      <div>
        <strong>The instance does not compile, nothing was committed</strong>
        <pre className="mono">{message}</pre>
      </div>
    </div>
  );
}
