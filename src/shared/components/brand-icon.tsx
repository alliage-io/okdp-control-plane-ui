import type { SimpleIcon } from 'simple-icons';

/** Inline brand logo (simple-icons path data) sized to the sidebar icon
 *  slot. `mono` follows the text color instead of the brand hex, for
 *  near-black brands that would vanish in dark mode. */
export function BrandIcon({ icon, mono }: { icon: SimpleIcon; mono?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-[18px] shrink-0"
      fill={mono ? 'currentColor' : `#${icon.hex}`}
    >
      <path d={icon.path} />
    </svg>
  );
}
