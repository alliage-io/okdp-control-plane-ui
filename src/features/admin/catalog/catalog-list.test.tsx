import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import type { PlatformService } from '../../../core/models/service.model';
import { catalogApi } from '../../../core/api/catalog-api';

// Controllable hook + API stubs so the component renders without network.
const useCatalogMock = vi.fn();
vi.mock('./use-catalog', () => ({ useCatalog: () => useCatalogMock() }));
vi.mock('../../../core/api/catalog-api', () => ({
  catalogApi: {
    listServices: vi.fn(),
    createService: vi.fn(),
    updateService: vi.fn(),
    deleteService: vi.fn(),
  },
}));
// Decouples the delete dialog from the localStorage-backed preferences store.
vi.mock('../../../core/preferences/confirm-prefs-context', () => ({
  useConfirmPrefs: () => ({ typedDeleteEnabled: true, setTypedDeleteEnabled: vi.fn() }),
}));

import { CatalogList } from './catalog-list';

const SERVICES: PlatformService[] = [
  {
    name: 'jupyterhub',
    // As the server lists them: the catalog's, highest first.
    versions: ['1.1.0', '1.0.0'],
    defaultVersion: '1.0.0',
    description: 'Notebooks',
    category: 'Data Science',
    repository: 'platform-charts',
  },
];

function renderList() {
  return render(<CatalogList />);
}

describe('CatalogList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCatalogMock.mockReturnValue({
      services: SERVICES,
      loading: false,
      error: false,
      refresh: vi.fn(),
    });
  });

  it('renders the catalog rows with versions and the default marker', () => {
    renderList();
    expect(screen.getByText('jupyterhub')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('Data Science')).toBeInTheDocument();
    // The default version is flagged in its tag.
    expect(screen.getByText('(default)')).toBeInTheDocument();
  });

  it('shows the error empty-state with a retry when loading failed', () => {
    useCatalogMock.mockReturnValue({
      services: [],
      loading: false,
      error: true,
      refresh: vi.fn(),
    });
    renderList();
    expect(screen.getByText('Failed to load the catalog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('adds a service by its name alone: its versions are the catalogs', async () => {
    vi.mocked(catalogApi.createService).mockResolvedValue(SERVICES[0]);
    renderList();
    fireEvent.click(screen.getByRole('button', { name: /add service/i }));

    const dialog = await screen.findByRole('dialog');
    // Empty name → the confirm button is disabled.
    const confirm = within(dialog).getByRole('button', { name: /add service/i });
    expect(confirm).toBeDisabled();
    // No version to type, no registry to override, no catalog to choose.
    expect(within(dialog).queryByLabelText('Versions')).toBeNull();
    expect(within(dialog).getByText(/catalog repositories/)).toBeInTheDocument();
    expect(within(dialog).queryByText(/registry/i)).toBeNull();
    expect(within(dialog).queryByLabelText('Catalog')).toBeNull();

    fireEvent.change(within(dialog).getByLabelText('Service name'), {
      target: { value: 'superset' },
    });
    expect(confirm).toBeEnabled();
    fireEvent.click(confirm);
    await waitFor(() => expect(catalogApi.createService).toHaveBeenCalled());
    const [payload] = vi.mocked(catalogApi.createService).mock.calls[0];
    expect(payload.name).toBe('superset');
    expect(payload).not.toHaveProperty('versions');
    expect(payload.defaultVersion).toBeUndefined();
  });

  it('keeps the default of an edited service and sends neither its versions nor its catalog', async () => {
    vi.mocked(catalogApi.updateService).mockResolvedValue(SERVICES[0]);
    const { container } = renderList();
    fireEvent.click(container.querySelector('.actions button') as HTMLElement);
    fireEvent.click(await screen.findByText('Edit'));

    const dialog = await screen.findByRole('dialog');
    const catalog = within(dialog).getByLabelText('Catalog');
    expect(catalog).toHaveValue('platform-charts');
    expect(catalog).toBeDisabled();

    fireEvent.click(within(dialog).getByRole('button', { name: /^Save$/ }));
    await waitFor(() => expect(catalogApi.updateService).toHaveBeenCalled());
    const [name, payload] = vi.mocked(catalogApi.updateService).mock.calls[0];
    expect(name).toBe('jupyterhub');
    expect(payload).not.toHaveProperty('repository');
    expect(payload).not.toHaveProperty('versions');
    expect(payload.defaultVersion).toBe('1.0.0');
  });

  it('does not pin the highest version the server reports as the default', async () => {
    useCatalogMock.mockReturnValue({
      services: [{ ...SERVICES[0], defaultVersion: '1.1.0' }],
      loading: false,
      error: false,
      refresh: vi.fn(),
    });
    vi.mocked(catalogApi.updateService).mockResolvedValue(SERVICES[0]);
    const { container } = renderList();
    fireEvent.click(container.querySelector('.actions button') as HTMLElement);
    fireEvent.click(await screen.findByText('Edit'));

    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /^Save$/ }));
    await waitFor(() => expect(catalogApi.updateService).toHaveBeenCalled());
    const [, payload] = vi.mocked(catalogApi.updateService).mock.calls[0];
    expect(payload.defaultVersion).toBeUndefined();
  });
});
