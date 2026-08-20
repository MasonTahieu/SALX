# SALX Frontend — Framer Reconstruction v2

This frontend is a visual-first reconstruction of the live SALX Framer site using these routes as the design source of truth:

- `/`
- `/market`
- `/leaderboard`
- `/retire`

## What's improved in v2

- Warm paper/cream base with olive, sage and moss accents.
- Shared sticky translucent navbar and active route treatment.
- Page entrance transition when changing route.
- Scroll reveal animations on major sections.
- Animated hero orbit/emblem/glow/scanline.
- Horizontal selected-editions rail with snap scrolling and hover motion.
- Animated marquee in the homepage project section.
- Hover lift / image zoom / arrow motion on cards and buttons.
- More structured Market filter panel and project metadata.
- Dark Soulbound certificate panel with subtle animated glow.
- Responsive layouts for desktop, tablet and mobile.
- `prefers-reduced-motion` support.

## Run

```bash
npm install
npm run dev
```

Then open the local Vite URL, normally `http://localhost:5173`.

## Routes

```text
http://localhost:5173/
http://localhost:5173/market
http://localhost:5173/leaderboard
http://localhost:5173/retire
```

## Important integration note

The current buttons and wallet values are visual/demo states only. No smart-contract transaction is performed yet. The component/data structure is intentionally kept simple so BUY SAL and Retire can later be connected to the supplied contract layer without rebuilding the visual design.

## Design fidelity note

The live Framer URLs are treated as the source of truth for information hierarchy and route structure. The exact Framer-hosted image files are not bundled, so the local SVG art is an original visual approximation rather than a copy of the Framer assets. Layout, motion and color treatment are built locally to stay stable during development.
