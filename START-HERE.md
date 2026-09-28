# Mayar QA Portfolio — complete source handoff

Snapshot: production version 55, 27 September 2026.
Commit: 4360b3bfb81f83f1c2ef38e7927c8f68c5797790
Live website: https://mayar-qa-portfolio.misty-trail-3980.chatgpt.site

## What this project actually uses

The active website is static HTML, CSS and JavaScript. Its laptop screen uses Canvas 2D and a projective CSS matrix3d transform. It is NOT currently a Next.js website. React, React Three Fiber, Drei and Three.js are installed, and an earlier 3D implementation is preserved in src/hero3d.jsx and dist/hero3d.js; index.html does not load that bundle. Do not accidentally reactivate the older scene or place a second laptop over the approved photographic layer.

## Run the current website

The dist folder is the editable website source as well as the static hosting output; do not delete it as disposable build output.

With Node.js 22.12 or newer installed:

    npm ci
    npm run dev

Open http://localhost:4173/ .

Or use Python for the static site, without installing JavaScript dependencies:

    python3 -m http.server 4173 --directory dist

The npm build command only rebuilds the older, inactive React/3D bundle. It does not generate index.html or the active screen animation. Do not introduce a framework migration unless the user specifically approves that work.

## File map

- dist/index.html: page structure, navigation, case study and all four case panels.
- dist/styles.css: original site styling and earlier layered overrides.
- dist/qa-fixes.css: layout, contrast, Arabic desktop composition and story fixes.
- dist/screen-investigation.css and .js: photographic screen insertion, animation, lens, timing, translated external notes and controls.
- dist/mobile-layout.css and .js: mobile layout, readable investigation companion and story card arrangement.
- dist/i18n.js: English/Arabic text mappings and language/theme preferences.
- dist/script.js: case-step navigation, mobile menu and scrolling story motion.
- dist/assets/: images, fonts, favicon assets and downloadable CV.
- package.json and package-lock.json: exact dependency setup.
- .openai/hosting.json: existing Sites project identity and static output configuration.

## Approved design constraints — preserve these

1. Preserve the exact photographic laptop geometry, keyboard, trackpad, lighting, desk and environment. Never generate or overlay a second laptop.
2. The Arabic DESKTOP composition mirrors the photographic laptop and scene horizontally; the UI is independently perspective-mapped and must remain readable, not mirrored. This applies above 1100px only.
3. Preserve the user's approved overlapping, unfolding story-card motion on desktop. The user explicitly likes the overlap; do not redesign or remove it.
4. Preserve the navbar and existing branding.
5. Mobile uses a readable bilingual investigation companion below the photographic scene. The tiny screen remains a visual illustration, not the only place to read the evidence.
6. The published hero and detailed case study now tell the SAME illustrative scenario. Payment = 75.000 KWD; expected refund = 65.000; recorded refund = 55.000; still owed = 10.000. Expected retained = 10.000; actual retained = 20.000.
7. API evidence is reconstructed: POST /api/refunds -> 403, INVALID_REFUND_AMOUNT. Stale booking state is a HYPOTHESIS requiring verification, not a proven production root cause. No client data or company names.
8. Keep Arabic/English, RTL/LTR, light/dark and local preference persistence.
9. Explain the concrete finished changes and request user confirmation immediately before publishing. Local edits and QA may proceed automatically.

## Screen alignment

Canvas logical size: 1200 x 660; image native dimensions: 1671 x 941.
Original display corner coordinates (TL, TR, BR, BL):
[539,98], [1597,124], [1516,783], [458,660].
Arabic desktop mirrored coordinates with readable UI orientation:
[74,124], [1132,98], [1213,660], [155,783].
The fit() routine scales these coordinates to the laptop anchor and solves the projective map. Image mirroring is applied ONLY to the photographic image; never mirror the whole UI canvas.

## Validation already performed and honest limits

- Earlier mobile revision: layout measurements at 320, 360, 390, 430, 768, 820, 1024 and 1363px in both languages and themes; no document horizontal overflow in those measured states.
- Latest case revision: Arabic/English story content, financial arithmetic, mobile 320px technical panel, final stage and restart checked; dark evidence-card contrast corrected.
- Latest desktop revision: visually checked Arabic light/dark and English switching at 1363 x 936. The mirrored UI remained readable and the laptop fully visible.
- These checks are NOT a blanket certification of all devices, all breakpoints or all animation frames.
- Safari, Firefox, real iOS/Android, 200% zoom and actual reduced-motion behavior remain unverified.
- CV: local PDF is valid (one page). No download event was captured in the previous browser test; a separate direct production request received 403. This does not establish whether visitor downloads work. Investigate via a normal browser before labeling the link broken.

## Continuing in another ChatGPT conversation

Upload this ZIP, then paste NEXT-CHAT-PROMPT.txt. A chat with file/code tools can inspect and modify this project. Browser tools are needed for rendered QA. Publishing to this SAME URL requires access to the same Sites project/account; the ZIP alone does not transfer those permissions or include credentials. Without Sites access, the entire dist directory can be deployed to a static host, resulting in a different URL.

## Archive scope

Includes tracked current source, configuration, dependency lockfile, shipped assets, and retained older React source. Excludes node_modules, Git history, temporary QA harnesses and the obsolete nested mayar-portfolio.tar.gz backup. This archive contains no deployment credentials. Google-hosted fonts referenced in CSS require network access; supplied Arabic fonts are bundled.
