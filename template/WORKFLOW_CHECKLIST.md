# Repeatable Workflow Checklist

## A) Start New Brand Variant
1. Duplicate this project directory.
2. Fill out `template/BRAND_INPUT_TEMPLATE.md` for the new brand.
3. Paste `template/CODEX_PROMPT_TEMPLATE.md` into Codex with your completed brand inputs.

## B) Local Build Quality Gate (Always)
1. Confirm assets exist in `assets/`.
2. Verify local preview loads.
3. Test on desktop:
   - menu links
   - product horizontal scroll
   - story section transitions
4. Test on mobile width.
5. Fix spacing and scroll behavior before deploy.

## C) Versioning
1. Commit when local behavior is approved.
2. Keep small, descriptive commit messages.
3. If a change regresses UX, revert to prior commit.

## D) Deploy
- Push to GitHub.
- Let Cloudflare Pages auto-deploy, or upload manually.
- Validate live URL on desktop + mobile.

## E) Rollback Plan
1. Identify last good commit.
2. Revert commit or reset to previous commit.
3. Redeploy.
