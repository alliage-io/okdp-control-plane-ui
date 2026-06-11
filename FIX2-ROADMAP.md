# Roadmap: Admin Console Navigation and UI Cleanup

## Goal

Implement the requested navigation, layout, and style cleanup for the admin/project console.

The agent must keep the implementation focused, avoid unrelated refactors, and update this checklist as tasks are completed.

---

## 1. Remove obsolete project admin entry points

* [x] Remove the `/admin/projects` route.
* [x] Remove the `projects` tile from the `/admin` page.
* [x] Remove or update any links pointing to `/admin/projects`.
* [x] Ensure direct navigation to `/admin/projects` does not expose a broken page.
* [x] Update route config, navigation config, and tests if needed.

### Acceptance criteria

* [x] `/admin/projects` is no longer reachable from the UI.
* [x] The `/admin` dashboard no longer displays a `projects` tile.
* [x] No visible UI element links to the removed page.

---

## 2. Add Parameters under Secrets in the lateral menu

Add a new **Parameters** entry under **Secrets** in the lateral menu.

* [x] Add a `Parameters` menu item below `Secrets`.
* [x] Use a wheel/settings icon for the `Parameters` entry.
* [x] Create or update the Parameters page.
* [x] Move project-related settings into this page.

### Project management actions

* [x] Allow deleting projects from the Parameters page.
* [x] Allow updating the project description from the Parameters page.
* [x] When updating the project description, do not call the update API if the description does not exist.
* [x] When updating the project description, call the update API if the description exists.
* [x] Add proper success feedback.
* [x] Add proper error feedback.
* [x] Handle failed delete/update operations safely.

### Acceptance criteria

* [x] `Parameters` appears under `Secrets`.
* [x] The entry uses a wheel/settings icon.
* [x] Project deletion is available from Parameters.
* [x] Project description update works correctly. *(UI side — the backend exposes no update endpoint yet: `PUT/PATCH /api/projects/:name` return 404. The UI calls `PUT /api/projects/:name` and surfaces the failure as an error toast.)*
* [x] No unnecessary API call is made when the description does not exist.

---

## 3. Keep “OKDP Console” visible when collapsing the lateral menu

* [x] Review the lateral menu collapse behavior.
* [x] Ensure the top banner title `OKDP Console` does not collapse.
* [x] Ensure `OKDP Console` does not disappear when the lateral menu is collapsed.
* [x] Keep the top banner visually stable in both expanded and collapsed states.
* [x] Fix any clipping, shrinking, or unwanted horizontal shift.

### Acceptance criteria

* [x] Collapsing the lateral menu does not affect the `OKDP Console` title.
* [x] The top banner remains stable and readable.

---

## 4. Fix scrolling in the main view zone

Scrolling is currently broken.

* [x] Identify the intended scrollable container.
* [x] Make only the main content/view zone scrollable.
* [x] Keep the top banner fixed.
* [x] Keep the lateral menu fixed.
* [x] Prevent unwanted body-level scrolling if not intended.
* [x] Prevent double scrollbars.
* [x] Test pages with long content.
* [x] Test pages with forms.
* [x] Test pages with tiles.
* [x] Test the deployment flow.

### Acceptance criteria

* [x] Main content scrolls correctly.
* [x] Top banner remains visible.
* [x] Lateral menu remains visible.
* [x] No content is hidden behind fixed layout elements.
* [x] No unwanted double scrollbar appears.

---

## 5. Show lateral menu only on `/projects/...` URLs

* [x] Update layout logic so the lateral menu appears only on routes matching `/projects/...`.
* [x] Hide the lateral menu outside `/projects/...`.
* [x] Remove empty reserved layout space when the lateral menu is hidden.
* [x] Check `/admin`.
* [x] Check Identity pages.
* [x] Check login/logout pages if applicable.
* [x] Check other non-project routes.

### Acceptance criteria

* [x] The lateral menu is visible on `/projects/...` routes.
* [x] The lateral menu is hidden outside `/projects/...` routes.
* [x] Pages without the lateral menu are not shifted or misaligned.

---

## 6. Replace “Control Plane Settings” with Identity link

In the user dropdown menu:

* [ ] Remove `Control Plane Settings`.
* [ ] Add a direct `Identity` link.
* [ ] Ensure the label is exactly `Identity`.
* [ ] Ensure the link target is correct.
* [ ] Check mouse interaction.
* [ ] Check keyboard interaction if the dropdown supports it.

### Acceptance criteria

* [ ] The user dropdown contains `Identity`.
* [ ] `Control Plane Settings` is no longer shown.
* [ ] Clicking `Identity` opens the correct page.

---

## 7. Differentiate Spark History Server icon

Spark and Spark History Server currently use the same icon.

* [ ] Keep the Spark base icon for Spark applications.
* [ ] Add a clock/history badge to the Spark History Server icon.
* [ ] Ensure the badge is visible at lateral-menu icon size.
* [ ] Ensure the badge works in expanded menu state.
* [ ] Ensure the badge works in collapsed menu state.
* [ ] Add an accessible label or title if applicable.
* [ ] Do not rely only on color to differentiate the icons.

### Acceptance criteria

* [ ] Spark and Spark History Server are visually distinguishable.
* [ ] Spark History Server uses a Spark icon with a clock/history badge.
* [ ] The icon remains readable in the lateral menu.

---

## 8. Uniform rounded corners

Rounded corners are inconsistent across form inputs, buttons, tiles, and view elements.

* [ ] Audit existing `border-radius` values.
* [ ] Define shared radius values or reuse existing design tokens.
* [ ] Apply consistent radius values to text inputs.
* [ ] Apply consistent radius values to selects.
* [ ] Apply consistent radius values to textareas.
* [ ] Apply consistent radius values to buttons.
* [ ] Apply consistent radius values to tiles.
* [ ] Apply consistent radius values to cards.
* [ ] Apply consistent radius values to panels and main containers.
* [ ] Avoid one-off radius values unless clearly justified.

### Acceptance criteria

* [ ] Similar UI elements use the same border radius.
* [ ] Form controls look consistent.
* [ ] Tiles and cards look consistent.
* [ ] No obvious rounded-corner mismatch remains.

---

## 9. Normalize deployment form width

Deployment service forms currently have inconsistent widths and the navigation flow is painful.

* [ ] Audit all deployment service form steps.
* [ ] Define a fixed content width for deployment forms.
* [ ] Apply the same width across all deployment steps.
* [ ] Align the form consistently inside the main view zone.
* [ ] Prevent layout jumps between steps.
* [ ] Ensure the fixed width remains responsive on smaller screens.

### Acceptance criteria

* [ ] Deployment forms keep a stable width across the flow.
* [ ] Navigation between steps does not cause visual jumps.
* [ ] Forms remain usable in Chromium at common screen sizes.

---

## 10. Uniform deployment action button sizes

Action buttons in the deployment flow currently have variable sizes.

* [ ] Audit all action buttons in the deployment flow.
* [ ] Define consistent button sizing rules.
* [ ] Apply consistent height.
* [ ] Apply consistent padding.
* [ ] Apply consistent width or `min-width` where appropriate.
* [ ] Ensure primary and secondary actions align correctly.
* [ ] Avoid inconsistent button widths caused only by label length.

### Acceptance criteria

* [ ] Deployment action buttons have consistent dimensions.
* [ ] Button alignment is stable between deployment steps.
* [ ] Primary actions remain visually clear.

---

## 11. Normalize left/right padding and margins

* [ ] Audit padding and margin in main layout zones.
* [ ] Ensure left and right spacing are symmetrical where expected.
* [ ] Reuse shared spacing tokens if available.
* [ ] Fix spacing inconsistencies in page containers.
* [ ] Fix spacing inconsistencies in cards.
* [ ] Fix spacing inconsistencies in forms.
* [ ] Fix spacing inconsistencies in tiles.
* [ ] Fix spacing inconsistencies in deployment pages.
* [ ] Fix spacing inconsistencies in admin pages.
* [ ] Ensure spacing works with the lateral menu visible.
* [ ] Ensure spacing works with the lateral menu hidden.

### Acceptance criteria

* [ ] Left and right spacing is visually balanced.
* [ ] Main zones use consistent padding.
* [ ] Pages do not feel shifted or misaligned.

---

## 12. Chromium style audit

Perform a final manual style audit using Chromium.

* [ ] Run the application locally.
* [ ] Open the application in Chromium.
* [ ] Check `/admin`.
* [ ] Check `/projects/...` pages.
* [ ] Check the Parameters page.
* [ ] Check the Secrets menu area.
* [ ] Check the Identity page.
* [ ] Check the deployment service flow.
* [ ] Check Spark application entries.
* [ ] Check Spark History Server entry.
* [ ] Check expanded lateral menu state.
* [ ] Check collapsed lateral menu state.
* [ ] Check scrolling behavior.
* [ ] Check form widths.
* [ ] Check action button sizes.
* [ ] Check rounded corners.
* [ ] Check left/right padding and margins.
* [ ] Fix any obvious visual issue found during the audit.
* [ ] Document any remaining known issue.

### Acceptance criteria

* [ ] The UI has been checked in Chromium.
* [ ] Obvious visual defects have been fixed.
* [ ] Remaining issues, if any, are documented.

---

## Final report expected

After implementation, provide a short report containing:

* [ ] Summary of implemented changes.
* [ ] Files modified.
* [ ] Routes affected.
* [ ] API behavior changed, if any.
* [ ] Chromium audit result.
* [ ] Remaining known issues, if any.
* [ ] Screenshots if available.

---

## Definition of Done

* [ ] All checklist items are completed or explicitly documented as not applicable.
* [ ] `/admin/projects` and its admin tile are removed.
* [ ] Parameters exists under Secrets and supports required project actions.
* [ ] Top banner title remains stable when the lateral menu collapses.
* [ ] Scrolling is fixed in the main view zone.
* [ ] Lateral menu visibility matches the `/projects/...` rule.
* [ ] User dropdown links directly to Identity.
* [ ] Spark History Server has a clock/history badge.
* [ ] Rounded corners are consistent.
* [ ] Deployment forms use a stable fixed width.
* [ ] Deployment action buttons are uniform.
* [ ] Left/right spacing is consistent.
* [ ] Chromium audit has been completed.
* [ ] Final implementation report has been provided.
