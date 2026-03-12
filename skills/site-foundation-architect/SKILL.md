---
name: site-foundation-architect
description: Use this skill when the user wants to create a new website project type (service business, portfolio, ecommerce, etc.) from the shared foundation and generate a complete site in a new project folder.
---

# Site Foundation Architect

Create new website projects from the local foundation while preserving reusable architecture.

## Trigger conditions
Use this skill when user intent includes:
- "new type of website"
- "new project from template/foundation"
- "service business site from existing framework"

## Primary workflow
1. Choose a preset from `foundation/presets/`.
2. Scaffold a new project with `foundation/scripts/new-site.sh`.
3. Build/modify `index.html`, `styles.css`, `script.js` in `sites/<project-name>/`.
4. Wire assets in `sites/<project-name>/assets/`.
5. Validate locally first.

## Constraints
- Keep code minimal and maintainable.
- Preserve consistent margin system (`--page-pad`).
- Optimize scroll interactions for both mouse wheel and trackpad.
- Prefer deterministic behavior when animation reliability is a risk.

## Output requirements
- Summary of generated project
- Files changed
- Local preview instructions
