# Tailwind Migration Roadmap

Goal: migrate the styling of the OKDP Control Plane UI from hand-written CSS
(~2,400 lines under `src/styles/`, `src/shared/` and per-feature `*.css`
files) to Tailwind CSS v4 utility classes, with **pixel parity** — no visual
redesign. PrimeReact components and the OKDP design language (tokens, dark
mode, animations) are preserved.

## Branch strategy

This branch (`feat/tailwind`) is developed in parallel with `feat/react`,
which is still completing REACT-ROADMAP.md (steps 12–16: services, secret
stores, Spark, tests, cleanup). `feat/tailwind` will be **rebased onto
`feat/react`** as it advances. To keep rebases cheap:

- Infrastructure and global styles are migrated first — `feat/react` rarely
  touches them.
- Per-feature migration only covers areas already **committed** on
  `feat/react` (landing, admin, project console shell & home, shared
  components).
- Features still in flight on `feat/react` (services, secret stores, Spark)
  are migrated in dedicated **post-rebase** steps, once their React port is
  committed.
- The legacy Angular sources under `src/app/` are deleted by REACT-ROADMAP
  step 16 and are out of scope here.

## Target stack

| Concern            | Current                                    | Target                                            |
| ------------------ | ------------------------------------------ | ------------------------------------------------- |
| Styling            | hand-written CSS, semantic class names     | Tailwind CSS v4 utilities in JSX                  |
| Build integration  | plain CSS `@import` chain                  | `@tailwindcss/vite` plugin                        |
| Design tokens      | `--db-*` CSS variables (`variables.css`)   | same variables, exposed as Tailwind theme via `@theme inline` |
| Dark mode          | `body.dark-mode` flips `--db-*` variables  | unchanged mechanism; `dark:` variant added via `@custom-variant` for utility-level cases |
| PrimeReact theming | `--p-*` variable overrides                 | kept as plain CSS (out of Tailwind's scope)       |
| Component CSS      | one `.css` file per component/page         | deleted as rules become utilities; shared multi-element patterns become small components or `@utility` classes |

## Principles

- **Pixel parity.** Every step must render identically before/after (manual
  diff of the affected pages in light + dark mode).
- **`variables.css` stays the single source of truth** for colors, radii,
  shadows and typography. Tailwind utilities consume the variables through
  `@theme inline`, so the `body.dark-mode` switch keeps working with zero
  token duplication.
- **PrimeReact CSS is untouched.** Its theme is customized via `--p-*`
  variables, which remain plain CSS in `variables.css`. Tailwind's preflight
  lives in the `base` cascade layer, so unlayered PrimeReact styles always
  win over it — no compatibility hacks needed.
- **Each step is one commit**; the checkbox is ticked in the same commit.
  `npm run build` and `npm run lint` are green at every step.

## Ordered tasks

- [x] **1. Roadmap** — add this document.
- [x] **2. Toolchain** — install `tailwindcss` + `@tailwindcss/vite`, wire
  the plugin into `vite.config.ts`, replace the top of `styles.css` with
  `@import 'tailwindcss'`, add the `dark` custom variant bound to
  `body.dark-mode`. Build passes, app renders unchanged.
- [x] **3. Theme tokens** — map the `--db-*` tokens into the Tailwind theme
  with `@theme inline`: brand palette (`primary` 50–900), semantic surfaces
  (`surface`, `elevated`), text colors (`fg`, `fg-secondary`, `fg-muted`),
  borders, accents, status colors, radii, shadows (incl. `shadow-card`,
  `shadow-focus`), font family and font-size scale, keyframe animations
  (`animate-fade-in-up`, `animate-fade-in`, `animate-slide-in-right`,
  `animate-scale-in`, `animate-shimmer`).
- [x] **4. Base layer** — port `styles/base.css`: drop the box-sizing reset
  (preflight covers it), move body / scrollbar / selection / focus-visible /
  reduced-motion rules into `@layer base`, redefine `.animate-in*` as
  `@utility`, drop the hand-rolled `.w-full`.
- [x] **5. Shared patterns** — convert the shared patterns from `base.css`
  (`welcome-banner`, `section-heading`, `quick-actions`/`action-card`,
  `empty-state`, `cta-button`) into Tailwind-styled shared React components
  used by admin-home and project-home; delete the CSS rules.
- [x] **6. Layout** — migrate `styles/components/layout.css` (sidebar,
  header, nav, main layout) into utility classes in the admin and project
  console shell JSX.
- [x] **7. Design components** — migrate `styles/components/okdp-design.css`
  into the components that consume it.
- [x] **8. PrimeReact-adjacent CSS** — `tables.css`, `dialogs.css`,
  `forms.css`: convert wrapper/custom classes to utilities; anything that
  styles PrimeReact internals moves to `--p-*` variables where possible.
- [x] **9. Shared components** — `dynamic-schema-form.css`,
  `profile-list-editor.css` → utilities in their TSX; delete the files.
- [x] **10. Landing page** — `features/landing/home-page.css` → utilities.
- [x] **11. Admin space** — `admin-page.css`, `home/admin-home.css`,
  `identity/*.css`, `projects/project-list.css` → utilities.
- [x] **12. Project console** — `project-page.css`, `home/project-home.css`
  → utilities.
- [x] **13. (post-rebase) Services feature** — migrate the services pages'
  CSS (`pod-list.css`, `pod-log-viewer.css`, …) once REACT-ROADMAP step 12
  is committed and this branch is rebased.
- [ ] **14. (post-rebase) Secret stores & Spark features** — same, after
  REACT-ROADMAP steps 13–14.
- [ ] **15. Cleanup** — fold what remains of `src/styles/` into a single
  entry stylesheet (`variables.css` tokens + Tailwind imports), remove
  unused keyframes/utilities, final `lint` + `build` + `test` green.
