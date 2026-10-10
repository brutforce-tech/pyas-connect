# Pyas Connect — Project Guidelines

## Context

Pyas Connect (`@pyas/connect`) is a drop-in UI widget that lets developers add calendar provider OAuth (Google, Microsoft, Zoom, iCloud) to their apps in one line of code. This is a **Lerna monorepo** containing the core web component and framework-specific wrappers.

A **v2 overhaul** is planned — see §10–§11 of `PYAS_V2_PLAN.md` in pyas-api. This includes hosted mode (session tokens instead of API keys), hardening (a11y, error handling, loading states), and additional providers.

**This is a 2-developer project.** Keep packages lean and publishable. No heavy process — but keep code clear for both contributors.

## Monorepo Structure

```
packages/
  connect/              # Core Stencil web component (@pyas/connect)
  connect-react/        # React 19 wrapper (@pyas/connect-react)
  connect-vue/          # Vue 3 wrapper (@pyas/connect-vue)
  angular-workspace/    # Angular 19 wrapper (@pyas/connect-angular)
  react-example/        # React demo app
  vue-example/          # Vue demo app
  angular-example/      # Angular demo app
```

### Package Relationships

- `@pyas/connect` is the **core** — Stencil-compiled web components with Shadow DOM.
- React, Vue, and Angular wrappers are **native re-implementations** — they do NOT wrap the web component. They re-implement the UI in their respective framework using shared utilities from `@pyas/connect`.
- Shared code imported by all wrappers: `getOauthUrl()`, `openOAuthPopup()`, provider icons, `theme/main.css`.
- Example apps demonstrate usage and serve as integration tests.

## Architecture

### Core Component (`@pyas/connect`)

- **Stencil 4.x** — compiles TSX to standard web components.
- **Shadow DOM** encapsulation — styles don't leak.
- **Multi-step flow**: Step 1 (provider selection) → Step 2 (user details form + OAuth popup).
- **Props**: `client-id`, `token-name` (required). Plus theme, visibility toggles, copy overrides, user data.
- **Events**: `accountConnected` (success with provider, accountId, email, scopes) and `connectError` (error code + message).
- **OAuth**: Opens popup → calls `https://api.pyas.io/oauth/init` → provider OAuth → popup message back.

### Wrapper Conventions

All wrappers follow the same pattern:
1. Accept identical props (camelCase in their framework's convention).
2. Emit identical events: `onAccountConnected`, `onConnectError`.
3. Import shared utilities from `@pyas/connect` (OAuth helpers, icons).
4. Have their own CSS that mirrors the core theme.

When modifying component behavior, **update all 4 implementations** (Stencil + React + Vue + Angular) to stay in sync.

## Code Style

- **TypeScript** throughout. ES6 target.
- **React wrapper**: Functional components with hooks (`useState`, `useEffect`). No class components.
- **Vue wrapper**: `<script setup>` Composition API. No Options API.
- **Angular wrapper**: Standalone components (Angular 19+). `@Input()` / `@Output()` decorators.
- **Core (Stencil)**: TSX with Stencil decorators (`@Component`, `@Prop`, `@Event`, `@State`).

### Styling

- Core theme in `packages/connect/src/theme/main.css`.
- Each wrapper bundles its own CSS (may import from core).
- Support `theme="light"` and `theme="dark"` variants.
- No external CSS framework dependencies — the widget must be self-contained.

## Build & Publish

```bash
# Root — build all packages
npm run build

# Root — version bump (conventional commits)
npm run version:libs

# Root — publish to npm
npm run publish:libs
```

### Individual Package Builds

```bash
# Core (Stencil)
cd packages/connect && npm run build

# React wrapper (Vite)
cd packages/connect-react && npm run build

# Vue wrapper (Vite)
cd packages/connect-vue && npm run build

# Angular wrapper (ng-packagr)
cd packages/angular-workspace && npm run build
```

### CI/CD

- **create-release.yml**: On push to master → Lerna version bump → release branch → PR.
- **publish-after-merge.yml**: On merge of `chore(release)` PR → build all → publish to npm.
- Uses `NPM_TOKEN` secret for publishing.

## Testing

- **Core**: Jest 29 + Puppeteer (e2e).
- **Vue wrapper**: Vitest with JSDOM.
- **React/Angular**: Basic test setup via framework CLIs.

Run `npm test` in each package directory.

## Key Conventions

1. **API base URL** is hardcoded: `https://api.pyas.io` in `packages/connect/src/utils/oauth.ts`. This will need to become configurable for v2 (sandbox mode, self-hosted).
2. **Semantic versioning** via Lerna conventional commits. All packages share a single version number.
3. **Keep the widget lightweight** — no heavy dependencies. The compiled output should be <50KB gzipped.
4. **Browser compatibility** — must work in all modern browsers. No Node.js-only APIs in client code.
5. **Accessibility** — v2 hardening will add ARIA labels, keyboard navigation, focus management. Start including these in new code now.

## Git Strategy

- **`master`** = production (published to npm)
- **`native-wrappers`** = current active branch (thin wrapper architecture)
- Feature branches: `connect/<feature>` (e.g., `connect/hardening`)
- Always coordinate wrapper changes — if you change the core, update all wrappers.

## v2 Plans

Key v2 changes for this repo (from the plan):
- **Hosted mode**: Session tokens instead of API keys for frontend-only integrations.
- **Hardening**: Loading states, error recovery, retry logic, a11y, i18n.
- **New providers**: iCloud (CalDAV) in Phase 4.
- **Configurable API URL**: Support sandbox/test mode endpoints.
