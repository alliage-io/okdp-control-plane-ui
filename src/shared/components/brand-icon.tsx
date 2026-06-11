/** Minimal brand glyph: what BrandIcon needs to render a mark. simple-icons
 *  entries are structurally compatible; hand-vendored logos (brands missing
 *  from simple-icons) provide their own viewBox. */
export interface BrandGlyph {
  path: string;
  hex: string;
  /** Defaults to the simple-icons 24x24 canvas. */
  viewBox?: string;
}

/** Inline brand logo sized to the sidebar icon slot. `mono` follows the
 *  text color instead of the brand hex, for near-black brands that would
 *  vanish in dark mode. */
export function BrandIcon({ icon, mono }: { icon: BrandGlyph; mono?: boolean }) {
  return (
    <svg
      viewBox={icon.viewBox ?? '0 0 24 24'}
      aria-hidden="true"
      className="h-4 w-[18px] shrink-0"
      fill={mono ? 'currentColor' : `#${icon.hex}`}
    >
      <path d={icon.path} />
    </svg>
  );
}
