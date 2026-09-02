import { describe, it, expect } from 'vitest';
import { instanceNameError, k8sNameError } from './k8s-names';

describe('instanceNameError', () => {
  it('accepts a DNS label whose release name fits Helm', () => {
    expect(instanceNameError('demo', 'trino')).toBe('');
  });

  it('keeps the label rules', () => {
    expect(instanceNameError('demo', 'Trino')).toBe(k8sNameError('Trino'));
    expect(instanceNameError('demo', 'a.b')).not.toBe('');
  });

  it('refuses a release name over 53 characters', () => {
    const project = 'p'.repeat(40);
    expect(instanceNameError(project, 'a'.repeat(12))).toBe('');
    expect(instanceNameError(project, 'a'.repeat(13))).toMatch(/53 characters.*at most 12/);
  });
});
