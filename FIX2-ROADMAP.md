# Roadmap

Roadmap is organized per component

## Lateral menu

Contains all the category and services

- [x] Implement unfoldable categories
- [x] Use logo of project favicon for services (superset favicon for superset, etc.)
- [x] When lateral menu is collapsed, categories are simply horizontal separator, instead of unfoldable tree
- [x] Create a new category, "Project configuration", with "Secrets" within
- [x] Remove section admin > identity
- [x] Now that bottom is free, the arrow to collapse can now be placed at bottom, and follow appropriate/commonly used style for bottom collapsing arrow
- [x] Lateral menu should be sticky / fixed, not scrollable
- [x] This menu must be empty in any other pages than a project page (/projects/toto)

## Top Banner

Contains project dropdown <- space separation -> user dropdown
Is at right of Logo - OKDP Console

- [ ] Banner: delete toggle theme
- [ ] Banner: delete GitHub (to set with a link 'logo - GitHub' next to Copyright, in bottom banner)
- [ ] Top banner should be sticky / fixed, as lateral menu
- [ ] Dropdown user should contain: user settings (page), control plane admin settings (page), separator, logout (action)

## Admin page

/admin page is a page that used to exists. Should now be the administration zone of control plane

- [ ] Lateral menu does not contain project/services related (cf previous lateral menu)
- [ ] Only a tile for identity for now

## User settings page

/settings : User settings page

- [x] Light/dark theme with preview like in GitHub
- [x] Control env bar (already exists before roadmap, but in user dropdown)

## Projects page

/projects : List all projects

- [ ] If allowed to create/modify (as for now): Create project button should be visible and vertically aligned with title
- [ ] Bigger env name, link to /projects/<envname>. Replace useless open link. In general, "open" link (with text "open") should be removed, and a click action on name is preferred
- [ ] Remove open link
- [ ] Add columns for welcomed KPI like number of services or instances total in projects, and/or CPU/RAM (like in overview, but per project instead of services)

## Overview Page

/projects/{project_id} : Overview

- [ ] Remove category from path of services /projects/dev/lakehouse/polaris -> /projects/dev/polaris
- [ ] Add some global KPI before running services (ex: number of instances, accredited users (if existing), etc). Not too many.
