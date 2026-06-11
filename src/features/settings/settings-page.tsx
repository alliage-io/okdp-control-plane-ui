import { InputSwitch } from 'primereact/inputswitch';
import { useTheme, type ThemeMode } from '../../core/theme/theme-context';
import { useEnvBar } from '../../core/preferences/env-bar-context';
import SectionHeading from '../../shared/components/section-heading';

interface PreviewPalette {
  bg: string;
  chrome: string;
  border: string;
  line: string;
  accent: string;
}

const LIGHT_PALETTE: PreviewPalette = {
  bg: '#ffffff',
  chrome: '#f6f8fa',
  border: '#d0d7de',
  line: '#d8dee4',
  accent: '#3b82f6',
};

const DARK_PALETTE: PreviewPalette = {
  bg: '#0d1117',
  chrome: '#161b22',
  border: '#30363d',
  line: '#30363d',
  accent: '#4493f8',
};

/** Skeleton console mock (header, sidebar, content lines) painted with one
 *  theme's palette — the GitHub-appearance-settings preview equivalent. */
function MiniPreview({ dark }: { dark: boolean }) {
  const c = dark ? DARK_PALETTE : LIGHT_PALETTE;
  return (
    <div className="h-full w-full" style={{ background: c.bg }}>
      <div
        className="flex h-5 items-center gap-1.5 px-2"
        style={{ background: c.chrome, borderBottom: `1px solid ${c.border}` }}
      >
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.accent }}></span>
        <span className="h-1.5 w-10 rounded-sm" style={{ background: c.line }}></span>
      </div>
      <div className="flex h-[calc(100%-1.25rem)]">
        <div
          className="flex w-11 shrink-0 flex-col gap-1.5 p-2"
          style={{ background: c.chrome, borderRight: `1px solid ${c.border}` }}
        >
          <span className="h-1.5 w-full rounded-sm" style={{ background: c.accent }}></span>
          <span className="h-1.5 w-full rounded-sm" style={{ background: c.line }}></span>
          <span className="h-1.5 w-3/4 rounded-sm" style={{ background: c.line }}></span>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-2">
          <span className="h-2 w-1/2 rounded-sm" style={{ background: c.line }}></span>
          <span className="h-1.5 w-full rounded-sm" style={{ background: c.line }}></span>
          <span className="h-1.5 w-full rounded-sm" style={{ background: c.line }}></span>
          <span className="h-1.5 w-2/3 rounded-sm" style={{ background: c.line }}></span>
        </div>
      </div>
    </div>
  );
}

/** System mode preview: light on the left half, dark on the right. */
function SplitPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0">
        <MiniPreview dark={false} />
      </div>
      <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-[200%]">
          <MiniPreview dark />
        </div>
      </div>
    </div>
  );
}

interface ThemeCardProps {
  mode: ThemeMode;
  label: string;
  description: string;
  icon: string;
}

function ThemeCard({ mode, label, description, icon }: ThemeCardProps) {
  const { theme, setTheme } = useTheme();
  const selected = theme === mode;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => setTheme(mode)}
      className={`flex w-[230px] cursor-pointer flex-col overflow-hidden rounded-lg border-2 bg-surface p-0 text-left transition-[border-color,box-shadow] duration-150 ease-smooth ${
        selected
          ? 'border-primary ring-2 ring-(--db-primary-200)'
          : 'border-border-light hover:border-fg-muted'
      }`}
    >
      <div className="pointer-events-none h-[120px] w-full" aria-hidden="true">
        {mode === 'system' ? <SplitPreview /> : <MiniPreview dark={mode === 'dark'} />}
      </div>
      <div className="flex items-center gap-2 border-t border-border-light px-3 py-2.5">
        <i className={`${icon} text-[0.85rem] text-fg-muted`}></i>
        <div className="flex flex-col">
          <span className="text-sm leading-tight font-semibold text-fg">{label}</span>
          <span className="text-xs text-fg-muted">{description}</span>
        </div>
        {selected && <i className="pi pi-check-circle ml-auto text-[0.95rem] text-primary"></i>}
      </div>
    </button>
  );
}

/** /settings — personal preferences for the console. */
export default function SettingsPage() {
  const { envBarEnabled, setEnvBarEnabled } = useEnvBar();
  return (
    <section className="flex animate-[fadeInUp_0.4s_ease-out] flex-col gap-7">
      <div>
        <h1>User settings</h1>
        <p className="mt-1 text-base text-fg-secondary">
          Personal preferences for the OKDP console. They only apply to this browser.
        </p>
      </div>

      <SectionHeading>Theme</SectionHeading>
      <div role="radiogroup" aria-label="Theme" className="flex flex-wrap gap-4">
        <ThemeCard
          mode="system"
          label="Sync with system"
          description="Follows your OS appearance"
          icon="pi pi-desktop"
        />
        <ThemeCard mode="light" label="Light" description="Always light" icon="pi pi-sun" />
        <ThemeCard mode="dark" label="Dark" description="Always dark" icon="pi pi-moon" />
      </div>

      <SectionHeading>Environment</SectionHeading>
      <div className="flex max-w-[560px] items-center justify-between gap-4 rounded-lg border border-border-light bg-surface px-4 py-3">
        <div className="flex flex-col">
          <label htmlFor="env-bar-switch" className="text-sm font-semibold text-fg">
            Environment color bar
          </label>
          <span className="text-xs text-fg-muted">
            Paint the selected project&apos;s color as a strip across the top banner.
          </span>
        </div>
        <InputSwitch
          inputId="env-bar-switch"
          checked={envBarEnabled}
          onChange={(e) => setEnvBarEnabled(e.value ?? false)}
        />
      </div>
    </section>
  );
}
