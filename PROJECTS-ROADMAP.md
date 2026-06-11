# ROADMAP.md

## Goal

Fix the `/projects` page UX and visual consistency issues.

## Scope

This roadmap focuses only on the `/projects` view and related project listing UI components.

---

## Tasks

### 1. Standardize rounded square ratios

* [x] Inspect all project cards, tiles, icons, buttons, and rounded square elements in `/projects`.
* [x] Compare their border radius, width, height, padding, and aspect ratio with the previously standardized UI rules.
* [x] Identify elements where the rounded square ratio diverges from the shared design system.
* [x] Replace local/custom radius values with shared tokens or reusable classes where available.
* [x] Ensure square-like elements remain visually square across responsive breakpoints.
* [x] Verify that project cards and action buttons are visually consistent with other views.

#### Acceptance criteria

* [x] Rounded square elements in `/projects` match the standardized ratio used elsewhere.
* [x] No custom one-off radius values remain unless explicitly justified.
* [x] The page remains visually consistent on desktop and smaller widths.

---

### 2. Fix initial wizard behavior when there are no projects

* [x] Review the `/projects` data loading flow.
* [x] Distinguish clearly between:

  * loading state
  * empty state
  * loaded state with projects
  * error state
* [x] Ensure the initial wizard is shown only after project loading has completed and the project list is confirmed empty.
* [x] Prevent the wizard from flashing during the loading phase.
* [x] Ensure the loading state displays an appropriate placeholder, spinner, or skeleton instead of briefly showing the wizard.
* [x] Verify the wizard is shown when there are no projects.
* [x] Verify the wizard is not shown when projects exist.

#### Acceptance criteria

* [x] The initial wizard appears when the user has zero projects.
* [x] The initial wizard does not flash before project loading is complete.
* [x] Users with existing projects never see the wizard during initial page load.
* [x] Loading, empty, and populated states are visually distinct and stable.

---

### 3. Fix project filter loop icon positioning

* [x] Locate the filter component used in `/projects`.
* [x] Identify the loop icon placement issue.
* [x] Align the icon with the input text, padding, and surrounding controls.
* [x] Ensure the icon does not overlap text, placeholder, clear buttons, or borders.
* [x] Verify vertical and horizontal alignment across supported screen sizes.
* [x] Reuse the same icon/input layout conventions used in other views when possible.

#### Acceptance criteria

* [x] The loop icon is correctly aligned inside or near the project filter control.
* [x] The icon positioning matches the visual language of other filter/search components.
* [x] No overlap or layout shift occurs when typing, clearing, or resizing.

---

### 4. Improve CPU and memory visual bars

* [x] Inspect the CPU and memory display in the `/projects` page.
* [x] Compare the current rendering with the colorized bars used in other views.
* [x] Reuse the existing shared bar/progress component if available.
* [x] Apply consistent colors, height, radius, spacing, and labels.
* [x] Ensure CPU and memory values remain readable and accessible.
* [x] Handle edge cases:

  * missing values
  * zero usage
  * very low usage
  * high usage
  * values above expected thresholds

#### Acceptance criteria

* [x] CPU and memory use the same nice colorized bar style as other views.
* [x] Colors are consistent with the existing design system.
* [x] Bars remain readable and visually balanced.
* [x] Missing or unknown values are handled gracefully.

---

## Validation checklist

* [x] `/projects` loads correctly with existing projects.
* [x] `/projects` loads correctly with zero projects.
* [x] No empty-state flash occurs during initial loading.
* [x] Project card shapes and rounded elements are visually consistent.
* [x] Filter loop icon is correctly positioned.
* [x] CPU and memory bars match the style of other views.
* [x] Responsive layout remains correct.
* [x] No regressions in project navigation or project selection.
* [x] No unnecessary API calls are introduced.
* [x] Existing tests still pass.

---

## Suggested implementation order

1. Fix the loading / empty / wizard state logic.
2. Fix the filter icon positioning.
3. Standardize rounded square ratios.
4. Replace or align CPU and memory bars with the shared colorized bar style.
5. Perform responsive and regression testing.

---

## Notes for the AI agent

* Prefer reusing existing shared components, tokens, and utility classes.
* Avoid introducing new visual rules if the design system already defines them.
* Keep the implementation minimal and focused on `/projects`.
* Do not refactor unrelated views.
* Do not change API behavior unless required for correctly identifying the empty project state.
* Preserve existing navigation and permissions logic.

