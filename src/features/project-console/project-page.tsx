import { useRef, useState } from 'react';
import { Link, Outlet, useMatch } from 'react-router-dom';
import { Dropdown } from 'primereact/dropdown';
import {
  siApacheairflow,
  siApachekafka,
  siApachespark,
  siApachesuperset,
  siJupyter,
  siMlflow,
  siTrino,
} from 'simple-icons';
import { useProjectContext } from '../../core/context/project-context';
import { NAV_EXPANDED_KEY, SIDEBAR_COLLAPSED_KEY } from '../../core/storage-keys';
import type { Project } from '../../core/api/project-api';
import { getProjectColor } from '../../core/services/project-colors';
import { ConsoleShell, SideNavLink } from '../../shared/components/console-shell';
import { BrandIcon, type BrandGlyph } from '../../shared/components/brand-icon';
import {
  sideNavIconClass,
  sideNavLabelClass,
  sideNavLinkClass,
} from '../../shared/components/console-nav-classes';

/** Apache Polaris brandmark, vendored from the project site's favicon
 *  (site/static/favicons/favicon.svg, Apache-2.0) — not in simple-icons. */
const siteApachepolaris: BrandGlyph = {
  hex: '007880',
  viewBox: '0 0 100 100',
  path: 'M1.77396 5.30235C1.17886 4.57499 0 4.9958 0 5.93559V97.8878C0 99.0543 0.945669 100 2.11221 100H94.0452C94.9854 100 95.4059 98.8203 94.6778 98.2255L51.5956 63.0332C50.769 62.3579 49.5973 62.3044 48.7124 62.9013L23.4326 79.9586C21.4731 81.2806 19.1256 78.933 20.4475 76.9737L37.5039 51.6949C38.1012 50.8094 38.0472 49.6369 37.3709 48.8102L1.77396 5.30235ZM98.2255 94.6778C98.8203 95.4059 100 94.9854 100 94.0452V2.11221C100 0.945669 99.0543 0 97.8878 0H5.93558C4.99579 0 4.57499 1.17886 5.30235 1.77396L48.8102 37.3709C49.6369 38.0472 50.8094 38.1014 51.6949 37.5039L76.9735 20.4475C78.9328 19.1256 81.2805 21.4732 79.9586 23.4325L62.9013 48.7125C62.3043 49.5973 62.3579 50.769 63.0332 51.5957L98.2255 94.6778Z',
};

/** Spark mark with a clock badge: tells the History Server apart from plain
 *  Spark applications by shape, not only by color. */
function SparkHistoryIcon() {
  return (
    <span
      className="relative inline-flex shrink-0"
      role="img"
      aria-label="Spark History Server"
      title="Spark History Server"
    >
      <BrandIcon icon={siApachespark} />
      <span className="absolute -right-[5px] -bottom-[4px] flex h-[11px] w-[11px] items-center justify-center rounded-full bg-surface">
        <i
          className="pi pi-history text-[9px] leading-none text-fg-secondary"
          aria-hidden="true"
        ></i>
      </span>
    </span>
  );
}

interface NavItem {
  /** Path under /projects/:projectId — absent for inert placeholders. */
  segment?: string;
  /** primeicons fallback for services without a packaged brand logo. */
  icon: string;
  /** Brand logo (favicon equivalent) rendered instead of `icon`. */
  brand?: BrandGlyph;
  /** Fully custom icon node, wins over `brand` (badged variants). */
  iconNode?: React.ReactNode;
  /** Follow text color instead of brand hex (near-black brands). */
  brandMono?: boolean;
  label: string;
  disabled?: boolean;
  collapsedTitle?: string;
}

interface NavCategory {
  key: string;
  label: string;
  icon: string;
  defaultExpanded: boolean;
  items: NavItem[];
}

/** Sidebar categories and their service entries, in display order. */
const NAV_CATEGORIES: NavCategory[] = [
  {
    key: 'lakehouse',
    label: 'Lakehouse',
    icon: 'pi-database',
    defaultExpanded: true,
    items: [
      { segment: 'polaris', icon: 'pi pi-table', brand: siteApachepolaris, label: 'Polaris' },
      { segment: 'trino', icon: 'pi pi-bolt', brand: siTrino, label: 'Trino' },
    ],
  },
  {
    key: 'data-engineering',
    label: 'Data Engineering',
    icon: 'pi-cog',
    defaultExpanded: true,
    items: [
      {
        segment: 'airflow',
        icon: 'pi pi-sitemap',
        brand: siApacheairflow,
        label: 'Airflow',
      },
      {
        segment: 'spark/applications',
        icon: 'pi pi-play',
        brand: siApachespark,
        label: 'Spark Applications',
      },
      {
        segment: 'spark/history-server',
        icon: 'pi pi-history',
        iconNode: <SparkHistoryIcon />,
        label: 'Spark History',
      },
      {
        icon: 'pi pi-share-alt',
        brand: siApachekafka,
        // The Kafka mark is near-black — keep it on the text color so it
        // stays visible in dark mode.
        brandMono: true,
        label: 'Kafka',
        disabled: true,
        collapsedTitle: 'Kafka — exploration',
      },
    ],
  },
  {
    key: 'notebooks',
    label: 'Notebooks',
    icon: 'pi-book',
    defaultExpanded: true,
    items: [{ segment: 'services', icon: 'pi pi-desktop', brand: siJupyter, label: 'JupyterHub' }],
  },
  {
    key: 'sql-bi',
    label: 'SQL & BI',
    icon: 'pi-chart-bar',
    defaultExpanded: true,
    items: [
      {
        segment: 'superset',
        icon: 'pi pi-chart-line',
        brand: siApachesuperset,
        label: 'Superset',
      },
      {
        icon: 'pi pi-pencil',
        label: 'SQL Editor',
        disabled: true,
        collapsedTitle: 'SQL Editor — exploration',
      },
    ],
  },
  {
    key: 'machine-learning',
    label: 'Machine Learning',
    icon: 'pi-microchip',
    defaultExpanded: false,
    items: [
      {
        icon: 'pi pi-sitemap',
        label: 'Kubeflow',
        disabled: true,
        collapsedTitle: 'Kubeflow — exploration',
      },
      {
        icon: 'pi pi-flag',
        brand: siMlflow,
        label: 'MLflow',
        disabled: true,
        collapsedTitle: 'MLflow — exploration',
      },
      {
        icon: 'pi pi-send',
        label: 'KServe',
        disabled: true,
        collapsedTitle: 'KServe — exploration',
      },
    ],
  },
  {
    key: 'project-configuration',
    label: 'Project configuration',
    icon: 'pi-sliders-h',
    defaultExpanded: true,
    items: [
      { segment: 'secret-stores', icon: 'pi pi-lock', label: 'Secrets' },
      { segment: 'parameters', icon: 'pi pi-cog', label: 'Parameters' },
    ],
  },
];

/** Per-category unfold overrides persisted across reloads; categories absent
 *  from the record keep their default. */
function storedExpanded(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(NAV_EXPANDED_KEY);
    if (raw) return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    // corrupt value — fall back to defaults
  }
  return {};
}

interface NavSectionProps {
  icon: string;
  label: string;
  expanded: boolean;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function NavSection({ icon, label, expanded, collapsed, onToggle, children }: NavSectionProps) {
  // Collapsed rail: no room for an unfoldable tree — the category reduces
  // to a separator and its services stay visible as icons.
  if (collapsed) {
    return (
      <div className="mt-1">
        <div
          className="mx-1 my-2 border-t border-border-light"
          title={label}
          aria-hidden="true"
        ></div>
        {children}
      </div>
    );
  }

  return (
    <div className="mt-1">
      <button
        className="group flex w-full cursor-pointer items-center rounded-r-md border-0 border-l-2 border-l-transparent bg-transparent px-2.5 py-1.5 text-base font-medium text-fg-secondary transition-[color,background-color] duration-150 ease-smooth hover:bg-surface-secondary hover:text-fg"
        onClick={onToggle}
        type="button"
      >
        <i
          className={`pi ${icon} w-[18px] text-center text-[1rem] text-fg-muted transition-colors duration-150 ease-smooth group-hover:text-fg-secondary`}
        ></i>
        <span className={sideNavLabelClass(false)}>{label}</span>
        <i
          className={`pi ${expanded ? 'pi-chevron-down' : 'pi-chevron-right'} ml-auto text-[0.6rem] text-fg-muted transition-transform duration-250 ease-smooth`}
        ></i>
      </button>
      {/* Bumped from 200px — Data Engineering holds 4 sub-items and Machine
          Learning 3, all of which need to fit when expanded. */}
      <div
        className={`overflow-hidden [transition:max-height_0.25s_ease] ${
          expanded ? 'max-h-[320px]' : 'max-h-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

interface DisabledNavLinkProps {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  title: string;
  collapsedTitle: string;
}

/** "Exploration" placeholder rendered as <span> instead of <a>: visible in
 *  the menu but inert. Tooltip carries the rationale. */
function DisabledNavLink({ icon, label, collapsed, title, collapsedTitle }: DisabledNavLinkProps) {
  return (
    <span
      className={sideNavLinkClass({ collapsed, sub: true, disabled: true })}
      title={collapsed ? collapsedTitle : title}
    >
      {typeof icon === 'string' ? <i className={`${icon} ${sideNavIconClass(false)}`}></i> : icon}
      <span className={sideNavLabelClass(collapsed)}>{label}</span>
    </span>
  );
}

/** Custom node first, then brand logo, then the primeicons fallback. */
function navItemIcon(item: NavItem): React.ReactNode {
  if (item.iconNode) return item.iconNode;
  return item.brand ? <BrandIcon icon={item.brand} mono={item.brandMono} /> : item.icon;
}

export default function ProjectPage() {
  const context = useProjectContext();
  const switcherRef = useRef<Dropdown>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true',
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>(storedExpanded);

  const isExpanded = (category: NavCategory) => expanded[category.key] ?? category.defaultExpanded;

  const toggleCategory = (category: NavCategory) => {
    setExpanded((prev) => {
      const next = { ...prev, [category.key]: !(prev[category.key] ?? category.defaultExpanded) };
      localStorage.setItem(NAV_EXPANDED_KEY, JSON.stringify(next));
      return next;
    });
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((collapsed) => {
      const newState = !collapsed;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newState));
      return newState;
    });
  };

  // The project tree only belongs to project pages (/projects/:projectId/…);
  // every other page under the shell (/projects, /identity, …) gets an empty
  // sidebar even while a project is still selected in the context.
  const onProjectPage = useMatch('/projects/:projectId/*') !== null;

  const projectName = context.currentProject?.name;
  const envColor = projectName ? getProjectColor(projectName) : undefined;
  const futureTitle = 'Direction future, non engagé';

  const headerLeft = context.availableProjects.length > 0 && (
    /* project-switcher scopes the Dropdown overrides in the PrimeReact overrides section of styles.css */
    <div className="project-switcher flex items-center">
      <Dropdown
        ref={switcherRef}
        value={context.currentProject}
        options={context.availableProjects}
        optionLabel="name"
        dataKey="name"
        placeholder="Select Project"
        className="project-dropdown"
        panelClassName="project-dropdown-panel"
        appendTo={document.body}
        style={
          envColor
            ? {
                background: `color-mix(in srgb, ${envColor} 14%, transparent)`,
                border: `1px solid color-mix(in srgb, ${envColor} 50%, transparent)`,
              }
            : undefined
        }
        onChange={(e) => context.selectProject((e.value as Project).name)}
        valueTemplate={(project: Project | null) => (
          <span className="flex items-center gap-2 font-semibold">
            {project && (
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: getProjectColor(project.name) }}
              ></span>
            )}
            {project ? project.name : 'Select Project'}
          </span>
        )}
        itemTemplate={(project: Project) => (
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: getProjectColor(project.name) }}
            ></span>
            <div className="flex flex-col gap-px">
              <span className="font-medium">{project.name}</span>
              {project.description && (
                <small className="text-xs text-fg-muted">{project.description}</small>
              )}
            </div>
          </div>
        )}
        panelFooterTemplate={() => (
          <Link
            to="/projects"
            className="flex items-center gap-2 border-t border-border-light px-4 py-2.5 text-sm font-medium text-fg-secondary no-underline transition-colors duration-150 ease-smooth hover:bg-surface-secondary hover:text-fg"
            onClick={() => switcherRef.current?.hide()}
          >
            <i className="pi pi-th-large text-[0.85rem]"></i>
            All projects
          </Link>
        )}
      />
    </div>
  );

  return (
    <ConsoleShell
      collapsed={sidebarCollapsed}
      onToggleCollapsed={toggleSidebar}
      headerLeft={headerLeft}
      accentColor={envColor}
      nav={
        projectName && onProjectPage ? (
          <>
            <SideNavLink
              to={`/projects/${projectName}`}
              end
              icon="pi pi-objects-column"
              label="Overview"
              collapsed={sidebarCollapsed}
            />

            {NAV_CATEGORIES.map((category) => (
              <NavSection
                key={category.key}
                icon={category.icon}
                label={category.label}
                expanded={isExpanded(category)}
                collapsed={sidebarCollapsed}
                onToggle={() => toggleCategory(category)}
              >
                {category.items.map((item) =>
                  item.disabled ? (
                    <DisabledNavLink
                      key={item.label}
                      icon={navItemIcon(item)}
                      label={item.label}
                      collapsed={sidebarCollapsed}
                      title={futureTitle}
                      collapsedTitle={item.collapsedTitle ?? item.label}
                    />
                  ) : (
                    <SideNavLink
                      key={item.label}
                      to={`/projects/${projectName}/${item.segment}`}
                      icon={navItemIcon(item)}
                      label={item.label}
                      collapsed={sidebarCollapsed}
                      sub
                    />
                  ),
                )}
              </NavSection>
            ))}
          </>
        ) : null
      }
    >
      <Outlet />
    </ConsoleShell>
  );
}
