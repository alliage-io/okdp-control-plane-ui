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

* [x] Remove `Control Plane Settings`.
* [x] Add a direct `Identity` link.
* [x] Ensure the label is exactly `Identity`.
* [x] Ensure the link target is correct.
* [x] Check mouse interaction.
* [x] Check keyboard interaction if the dropdown supports it.

### Acceptance criteria

* [x] The user dropdown contains `Identity`.
* [x] `Control Plane Settings` is no longer shown.
* [x] Clicking `Identity` opens the correct page.

---

## 7. Differentiate Spark History Server icon

Spark and Spark History Server currently use the same icon.

* [x] Keep the Spark base icon for Spark applications.
* [x] Add a clock/history badge to the Spark History Server icon.
* [x] Ensure the badge is visible at lateral-menu icon size.
* [x] Ensure the badge works in expanded menu state.
* [x] Ensure the badge works in collapsed menu state.
* [x] Add an accessible label or title if applicable.
* [x] Do not rely only on color to differentiate the icons.

### Acceptance criteria

* [x] Spark and Spark History Server are visually distinguishable.
* [x] Spark History Server uses a Spark icon with a clock/history badge.
* [x] The icon remains readable in the lateral menu.

---

## 8. Uniform rounded corners

Rounded corners are inconsistent across form inputs, buttons, tiles, and view elements.

* [x] Audit existing `border-radius` values.
* [x] Define shared radius values or reuse existing design tokens.
* [x] Apply consistent radius values to text inputs.
* [x] Apply consistent radius values to selects.
* [x] Apply consistent radius values to textareas.
* [x] Apply consistent radius values to buttons.
* [x] Apply consistent radius values to tiles.
* [x] Apply consistent radius values to cards.
* [x] Apply consistent radius values to panels and main containers.
* [x] Avoid one-off radius values unless clearly justified. *(Remaining: 3px scrollbar thumb, 1px decorative separator line — both intentional.)*

### Acceptance criteria

* [x] Similar UI elements use the same border radius.
* [x] Form controls look consistent.
* [x] Tiles and cards look consistent.
* [x] No obvious rounded-corner mismatch remains.

---

## 9. Normalize deployment form width

Deployment service forms currently have inconsistent widths and the navigation flow is painful.

* [x] Audit all deployment service form steps.
* [x] Define a fixed content width for deployment forms.
* [x] Apply the same width across all deployment steps.
* [x] Align the form consistently inside the main view zone.
* [x] Prevent layout jumps between steps.
* [x] Ensure the fixed width remains responsive on smaller screens.

### Acceptance criteria

* [x] Deployment forms keep a stable width across the flow.
* [x] Navigation between steps does not cause visual jumps.
* [x] Forms remain usable in Chromium at common screen sizes.

---

## 10. Uniform deployment action button sizes

Action buttons in the deployment flow currently have variable sizes.

* [x] Audit all action buttons in the deployment flow.
* [x] Define consistent button sizing rules.
* [x] Apply consistent height.
* [x] Apply consistent padding.
* [x] Apply consistent width or `min-width` where appropriate.
* [x] Ensure primary and secondary actions align correctly.
* [x] Avoid inconsistent button widths caused only by label length.

### Acceptance criteria

* [x] Deployment action buttons have consistent dimensions.
* [x] Button alignment is stable between deployment steps.
* [x] Primary actions remain visually clear.

---

## 11. Normalize left/right padding and margins

* [x] Audit padding and margin in main layout zones.
* [x] Ensure left and right spacing are symmetrical where expected.
* [x] Reuse shared spacing tokens if available.
* [x] Fix spacing inconsistencies in page containers. *(Audit: every page renders in the shared `px-7` shell wrapper — measured 28px on both sides on all routes; remaining one-sided paddings are deliberate icon/indent offsets.)*
* [x] Fix spacing inconsistencies in cards.
* [x] Fix spacing inconsistencies in forms.
* [x] Fix spacing inconsistencies in tiles.
* [x] Fix spacing inconsistencies in deployment pages. *(Deploy/spark forms share `--db-form-width`, centered — section 9.)*
* [x] Fix spacing inconsistencies in admin pages. *(Full-width zone since the sidebar removal — section 5.)*
* [x] Ensure spacing works with the lateral menu visible.
* [x] Ensure spacing works with the lateral menu hidden.

### Acceptance criteria

* [x] Left and right spacing is visually balanced.
* [x] Main zones use consistent padding.
* [x] Pages do not feel shifted or misaligned.

---

## 12. Chromium style audit

Perform a final manual style audit using Chromium.

* [x] Run the application locally.
* [x] Open the application in Chromium.
* [x] Check `/admin`.
* [x] Check `/projects/...` pages.
* [x] Check the Parameters page.
* [x] Check the Secrets menu area.
* [x] Check the Identity page.
* [x] Check the deployment service flow.
* [x] Check Spark application entries.
* [x] Check Spark History Server entry.
* [x] Check expanded lateral menu state.
* [x] Check collapsed lateral menu state.
* [x] Check scrolling behavior.
* [x] Check form widths.
* [x] Check action button sizes.
* [x] Check rounded corners.
* [x] Check left/right padding and margins.
* [x] Fix any obvious visual issue found during the audit.
* [x] Document any remaining known issue.

### Known issues

* The backend exposes no project-update endpoint (`PUT`/`PATCH /api/projects/:name` → 404), so saving a project description from the Parameters page currently surfaces the failure as an error toast. The UI side is complete; the server needs the endpoint.

### Acceptance criteria

* [x] The UI has been checked in Chromium.
* [x] Obvious visual defects have been fixed.
* [x] Remaining issues, if any, are documented.

---

## Final report expected

After implementation, provide a short report containing:

* [x] Summary of implemented changes.
* [x] Files modified.
* [x] Routes affected.
* [x] API behavior changed, if any.
* [x] Chromium audit result.
* [x] Remaining known issues, if any.
* [x] Screenshots if available. *(Audit screenshots in `/tmp/okdp-run/s12-*.png`.)*

---

## Definition of Done

* [x] All checklist items are completed or explicitly documented as not applicable.
* [x] `/admin/projects` and its admin tile are removed.
* [x] Parameters exists under Secrets and supports required project actions.
* [x] Top banner title remains stable when the lateral menu collapses.
* [x] Scrolling is fixed in the main view zone.
* [x] Lateral menu visibility matches the `/projects/...` rule.
* [x] User dropdown links directly to Identity.
* [x] Spark History Server has a clock/history badge.
* [x] Rounded corners are consistent.
* [x] Deployment forms use a stable fixed width.
* [x] Deployment action buttons are uniform.
* [x] Left/right spacing is consistent.
* [x] Chromium audit has been completed.
* [x] Final implementation report has been provided.
