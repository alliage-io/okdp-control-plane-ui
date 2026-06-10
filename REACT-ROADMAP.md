# React Migration Roadmap

Goal: convert the OKDP Control Plane UI from Angular 20 to React, preserving
all existing features, routes, styling and behavior.

## Target stack

| Concern        | Angular (current)            | React (target)                  |
| -------------- | ---------------------------- | ------------------------------- |
| Build          | Angular CLI (`@angular/build`) | Vite                          |
| UI library     | PrimeNG 20 (Aura preset)     | PrimeReact 10 (Lara theme — Aura is not shipped for PrimeReact 10) |
| Routing        | `@angular/router`            | `react-router-dom` v7           |
| Auth           | `angular-auth-oidc-client`   | `oidc-client-ts`                |
| HTTP           | `HttpClient` + interceptor   | `fetch` wrapper with token injection + 401/403 handling |
| Reactivity     | Signals + RxJS               | hooks + contexts; SSE via custom hooks |
| Tests          | Jest + jest-preset-angular   | Vitest + Testing Library        |

Global CSS under `src/styles/` is framework-agnostic and is kept as-is.

## Ordered tasks

Each step is implemented and committed independently; the checkbox is ticked
in the same commit that completes the step.

- [x] **1. Roadmap** — add this document.
- [x] **2. Toolchain scaffold** — replace Angular CLI with Vite + React 19 +
  TypeScript: new `package.json` deps/scripts, `vite.config.ts`, `tsconfig`,
  root `index.html`, `src/main.tsx` with a minimal `<App/>`, ESLint flat
  config for React. Remove `angular.json` and Jest/Angular configs.
  `npm run build` passes.
- [x] **3. Core models & infrastructure** — port `core/models/*`,
  `environments/*` and the logger to plain TypeScript modules.
- [x] **4. API layer** — fetch-based `http` client (bearer token injection,
  401/403 → forced logout hook) and ports of all API services:
  project, service, spark, secret-store, external-secret, identity;
  shared SSE subscription helper for `EventSource` streams.
- [x] **5. Authentication** — `oidc-client-ts` based `AuthProvider` exposing
  `useAuth()` (ready / isAuthenticated / profile / roles / login / logout /
  forceLogout / token), silent renew, `autoLogin` query param support,
  deep-link return-URL restore, `<RequireAuth>` route guard and post-login
  space redirect (`SpaceService` equivalent).
- [x] **6. Project context** — `ProjectContextProvider` holding the project
  list merged from REST + SSE events, current project selection persisted in
  `sessionStorage`, consistency effect (deleted project fallback), and the
  project-context guard equivalent (redirect to last/first project).
- [x] **7. Routing skeleton** — full route table with `React.lazy` loaded
  pages, per-route data (title / serviceFilter / deployLabel / emptyMessage),
  guards wired, temporary placeholders for not-yet-ported pages.
- [ ] **8. Shared components** — `DynamicSchemaForm` and `ProfileListEditor`
  rewritten with PrimeReact.
- [ ] **9. Landing page** — login landing page. (The Angular
  `WelcomeComponent` and `ServicePlaceholderPageComponent` were dead code —
  referenced by no route or component — and are dropped, not ported.)
- [ ] **10. Admin space** — admin layout shell, admin home, project list
  (create/delete), identity page with users and groups tabs.
- [ ] **11. Project console shell** — project layout (sidebar, project
  selector, user menu) and project home.
- [ ] **12. Services feature** — services page, service list, deploy / edit /
  detail pages, pod list, pod log viewer (SSE follow), placeholder page.
- [ ] **13. Secret stores feature** — secrets page, secret store list,
  external secret list.
- [ ] **14. Spark feature** — Spark applications page, list, submit / edit /
  detail pages.
- [ ] **15. Tests** — Vitest + Testing Library setup; port the auth service
  and project context specs.
- [ ] **16. Cleanup** — delete remaining Angular sources and configs, update
  `README.md` and `.vscode/`, final `lint` + `build` + `test` all green.
