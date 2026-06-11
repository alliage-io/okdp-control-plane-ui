import { useRef, useState } from 'react';
import { Link, Outlet, useMatch } from 'react-router-dom';
import { Dropdown } from 'primereact/dropdown';
import { useProjectContext } from '../../core/context/project-context';
import { useNavPrefs } from '../../core/preferences/nav-prefs-context';
import { NAV_EXPANDED_KEY, SIDEBAR_COLLAPSED_KEY } from '../../core/storage-keys';
import type { Project } from '../../core/api/project-api';
import { getProjectColor } from '../../core/services/project-colors';
import { ConsoleShell, SideNavLink } from '../../shared/components/console-shell';
import {
  sideNavIconClass,
  sideNavLabelClass,
  sideNavLinkClass,
} from '../../shared/components/console-nav-classes';
import { NAV_CATEGORIES, navItemIcon, type NavCategory, type NavItem } from './nav-config';
import { CUSTOM_VIEWS, uiServiceLaunchers } from '../custom-views/views-config';
import { useViewServices } from '../custom-views/use-view-services';

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

interface ExternalNavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  title: string;
}

/** Views-sidebar launcher: opens a deployed service UI in a new tab — the
 *  sidebar twin of the page's "Open" tiles. */
function ExternalNavLink({ href, icon, label, collapsed, title }: ExternalNavLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={sideNavLinkClass({ collapsed, sub: true })}
      title={collapsed ? label : title}
    >
      {typeof icon === 'string' ? <i className={`${icon} ${sideNavIconClass(false)}`}></i> : icon}
      <span className={sideNavLabelClass(collapsed)}>{label}</span>
      {!collapsed && (
        <i className="pi pi-external-link ml-auto text-[0.6rem] text-fg-muted max-lg:hidden"></i>
      )}
    </a>
  );
}

/** Lateral-menu item for a console segment — the views sidebar borrows its
 *  brand logo so both menus show a service the same way. */
function navItemBySegment(segment: string): NavItem | undefined {
  for (const category of NAV_CATEGORIES) {
    const item = category.items.find((i) => i.segment === segment);
    if (item) return item;
  }
  return undefined;
}

export default function ProjectPage() {
  const context = useProjectContext();
  const { isNavItemHidden } = useNavPrefs();
  const switcherRef = useRef<Dropdown>(null);

  // Entries hidden by default or from the user's settings drop out of the
  // menu (fixed categories are exempt); a category left empty disappears
  // entirely — no header, no collapsed-rail separator.
  const visibleCategories = NAV_CATEGORIES.map((category) =>
    category.fixed
      ? category
      : {
          ...category,
          items: category.items.filter((i) => !isNavItemHidden(i.label, i.defaultHidden)),
        },
  ).filter((category) => category.items.length > 0);

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
  // /views gets its own tree of view launchers; every other page under the
  // shell (/projects, /identity, …) gets an empty sidebar even while a
  // project is still selected in the context.
  const onProjectPage = useMatch('/projects/:projectId/*') !== null;
  const onViewsPage = useMatch('/views') !== null;

  const projectName = context.currentProject?.name;

  // Deployed instances backing the views sidebar and, via outlet context,
  // the /views page itself — one fetch + SSE stream for both.
  const viewServices = useViewServices(onViewsPage ? projectName : undefined);
  const envColor = projectName ? getProjectColor(projectName) : undefined;
  const futureTitle = 'Direction future, non engagé';

  // Views sidebar content: the lateral menu's categories, but holding the
  // /views tiles — external launchers for deployed UI services plus the
  // custom views. Categories with nothing to show disappear.
  const allLaunchers = uiServiceLaunchers(viewServices.instances);
  // With several instances of one service, the instance name disambiguates.
  const launcherCounts = new Map<string, number>();
  for (const { view } of allLaunchers) {
    launcherCounts.set(view.service, (launcherCounts.get(view.service) ?? 0) + 1);
  }
  const viewCategories = NAV_CATEGORIES.map((category) => ({
    category,
    launchers: allLaunchers.filter(({ view }) => view.categoryKey === category.key),
    customViews: CUSTOM_VIEWS.filter((view) => view.categoryKey === category.key),
  })).filter((entry) => entry.launchers.length + entry.customViews.length > 0);

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

            {visibleCategories.map((category) => (
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
        ) : projectName && onViewsPage ? (
          <>
            <SideNavLink
              to="/views"
              end
              icon="pi pi-th-large"
              label="All views"
              collapsed={sidebarCollapsed}
            />

            {viewCategories.map(({ category, launchers, customViews }) => (
              <NavSection
                key={category.key}
                icon={category.icon}
                label={category.label}
                expanded={isExpanded(category)}
                collapsed={sidebarCollapsed}
                onToggle={() => toggleCategory(category)}
              >
                {launchers.map(({ svc, view }) => {
                  const navItem = navItemBySegment(view.navSegment);
                  const icon = navItem ? navItemIcon(navItem) : view.icon;
                  const label = (launcherCounts.get(view.service) ?? 0) > 1 ? svc.name : view.label;
                  return svc.status === 'Ready' ? (
                    <ExternalNavLink
                      key={svc.name}
                      href={svc.url!}
                      icon={icon}
                      label={label}
                      collapsed={sidebarCollapsed}
                      title={`Open ${svc.name} in a new tab`}
                    />
                  ) : (
                    <DisabledNavLink
                      key={svc.name}
                      icon={icon}
                      label={label}
                      collapsed={sidebarCollapsed}
                      title={`${svc.name} — ${svc.status}`}
                      collapsedTitle={`${label} — ${svc.status}`}
                    />
                  );
                })}
                {customViews.map((view) => (
                  <SideNavLink
                    key={view.label}
                    to={view.path(projectName)}
                    icon={view.icon}
                    label={view.label}
                    collapsed={sidebarCollapsed}
                    sub
                  />
                ))}
              </NavSection>
            ))}
          </>
        ) : null
      }
    >
      <Outlet context={viewServices} />
    </ConsoleShell>
  );
}
