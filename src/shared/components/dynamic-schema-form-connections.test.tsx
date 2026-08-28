import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const selectable = vi.fn();

vi.mock('../../core/api/connection-api', () => ({
  connectionApi: {
    selectable: (...args: unknown[]) => selectable(...args),
  },
}));

import { DynamicSchemaForm } from './dynamic-schema-form';

const conn = (name: string, type: string) => ({
  name,
  scope: 'project',
  type,
  status: 'Ready',
  managed: false,
});

// The trino chart's shape: connection refs inside list items.
const TRINO_SCHEMA = {
  properties: {
    hiveCatalogs: {
      type: 'array',
      title: 'Hive catalogs',
      default: [],
      items: {
        type: 'object',
        required: ['name', 'metastore'],
        properties: {
          name: { type: 'string', title: 'Name' },
          metastore: {
            type: 'string',
            title: 'Metastore',
            'x-okdp-connection-ref': { contract: 'hive' },
          },
          storage: {
            type: 'string',
            title: 'Object store',
            'x-okdp-connection-ref': { contract: 's3' },
          },
        },
      },
    },
  },
};

describe('DynamicSchemaForm connection references', () => {
  beforeEach(() => {
    selectable.mockReset();
    selectable.mockImplementation((_project: string, contract: string) =>
      Promise.resolve(
        contract === 'hive'
          ? [conn('demo-hive', 'hive'), conn('other-hive', 'hive')]
          : [conn('minio', 's3')],
      ),
    );
  });

  it('never renders the platform, connections or dependency keys', () => {
    render(
      <DynamicSchemaForm
        schema={{
          properties: {
            global: { type: 'object' },
            connections: { type: 'object' },
            'okdp-lib': { type: 'object' },
            numWorkers: { type: 'integer', title: 'Workers', default: 1 },
          },
        }}
        onParametersChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Workers')).toBeInTheDocument();
    expect(screen.queryByText(/global/i)).toBeNull();
    expect(screen.queryByText(/connections/i)).toBeNull();
    expect(screen.queryByText(/okdp/i)).toBeNull();
  });

  it('offers connections of the right contract inside list items', async () => {
    const onParametersChange = vi.fn();
    render(
      <DynamicSchemaForm
        schema={TRINO_SCHEMA}
        projectId="demo"
        initialValues={{ hiveCatalogs: [{ name: 'lake' }] }}
        onParametersChange={onParametersChange}
      />,
    );

    // One lookup per contract, not per row or per column.
    await waitFor(() => expect(selectable).toHaveBeenCalledTimes(2));
    expect(selectable).toHaveBeenCalledWith('demo', 'hive');
    expect(selectable).toHaveBeenCalledWith('demo', 's3');

    // Column labels come from the item schema titles.
    expect(screen.getByText('Metastore')).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: /Select a hive connection/ }));
    fireEvent.click(await screen.findByText('demo-hive'));

    await waitFor(() =>
      expect(onParametersChange).toHaveBeenLastCalledWith({
        hiveCatalogs: [{ name: 'lake', metastore: 'demo-hive' }],
      }),
    );
  });

  it('keeps a referenced connection that is no longer offered', async () => {
    render(
      <DynamicSchemaForm
        schema={TRINO_SCHEMA}
        projectId="demo"
        initialValues={{ hiveCatalogs: [{ name: 'lake', metastore: 'gone-hive' }] }}
        onParametersChange={vi.fn()}
      />,
    );
    await waitFor(() => expect(selectable).toHaveBeenCalled());
    expect((await screen.findAllByText('gone-hive')).length).toBeGreaterThan(0);
  });

  it('renders a picker for a root reference nobody claimed', async () => {
    render(
      <DynamicSchemaForm
        schema={{
          properties: {
            metastore: {
              type: 'string',
              title: 'Metastore',
              'x-okdp-connection-ref': { contract: 'hive' },
            },
          },
        }}
        projectId="demo"
        onParametersChange={vi.fn()}
      />,
    );
    await waitFor(() => expect(selectable).toHaveBeenCalledWith('demo', 'hive'));
    expect(screen.getByRole('button', { name: /Select a hive connection/ })).toBeInTheDocument();
  });

  it('ignores the former KuboCD marker', () => {
    render(
      <DynamicSchemaForm
        schema={{
          properties: {
            metastore: { type: 'string', 'x-kubocd-connection-ref': { contract: 'hive' } },
          },
        }}
        projectId="demo"
        onParametersChange={vi.fn()}
      />,
    );
    expect(selectable).not.toHaveBeenCalled();
  });
});

describe('DynamicSchemaForm list items', () => {
  it('reports a list item missing a required column', async () => {
    selectable.mockResolvedValue([]);
    const onValidityChange = vi.fn();
    render(
      <DynamicSchemaForm
        schema={TRINO_SCHEMA}
        projectId="demo"
        initialValues={{ hiveCatalogs: [{ name: 'lake' }] }}
        onParametersChange={vi.fn()}
        onValidityChange={onValidityChange}
      />,
    );
    expect(await screen.findByText('Entry 1: Metastore is required.')).toBeInTheDocument();
    expect(onValidityChange).toHaveBeenLastCalledWith(false);
  });
});
