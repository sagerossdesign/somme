# Multi-Site Foundation Guide

Use this foundation to create new website projects from one reusable base.

## Core concept
- Keep one stable shared foundation in `foundation/shared/`.
- Scaffold site-specific shells in `sites/<project-name>/`.
- Separate reusable sections, brand content, and animation behavior so future brands change config first.

## Architecture
- `foundation/shared/styles/`: base styles and reusable section styles.
- `foundation/shared/scripts/sections/`: DOM renderers for reusable page sections.
- `foundation/shared/scripts/animations/`: scroll and motion utilities.
- `foundation/starter/`: starter shell copied into each new site.
- `sites/<project-name>/site.config.js`: brand-specific content, asset paths, nav items, and theme tokens.
- `sites/<project-name>/styles.css`: brand-only font-face declarations and visual overrides.

## Create a new project
From repo root:

```bash
foundation/scripts/new-site.sh <project-name> <preset-file>
```

Examples:

```bash
foundation/scripts/new-site.sh north-star-services foundation/presets/service-business.json
foundation/scripts/new-site.sh pine-market foundation/presets/ecommerce-brand.json
foundation/scripts/new-site.sh atlas-studio foundation/presets/portfolio-studio.json
foundation/scripts/new-site.sh ritual-house foundation/presets/immersive-brand.json
```

## After scaffolding
1. Update `sites/<project-name>/site.config.js` with brand copy, links, theme tokens, and asset paths.
2. Add any brand font-face declarations to `sites/<project-name>/styles.css`.
3. Add assets to `sites/<project-name>/assets/`.
4. Extend reusable sections or animation utilities in `foundation/shared/` only when the config model is no longer enough.
5. Run local preview and iterate.

## Codex usage pattern (new thread)
- In a new thread, ask Codex to build inside `sites/<project-name>`.
- Provide brand brief + section requirements + asset filenames.
- Require local-first testing before deploy.
