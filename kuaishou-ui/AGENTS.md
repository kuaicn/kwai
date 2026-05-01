# Project Overview

This is a Vue 3 + Vite frontend web application built with Vuetify.

The web app is deployed to GitHub Pages at `https://kuaicn.github.io/kwai`.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Vue 3 (Composition API) |
| Build Tool | Vite 8 |
| Language | TypeScript (~5.9.3) |
| UI Library | Vuetify 4 |
| CSS Utility | UnoCSS with `unocss-preset-vuetify` |
| CSS Preprocessor | Sass/SCSS (`sass-embedded`) |
| State Management | Pinia 3 |
| Routing | Vue Router 5 |
| i18n | Vue I18n 11 |
| Icons | Material Design Icons (`@mdi/font`) |
| Fonts | Roboto, Roboto Mono (via `@fontsource/*` + `unplugin-fonts/vite`) |
| Linting | ESLint 9 with `eslint-config-vuetify` |
| Type Checking | `vue-tsc` |

## Project Structure

```
kwai/
├── kuaishou-ui/              # Web frontend
│   ├── src/
│   │   ├── main.ts           # Entry point (bootstraps plugins, mounts app)
│   │   ├── App.vue           # Root component (<v-app> + <router-view>)
│   │   ├── components/       # Reusable Vue components
│   │   │   └── HelloWorld.vue
│   │   ├── pages/            # Page-level route components
│   │   │   └── index.vue
│   │   ├── plugins/          # Plugin registration
│   │   │   ├── index.ts      # registerPlugins(app)
│   │   │   ├── vuetify.ts    # Vuetify instance (defaultTheme: 'system')
│   │   │   └── i18n.ts       # Vue I18n (en + ja messages)
│   │   ├── router/
│   │   │   └── index.ts      # Manual routes for src/pages/*.vue
│   │   ├── stores/
│   │   │   └── app.ts        # Pinia app store (empty skeleton)
│   │   ├── styles/
│   │   │   ├── main.scss     # Global SCSS (vuetify-overrides layer)
│   │   │   ├── settings.scss # Vuetify Sass variables ($color-pack: false)
│   │   │   └── layers.css    # CSS @layer ordering
│   │   └── assets/           # Images (logo.png, logo.svg)
│   ├── public/               # Static public files
│   ├── index.html
│   ├── vite.config.mts       # Vite config (base: '/kwai/')
│   ├── uno.config.ts         # UnoCSS config with Vuetify preset
│   ├── tsconfig.app.json     # App TS config (extends @vue/tsconfig)
│   ├── tsconfig.node.json    # Node/tooling TS config
│   ├── eslint.config.js      # ESLint config (vuetify preset)
│   └── package.json
│
└── .github/workflows/
    └── deploy.yml              # Deploy kuaishou-ui to GitHub Pages
```

## Build and Development Commands

All commands are run from the `kuaishou-ui/` directory unless noted otherwise.

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

# Apply Vuetify MCP rules via ruler
npm run mcp

# Revert Vuetify MCP rules
npm run mcp:revert
```

## Code Style Guidelines

- **Language**: TypeScript for all new code.
- **Vue style**: Composition API with `<script lang="ts" setup>`.
- **Imports**: Use `@/` alias for `src/` directory imports.
- **Component naming**: PascalCase for Vue components.
- **File naming**: Kebab-case for composables, PascalCase for components.
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

Uses `createWebHistory` with `import.meta.env.BASE_URL`. Currently has a single route:
- `/` → `pages/index.vue`

### Vuetify MCP Integration

The project integrates with the Vuetify MCP server via `@intellectronica/ruler`. Configuration is in `.ruler/ruler.toml`:
- MCP server URL: `https://mcp.vuetifyjs.com/mcp`
- Scripts: `npm run mcp` (apply) and `npm run mcp:revert` (revert)

## Deployment

### GitHub Pages (Frontend)

Triggered on push to `main` or `master`, or manually via `workflow_dispatch`.

Workflow: `.github/workflows/deploy.yml`
- Runs on `ubuntu-latest`
- Node.js 22 with npm caching
- `npm ci` → `npm run build` → uploads `kuaishou-ui/dist` → deploys to GitHub Pages

The site is served from repository `kuaicn/kwai` at `https://kuaicn.github.io/kwai/` (hence `base: '/kwai/'` in Vite config).

## Testing

**No automated test suite is currently configured.** The project does not include unit tests, integration tests, or end-to-end tests. If adding tests, consider:

- **Unit**: Vitest + Vue Test Utils for components and composables.
- **E2E**: Playwright or Cypress for page-level flows.

## Important Files for Agents

| File | Purpose |
|------|---------|
| `kuaishou-ui/vite.config.mts` | Vite configuration, plugin setup, path aliases, dev server port |
| `kuaishou-ui/uno.config.ts` | UnoCSS configuration with Vuetify preset and safelist |
| `kuaishou-ui/src/main.ts` | Application bootstrap logic |
| `kuaishou-ui/src/plugins/index.ts` | Central plugin registration |
| `kuaishou-ui/src/styles/layers.css` | CSS cascade layer ordering |
| `.github/workflows/deploy.yml` | GitHub Pages deployment |
