/* Class lists for sidebar navigation entries, shared by the console shell
   and the project console's hand-rolled nav placeholders.

   The `nav-link`, `sub-link`, `active` and `disabled` marker classes are kept
   on the markup: feature stylesheets that have not been migrated to Tailwind
   yet (project-page.css nav sections) still target them with compound
   selectors. */

interface NavLinkClassOptions {
  active?: boolean;
  collapsed: boolean;
  sub?: boolean;
  disabled?: boolean;
}

/** Class list for a sidebar navigation entry (link or inert placeholder). */
export function sideNavLinkClass({ active, collapsed, sub, disabled }: NavLinkClassOptions) {
  return [
    'nav-link',
    sub && 'sub-link',
    active && 'active',
    disabled && 'disabled',
    'group mb-px flex items-center text-base no-underline transition-[color,background-color] duration-150 ease-smooth',
    collapsed
      ? 'justify-center rounded-md p-2'
      : 'rounded-r-md border-l-2 px-2.5 py-1.5 max-lg:justify-center max-lg:rounded-md max-lg:border-l-0 max-lg:p-2',
    active
      ? 'bg-primary-50 font-semibold text-primary'
      : 'font-medium text-fg-secondary hover:bg-surface-secondary hover:text-fg',
    !collapsed && (active ? 'border-l-primary' : 'border-l-transparent'),
  ]
    .filter(Boolean)
    .join(' ');
}

/** Class list for the icon of a sidebar navigation entry. */
export function sideNavIconClass(active: boolean) {
  return `w-[18px] text-center text-[1rem] transition-colors duration-150 ease-smooth ${
    active ? 'text-primary' : 'text-fg-muted group-hover:text-fg-secondary'
  }`;
}

/** Class list for the label of a sidebar navigation entry. */
export function sideNavLabelClass(collapsed: boolean) {
  return `overflow-hidden whitespace-nowrap transition-[max-width,margin] duration-400 ease-smooth ${
    collapsed ? 'ml-0 max-w-0' : 'ml-2 max-w-[200px] max-lg:ml-0 max-lg:max-w-0'
  }`;
}
