const K8S_NAME_PATTERN = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;

/** RFC 1123 label validation shared by the resource-create dialogs.
 *  Returns '' when valid; otherwise the message to render under the input. */
export function k8sNameError(name: string): string {
  if (!name) return '';
  if (name.length > 63) return 'Maximum 63 characters';
  if (!K8S_NAME_PATTERN.test(name)) {
    return 'Lowercase letters, numbers and hyphens only (must start/end with alphanumeric)';
  }
  return '';
}

/** Longest Helm release name: Helm refuses more than 53 characters. */
export const MAX_RELEASE_NAME = 53;

/** The instance name of a project service, whose Helm release is
 *  `<project>-<instance>`. Returns '' when valid. */
export function instanceNameError(project: string, name: string): string {
  const base = k8sNameError(name);
  if (base || !name || !project) return base;
  const release = `${project}-${name}`;
  if (release.length > MAX_RELEASE_NAME) {
    return `Too long: the release name "${release}" exceeds ${MAX_RELEASE_NAME} characters (at most ${Math.max(0, MAX_RELEASE_NAME - project.length - 1)} for this project)`;
  }
  return '';
}
