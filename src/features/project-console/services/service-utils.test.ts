import { describe, it, expect } from 'vitest';
import { HttpError } from '../../../core/api/http';
import {
  areaBasePath,
  deployError,
  isTransitioning,
  parentLabel,
  SERVICE_AREAS,
  shortRevision,
  statusHint,
  statusTone,
} from './service-utils';

describe('areaBasePath', () => {
  it('returns the bespoke area for a known service', () => {
    expect(areaBasePath('trino')).toEqual(['trino']);
    expect(areaBasePath('spark-history-server')).toEqual(['spark', 'history-server']);
  });

  it('routes an unknown catalog service to the generic /services/<name> area (not jupyterhub)', () => {
    expect(areaBasePath('seaweedfs')).toEqual(['services', 'seaweedfs']);
    expect(areaBasePath('spark-operator')).toEqual(['services', 'spark-operator']);
  });

  it('falls back to the generic services list when no service is given', () => {
    expect(areaBasePath('')).toEqual(['services']);
    expect(areaBasePath(undefined)).toEqual(['services']);
    expect(areaBasePath(null)).toEqual(['services']);
  });

  it('never nests an unknown service under a bespoke area', () => {
    // Regression guard for the old `?? ['jupyterhub']` fallback.
    expect(areaBasePath('whatever-new')[0]).toBe('services');
  });
});

describe('parentLabel', () => {
  it('uses the bespoke label, else the service name, else Services', () => {
    expect(parentLabel('trino')).toBe(SERVICE_AREAS['trino'].label);
    expect(parentLabel('seaweedfs')).toBe('seaweedfs');
    expect(parentLabel(undefined)).toBe('Services');
  });
});

describe('instance statuses', () => {
  it('shows Pending apart from the engine rolling out', () => {
    expect(statusTone('Pending')).toBe('info');
    expect(statusTone('Installing')).toBe('warning');
    expect(statusTone('Updating')).toBe('warning');
    expect(statusTone('Ready')).toBe('success');
    expect(statusTone('Error')).toBe('danger');
  });

  it('animates every in-flight state', () => {
    expect(isTransitioning('Pending')).toBe(true);
    expect(isTransitioning('Installing')).toBe(true);
    expect(isTransitioning('Ready')).toBe(false);
  });

  it('explains Pending without KuboCD wording', () => {
    expect(statusHint('Pending')).toMatch(/Git/);
    expect(statusHint('Updating')).not.toMatch(/kubocd/i);
  });

  it('shortens a commit SHA', () => {
    expect(shortRevision('0123456789abcdef')).toBe('0123456');
    expect(shortRevision(undefined)).toBe('');
  });
});

describe('deployError', () => {
  const error = (status: number, body: object) =>
    new HttpError(status, 'x', JSON.stringify(body), '/api/projects/a/services');

  it('surfaces a 400 as the server wrote it', () => {
    expect(
      deployError(error(400, { error: 'version "1.0" is not an exact semver' }), 'a', 'b'),
    ).toEqual({ summary: 'Deployment failed', detail: 'version "1.0" is not an exact semver' });
  });

  it('titles a 409 from its code and keeps the server message as is', () => {
    const text = "release name 'a-b-c' is already used by instance 'c' of project 'a-b'";
    expect(
      deployError(error(409, { error: text, code: 'release-name-taken' }), 'a', 'b-c'),
    ).toEqual({ summary: 'Release name taken', detail: text });
    expect(
      deployError(
        error(409, {
          error: "Instance 'c' already exists in project 'a'",
          code: 'instance-exists',
        }),
        'a',
        'c',
      ).summary,
    ).toBe('Instance already exists');
  });

  it('falls back on the code when the server gave no message', () => {
    expect(deployError(error(409, { code: 'release-name-taken' }), 'a', 'b-c').detail).toMatch(
      /"a-b-c" is already used/,
    );
  });

  it('falls back when the body is not JSON', () => {
    expect(deployError(new Error('boom'), 'a', 'b').detail).toBe('Deployment failed');
  });
});
