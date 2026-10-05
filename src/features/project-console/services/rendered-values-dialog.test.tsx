import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { RenderedValues } from '../../../core/models/service.model';

const getRenderedValues = vi.fn();
vi.mock('../../../core/api/service-api', () => ({
  serviceApi: {
    getRenderedValues: (projectId: string, name: string) => getRenderedValues(projectId, name),
  },
}));

import { RenderedValuesDialog } from './rendered-values-dialog';

const TRINO_VALUES =
  Array.from({ length: 12 }, (_, i) => `key${i + 1}: v${i + 1}`).join('\n') + '\n';

const TRINO: RenderedValues = {
  name: 'trino',
  chart: 'trino',
  chartVersion: 'trino-1.42.1',
  serviceVersion: '480.0.0-1.0.2',
  values: TRINO_VALUES,
  defaults: '# upstream defaults\nkey1: v1\n',
  changedLines: [2, 3],
};

const OPA: RenderedValues = {
  name: 'opa-kube-mgmt',
  chart: 'opa-kube-mgmt',
  chartVersion: 'opa-kube-mgmt-9.2.0',
  serviceVersion: '480.0.0-1.0.2',
  values: 'replicas: 1\n',
  changedLines: [],
  defaultsError: 'could not read the defaults: registry down',
};

function line(no: number) {
  return document.querySelector(`[data-line="${no}"]`);
}

describe('RenderedValuesDialog', () => {
  beforeEach(() => getRenderedValues.mockReset());

  it('shows the instance chart values with the changed lines in green', async () => {
    getRenderedValues.mockResolvedValue([TRINO, OPA]);
    render(<RenderedValuesDialog projectId="demo" serviceName="sql" onHide={vi.fn()} />);

    await waitFor(() => expect(line(1)).not.toBeNull());
    expect(getRenderedValues).toHaveBeenCalledWith('demo', 'sql');
    expect(line(2)).toHaveClass('rv-changed');
    expect(line(3)).toHaveClass('rv-changed');
    expect(line(1)).not.toHaveClass('rv-changed');
    expect(screen.getByText('2 differ from the defaults', { exact: false })).toBeInTheDocument();
    // One tab per render, with the number of changed lines.
    expect(screen.getByRole('tab', { name: /trino/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('folds the unchanged lines and unfolds a gap on demand', async () => {
    getRenderedValues.mockResolvedValue([TRINO]);
    render(<RenderedValuesDialog projectId="demo" serviceName="sql" onHide={vi.fn()} />);
    await waitFor(() => expect(line(1)).not.toBeNull());

    fireEvent.click(screen.getByRole('button', { name: /Changes only/ }));
    // Lines 1..6 kept (2 and 3, ±3), 7..12 folded.
    expect(line(6)).not.toBeNull();
    expect(line(7)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /6 unchanged lines/ }));
    expect(line(12)).not.toBeNull();
  });

  it('shows the chart defaults as published', async () => {
    getRenderedValues.mockResolvedValue([TRINO]);
    render(<RenderedValuesDialog projectId="demo" serviceName="sql" onHide={vi.fn()} />);
    await waitFor(() => expect(line(1)).not.toBeNull());

    fireEvent.click(screen.getByRole('button', { name: 'Chart defaults' }));
    expect(screen.getByText('# upstream defaults')).toBeInTheDocument();
    expect(screen.getByText('trino-1.42.1 · values.yaml')).toBeInTheDocument();
    expect(document.querySelectorAll('.rv-changed')).toHaveLength(0);
  });

  it('says why changes are not highlighted when the defaults are missing', async () => {
    getRenderedValues.mockResolvedValue([TRINO, OPA]);
    render(<RenderedValuesDialog projectId="demo" serviceName="sql" onHide={vi.fn()} />);
    await waitFor(() => expect(line(1)).not.toBeNull());

    fireEvent.click(screen.getByRole('tab', { name: /opa-kube-mgmt/ }));
    expect(screen.getByText(/registry down/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Chart defaults' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Changes only/ })).toBeDisabled();
  });

  it('names the tabs by chart key when one chart renders several keys', async () => {
    const admin: RenderedValues = {
      name: 'polaris-admin',
      chart: 'polaris-admin',
      chartVersion: 'polaris-admin-0.3.0',
      serviceVersion: '1.2.0-1.0.0',
      values: 'job: bootstrap\n',
      defaults: 'job: none\n',
      changedLines: [1],
    };
    const principals: RenderedValues = {
      ...admin,
      name: 'polaris-admin-principals',
      values: 'job: principals\n',
    };
    getRenderedValues.mockResolvedValue([admin, principals]);
    render(<RenderedValuesDialog projectId="demo" serviceName="catalog" onHide={vi.fn()} />);
    await waitFor(() => expect(line(1)).not.toBeNull());

    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.firstChild?.textContent)).toEqual([
      'polaris-admin',
      'polaris-admin-principals',
    ]);
    // The chart is named next to a key that differs from it.
    expect(tabs[0].querySelector('.muted-text')).toBeNull();
    expect(tabs[1].querySelector('.muted-text')).toHaveTextContent('polaris-admin');

    fireEvent.click(tabs[1]);
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(line(1)).toHaveTextContent('job: principals');
  });

  it('explains an instance without compiled values', async () => {
    getRenderedValues.mockResolvedValue([]);
    render(<RenderedValuesDialog projectId="demo" serviceName="sql" onHide={vi.fn()} />);
    expect(await screen.findByText('No compiled values')).toBeInTheDocument();
    expect(screen.getByText(/okdp-gitops compile/)).toBeInTheDocument();
  });

  it('loads nothing while hidden', () => {
    render(<RenderedValuesDialog projectId="demo" serviceName={null} onHide={vi.fn()} />);
    expect(getRenderedValues).not.toHaveBeenCalled();
  });
});
