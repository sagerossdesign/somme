# Codex Prompt Template (Reusable For Any Brand)

Use this prompt when starting a new website in Codex:

---
Build a premium single-page website using this existing project structure (`index.html`, `styles.css`, `script.js`).

Requirements:
1. Preserve current architecture unless explicitly changing it.
2. Apply brand details from my `BRAND_INPUT_TEMPLATE.md` data.
3. Keep spacing minimalist and high-end.
4. Keep all edits local-first. Test behavior locally before suggesting deploy.
5. Ensure desktop + mobile behavior is intentional and smooth.
6. For scroll-heavy sections, optimize for both trackpad and mouse wheel.
7. Use consistent side margins (`--page-pad`) across all sections.
8. Do not remove existing section order unless asked.
9. Keep assets in `assets/` and wire exact filenames.
10. After changes, summarize:
   - what changed,
   - which files changed,
   - what to test locally.

Homepage section structure to preserve:
- Header / menu
- Hero
- Product highlight horizontal scroll
- Brand story scroll panels
- Subscription hero
- Footer

Output format from Codex:
- Short summary
- File list
- Local preview URL

---
