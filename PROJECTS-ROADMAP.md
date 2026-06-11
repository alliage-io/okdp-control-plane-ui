# ROADMAP.md

## Goal

Fix the `/projects` page UX and visual consistency issues.

## Scope

This roadmap focuses only on the `/projects` view and related project listing UI components.

---

## Tasks

### 1. Standardize rounded square ratios

* [ ] Inspect all project cards, tiles, icons, buttons, and rounded square elements in `/projects`.
* [ ] Compare their border radius, width, height, padding, and aspect ratio with the previously standardized UI rules.
* [ ] Identify elements where the rounded square ratio diverges from the shared design system.
* [ ] Replace local/custom radius values with shared tokens or reusable classes where available.
* [ ] Ensure square-like elements remain visually square across responsive breakpoints.
* [ ] Verify that project cards and action buttons are visually consistent with other views.

#### Acceptance criteria

* [ ] Rounded square elements in `/projects` match the standardized ratio used elsewhere.
* [ ] No custom one-off radius values remain unless explicitly justified.
* [ ] The page remains visually consistent on desktop and smaller widths.

---

### 2. Fix initial wizard behavior when there are no projects

* [ ] Review the `/projects` data loading flow.
* [ ] Distinguish clearly between:

  * loading state
  * empty state
  * loaded state with projects
  * error state
* [ ] Ensure the initial wizard is shown only after project loading has completed and the project list is confirmed empty.
* [ ] Prevent the wizard from flashing during the loading phase.
* [ ] Ensure the loading state displays an appropriate placeholder, spinner, or skeleton instead of briefly showing the wizard.
* [ ] Verify the wizard is shown when there are no projects.
* [ ] Verify the wizard is not shown when projects exist.

#### Acceptance criteria

* [ ] The initial wizard appears when the user has zero projects.
* [ ] The initial wizard does not flash before project loading is complete.
* [ ] Users with existing projects never see the wizard during initial page load.
* [ ] Loading, empty, and populated states are visually distinct and stable.

---

### 3. Fix project filter loop icon positioning

* [ ] Locate the filter component used in `/projects`.
* [ ] Identify the loop icon placement issue.
* [ ] Align the icon with the input text, padding, and surrounding controls.
* [ ] Ensure the icon does not overlap text, placeholder, clear buttons, or borders.
* [ ] Verify vertical and horizontal alignment across supported screen sizes.
* [ ] Reuse the same icon/input layout conventions used in other views when possible.

#### Acceptance criteria

* [ ] The loop icon is correctly aligned inside or near the project filter control.
* [ ] The icon positioning matches the visual language of other filter/search components.
* [ ] No overlap or layout shift occurs when typing, clearing, or resizing.

---

### 4. Improve CPU and memory visual bars

* [ ] Inspect the CPU and memory display in the `/projects` page.
* [ ] Compare the current rendering with the colorized bars used in other views.
* [ ] Reuse the existing shared bar/progress component if available.
* [ ] Apply consistent colors, height, radius, spacing, and labels.
* [ ] Ensure CPU and memory values remain readable and accessible.
* [ ] Handle edge cases:

  * missing values
  * zero usage
  * very low usage
  * high usage
  * values above expected thresholds

#### Acceptance criteria

* [ ] CPU and memory use the same nice colorized bar style as other views.
* [ ] Colors are consistent with the existing design system.
* [ ] Bars remain readable and visually balanced.
* [ ] Missing or unknown values are handled gracefully.

---

## Validation checklist

* [ ] `/projects` loads correctly with existing projects.
* [ ] `/projects` loads correctly with zero projects.
* [ ] No empty-state flash occurs during initial loading.
* [ ] Project card shapes and rounded elements are visually consistent.
* [ ] Filter loop icon is correctly positioned.
* [ ] CPU and memory bars match the style of other views.
* [ ] Responsive layout remains correct.
* [ ] No regressions in project navigation or project selection.
* [ ] No unnecessary API calls are introduced.
* [ ] Existing tests still pass.

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

