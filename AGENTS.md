# Project Overview

This repository contains `kuaishou-ui` (branded as **kuaicn**), an open-source Vue 3 + Vite frontend web application for Kuaishou (快手) platform tooling. It is deployed to GitHub Pages at `https://kuaicn.github.io/kwai`.

The app provides QR-code login for Kuaishou accounts and displays account information across multiple Kuaishou services: e-commerce MCN, shop, entertainment guild, agency, and live streaming. All user-facing UI text is in Chinese.

The frontend source code lives entirely inside the `kuaishou-ui/` directory. The repository root only contains Git configuration, GitHub Actions workflows, and this `AGENTS.md`.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build Tool | Vite 8 |
| Language | TypeScript (~5.9.3) |
| UI Library | Vuetify 4 |
| CSS Utility | UnoCSS with `unocss-preset-vuetify` |
| CSS Preprocessor | Sass/SCSS (`sass-embedded`) |
| State Management | Pinia 3 |
| Routing | Vue Router 5 (hash history) |
| i18n | Vue I18n 11 (minimal en/ja skeleton) |
| Icons | Material Design Icons (`@mdi/font`) |
| Fonts | Roboto, Roboto Mono (via `@fontsource/*` + `unplugin-fonts/vite`) |
| HTTP Client | axios |
| Linting | ESLint 9 with `eslint-config-vuetify` |
| Type Checking | `vue-tsc` |

## Project Structure

```
kwai/
├── kuaishou-ui/              # Web frontend (all source code)
│   ├── src/
│   │   ├── main.ts           # Entry point: imports styles, creates Vue app, registers plugins, mounts to #app
│   │   ├── App.vue           # Root component (<v-app> + compact <v-app-bar> with <v-tabs> navigation + <router-view>)
│   │   ├── api/              # API clients
│   │   │   ├── proxy.ts      # ProxyAxios wrapper that routes requests through Apifox web proxy (https://web-proxy.apifox.cn)
│   │   │   ├── qrLogin.ts    # Kuaishou QR login async generator (start → scanResult → acceptResult → callback)
│   │   │   └── kuaixiaodian.ts # Kuaixiaodian MCN API helpers (searchUser, inviteUser, verifyInvitation, queryInvitations)
│   │   ├── composables/
│   │   │   └── useAccountDB.ts # IndexedDB wrapper for persistent account storage (add/get/delete/clear)
│   │   ├── pages/            # Page-level route components
│   │   │   ├── index.vue     # Home page with disclaimer (免责申明)
│   │   │   ├── account.vue   # QR login flow and saved-accounts management
│   │   │   ├── mcn.vue       # E-commerce MCN account info viewer
│   │   │   ├── shop.vue      # Shop (小店) account info and CPS permissions viewer
│   │   │   ├── guild.vue     # Entertainment guild (娱乐公会) info and permission tree
│   │   │   ├── agency.vue    # Agency page (公会机构) — placeholder
│   │   │   ├── live-app.vue  # Live streaming (App) — placeholder
│   │   │   └── live-web.vue  # Live streaming (Web) — placeholder
│   │   ├── plugins/
│   │   │   ├── index.ts      # Central plugin registration (Vuetify → Pinia → i18n → Router)
│   │   │   ├── vuetify.ts    # Vuetify instance (defaultTheme: 'system')
│   │   │   └── i18n.ts       # Vue I18n setup with en/ja skeleton messages
│   │   ├── router/
│   │   │   └── index.ts      # Manual hash-history routes for all pages in src/pages/
│   │   ├── stores/
│   │   │   └── app.ts        # Pinia app store (empty skeleton)
│   │   └── styles/
│   │       ├── main.scss     # Global SCSS inside @layer vuetify-overrides
│   │       ├── settings.scss # Vuetify Sass variables ($color-pack: false, $utilities: false)
│   │       └── layers.css    # CSS cascade layer ordering
│   ├── public/               # Static public files (favicon.ico)
│   ├── index.html
│   ├── vite.config.mts       # Vite config (base: '/kwai/', port 3000, plugins: Vue + Vuetify + Fonts + UnoCSS)
│   ├── uno.config.ts         # UnoCSS config with Vuetify preset (MD3 typography/elevation) and safelist
│   ├── tsconfig.json         # Root TS project references
│   ├── tsconfig.app.json     # App TS config (extends @vue/tsconfig)
│   ├── tsconfig.node.json    # Node/tooling TS config
│   ├── eslint.config.js      # ESLint config using eslint-config-vuetify with ts: true
│   ├── env.d.ts              # Vite client type declarations
│   └── package.json
│
├── .github/workflows/
│   └── deploy.yml              # GitHub Pages deployment workflow
│
└── AGENTS.md                   # This file
```

## Build and Development Commands

All npm commands are run from the `kuaishou-ui/` directory.

```bash
# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev

# Production build (type-check + vite build)
npm run build

# Build without type checking
npm run build-only

# Type check only
npm run type-check

# Preview production build locally
npm run preview

# Lint
npm run lint

# Lint and auto-fix
npm run lint:fix

# Apply Vuetify MCP rules via @intellectronica/ruler
npm run mcp

# Revert Vuetify MCP rules
npm run mcp:revert
```

## Code Style Guidelines

- **Language**: TypeScript for all new code.
- **Vue style**: Composition API with `<script lang="ts" setup>`.
- **Imports**: Use `@/` alias for `src/` directory imports.
- **Component naming**: PascalCase for Vue components.
- **File naming**: Kebab-case for composables and page files, PascalCase for components.
- **CSS layers**: The project uses explicit CSS layer ordering (`vuetify-core`, `vuetify-components`, `vuetify-overrides`, `vuetify-utilities`, `uno`, `vuetify-final`). Custom overrides should be placed in the `vuetify-overrides` layer via `src/styles/main.scss`.
- **Vuetify settings**: Sass variables are configured in `src/styles/settings.scss`. `$color-pack` and `$utilities` are explicitly disabled because UnoCSS handles utilities.
- **UnoCSS**: Utility classes are generated via UnoCSS with the Vuetify preset. The preset configures MD3 typography and elevation. Safelist includes `elevation-0` through `elevation-5` and `rounded*` variants.
- **ESLint**: Uses `eslint-config-vuetify` with TypeScript support enabled.

## Runtime Architecture

### Web App Bootstrap (`src/main.ts`)

1. Imports global styles (`unfonts.css`, `virtual:uno.css`, `main.scss`).
2. Creates the main Vue app with `App.vue`.
3. Registers plugins (Vuetify, Pinia, i18n, Router).
4. Mounts to `#app`.

### Plugin Registration (`src/plugins/index.ts`)

Plugins are registered in this order:
1. Vuetify
2. Pinia
3. Vue I18n
4. Vue Router

### Router

Uses `createWebHashHistory` (not `createWebHistory`) with `import.meta.env.BASE_URL`. Hash history is used because the app is served from GitHub Pages under a subpath (`/kwai/`).

Routes:
- `/` → `pages/index.vue`
- `/account` → `pages/account.vue`
- `/mcn` → `pages/mcn.vue`
- `/shop` → `pages/shop.vue`
- `/guild` → `pages/guild.vue`
- `/agency` → `pages/agency.vue`
- `/live-app` → `pages/live-app.vue`
- `/live-web` → `pages/live-web.vue`

### API Proxy (`src/api/proxy.ts`)

The app does **not** call Kuaishou APIs directly from the browser. All requests go through a custom `ProxyAxios` class that forwards them to `https://web-proxy.apifox.cn/api/v1/request`. This bypasses CORS restrictions. The wrapper serializes original headers and proxy options into custom `api-h0` and `api-o0` headers.

### QR Login (`src/api/qrLogin.ts`)

Implements Kuaishou's QR login as an async generator with the following stages:
1. `start` — fetch QR code image and tokens
2. `scanning` — long-poll `scanResult` (~60s)
3. `scanned` — user scanned the code
4. `accepting` — long-poll `acceptResult` (~60s)
5. `accepted` — user confirmed login
6. `done` — callback returns credentials (apiSt, apiAt, ssecurity, passToken, etc.)
7. `error` — any step fails

### Account Storage (`src/composables/useAccountDB.ts`)

Accounts are persisted in the browser's **IndexedDB** (`kuaicn-accounts` database, version 1, `accounts` object store). Each account record contains:
- `sid`, `userId`, `userName`, `headurl`
- `apiSt`, `apiAt`, `bUserId`, `ssecurity`, `passToken`
- `createdAt`

Pages filter accounts by `sid` to show only relevant accounts for each service (e.g., `kuaishou.shop.b` for MCN/Shop, `kuaishou.web.cp.api` for Guild/Agency).

### Credential Expiration Handling

When API responses return `result === 109` (session expired/invalid), the affected account is automatically deleted from IndexedDB and the UI refreshes the account list. This pattern is used consistently across `mcn.vue`, `shop.vue`, and `guild.vue`.

### Vuetify MCP Integration

The project integrates with the Vuetify MCP server via `@intellectronica/ruler`. Configuration is in `kuaishou-ui/.ruler/ruler.toml`:
- MCP server URL: `https://mcp.vuetifyjs.com/mcp`
- Scripts: `npm run mcp` (apply) and `npm run mcp:revert` (revert)

## Deployment

### GitHub Pages

Triggered on push to `main` or `master`, or manually via `workflow_dispatch`.

Workflow: `.github/workflows/deploy.yml`
- Runs on `ubuntu-latest`
- Node.js 22 with npm caching
- `npm ci` → `npm run build` → uploads `kuaishou-ui/dist` → deploys to GitHub Pages

The site is served from repository `kuaicn/kwai` at `https://kuaicn.github.io/kwai/` (hence `base: '/kwai/'` in Vite config).

## Testing

**No automated test suite is currently configured.** The project does not include unit tests, integration tests, or end-to-end tests.

If adding tests, consider:
- **Unit**: Vitest + Vue Test Utils for components and composables.
- **E2E**: Playwright or Cypress for page-level flows.

## Security Considerations

- **Credential Storage**: The app stores sensitive authentication tokens (`apiSt`, `apiAt`, `ssecurity`, `passToken`) in the browser's IndexedDB. These are Kuaishou session credentials.
- **Third-Party Proxy**: All API traffic is routed through an Apifox web proxy (`https://web-proxy.apifox.cn`). Do not introduce production secrets or unrelated sensitive data.
- **SSL Verification Disabled**: The proxy configuration sets `rejectUnauthorized: false`, which disables SSL certificate verification for proxied requests.
- **No Backend**: This is a pure client-side SPA. There is no server-side rendering or API secret management.

## Important Files for Agents

| File | Purpose |
|------|---------|
| `kuaishou-ui/vite.config.mts` | Vite configuration, plugin setup, path aliases (`@/src`), dev server port |
| `kuaishou-ui/uno.config.ts` | UnoCSS configuration with Vuetify preset, MD3 typography/elevation, safelist |
| `kuaishou-ui/src/main.ts` | Application bootstrap logic |
| `kuaishou-ui/src/plugins/index.ts` | Central plugin registration order |
| `kuaishou-ui/src/router/index.ts` | Route definitions and history mode |
| `kuaishou-ui/src/styles/layers.css` | CSS cascade layer ordering |
| `kuaishou-ui/src/api/proxy.ts` | ProxyAxios wrapper for all outbound API calls |
| `kuaishou-ui/src/composables/useAccountDB.ts` | IndexedDB account persistence layer |
| `.github/workflows/deploy.yml` | GitHub Pages deployment pipeline |
