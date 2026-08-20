# Pascall Systems Design System

**Pascall Systems Inc.** — *Personalize anesthesia state control for all.*

Pascall is a clinical-grade medical device company building the next generation of anesthesia monitoring. Their products sit at the bedside in operating rooms: an EEG sensor band ("M0" / "PSU1") worn by the patient streams 2–4 channels of EEG to an Android tablet running the Pascall display app, where a clinician-friendly dashboard shows real-time waveforms, spectrograms, phase-amplitude coupling (PAC), burst suppression (BSP), impedance, EMG/ESU/ARTF indices, and patient age-adjusted guidance.

This design system captures the visual + interaction language of the tablet display app so new surfaces (settings, onboarding, reports, marketing, decks) can feel like part of the same family.

---

## Sources

All visual + interaction context in this design system was extracted from the following repo, branch `research`:

- **pascall-m0-display** — https://github.com/Pascall-Systems-Software/pascall-m0-display/tree/research
  - `mainapp/src/main/res/` — current M0 tablet app (Android, landscape, 1920×1200)
  - `landscape_display_app/src/main/res/` — older landscape variant (reference only)
  - `common/src/main/res/` — shared values, styles, legacy colors
  - `common/src/main/java/.../constants/` — `AppConstants.java` (connection-quality thresholds, channel names), `SpectrogramColors.java` (jet-like colormap)

No Figma file, brand book, slide template, or marketing site was provided — all inferences below come from reading Android `colors.xml`, `styles.xml`, `strings.xml`, layout XML, and drawable XML. Anywhere this guide is making an educated guess beyond that evidence, we flag it.

Related repos the org maintains (not opened for this design system, but useful context on the broader product suite):
- `pascall-algo`, `firmware-psu`, `PSU_BLE_GATEWAY` — sensor / BLE gateway / algorithm packages
- `Engineering_Test_App`, `chrome-ext-design-control`, `visualize-jira-task` — internal R&D tools
- `pminds`, `netmac`, `assistantbot`, `emailmonitorpascall` — internal ops tooling

---

## Products represented

| Surface | Platform | Status |
|---|---|---|
| **M0 Display** (mainapp) | Android tablet, landscape 1920×1200 | Primary — design system built from this |
| **pMinds** (cognitive assessment) | Flutter tablet, landscape 1900×1200 | Second kit added — different visual language |
| Landscape Display (legacy) | Android | Reference only |
| Simulator app, Data Transfer app, Education app, Experiment app | Android dev tools | Out of scope |

UI kits:
- `ui_kits/m0_display/` — M0 bedside display (clinical dark teal, Roboto/Obvia)
- `ui_kits/pminds/` — pMinds cognitive assessment (patient-facing, AinslieSans, dark teal + light green accent)

Source for pMinds: `Pascall-Systems-Software/pminds` @ main. **Note:** the backend (`pmind_backend/app.py`) has hardcoded AWS credentials and an API key as defaults — rotate and strip these from the repo.

---

## Index

- `README.md` — this file (content + visual foundations, iconography)
- `colors_and_type.css` — all color + typography tokens (CSS vars)
- `SKILL.md` — Agent Skill manifest (run this system as a Claude Code skill)
- `assets/` — logos (placeholder), icons
- `preview/` — small HTML cards that populate the Design System tab
- `ui_kits/m0_display/` — React/JSX recreation of the tablet app UI
  - `index.html` — clickable prototype (Connect → New Case → Live → Impedance → Settings)
  - `Components.jsx` — StatusBar, Button, SignalDot, Toggle, Radio, Numpad
  - `Visuals.jsx` — Waveform + Spectrogram canvas components
  - `Screens.jsx` — ConnectingScreen, StartScreen, LiveScreen, ImpedanceScreen, SettingsScreen

---

## CONTENT FUNDAMENTALS

The M0 app's UI strings read like **clinical lab equipment, not a consumer app**. Tone is terse, declarative, and functional — optimized for a clinician glancing at a screen during a procedure.

### Voice & tone
- **Third-person, instructional.** "Sensor connected successfully!" · "Performing sampling rate check …" · "Please switch the sensor or seek technical support." No "you", no "we", no marketing softening.
- **Status, not narration.** Strings describe *state*, not feelings: `Connection established.` · `Sampling rate check passed` · `Checking sampling rate …`. An ellipsis (`…` or literal `...`) signals "in progress."
- **Title Case for actions, Sentence case for messages.** Buttons: `Start Case`, `Clear`, `Back`, `Scan`, `Stop`, `Connect`. Status text: `waiting for sensor to connect ...` (note: lowercase — matches the filed string verbatim).
- **No emoji. No icons-in-copy. No exclamation except for positive status** (`Sensor connected successfully!`).
- **Units always spelled out in SI.** `Hz`, `dB`, `Ω / KΩ / MΩ`, `µV`. Ranges written with ranges: `Frequency setting from 0.1 to 400`.
- **Abbreviations clinicians know.** `R1 / R2 / L1 / L2` (right/left EEG channels), `EMG`, `ESU`, `ARTF`, `BSP`, `SEF`, `PAC`, `SRE`, `RRE`, `EDF`, `BDF`. These ship uppercase and unexplained — the audience is anesthesiologists and technicians, not lay users.
- **Default / empty values are `--` or `--%`.** `<string name="default_patient_age">--</string>`, `<string name="emg_artf_bsp_default_value">--%</string>`.
- **Errors are direct and tell you the next step.** `Sampling Rate check failed. Please switch the sensor or seek technical support.` · `BLE is not supported` · `No devices have been paired`.

### Examples (verbatim from strings.xml)
- Progress: *"waiting for sensor to connect ..."*, *"Performing sampling rate check ..."*, *"scanning for devices..."*
- Success: *"Sensor connected successfully!"*, *"Connection established."*, *"Sampling rate check passed"*
- Failure: *"Sampling Rate check failed. Please switch the sensor or seek technical support."*, *"EDF file is not available"*
- Instructional: *"select a device to connect"*, *"Please select test unit"*
- Warning: *"Your device only has {0} MB of storage left. Please create backup for your data, the latest case recording will be deleted to make space for new cases"*

### When extending
- New microcopy should be **≤ 12 words**, clinical, and state-based. Imagine it on a 1920-px-wide dashboard the clinician sees across the room.
- Avoid marketing voice, metaphors, first-person, "Let's …", "Oops", emoji.
- When adding a metric, use the existing pattern: `LABEL : value unit` (colon + space, e.g. `SRE : 249.8 Hz`).

---

## VISUAL FOUNDATIONS

**Overall feel:** clinical instrument, not app. Dense, data-first, landscape-oriented. Dark status bar up top, light neutral body, black waveform canvases, saturated primary signal colors (pure R/G/B/Y) for at-a-glance channel identification. Think **hospital monitor crossed with tablet UI**, not SaaS dashboard.

### Color
- **Primary brand color:** `#09869F` — a cyan-teal (`colorPrimary` in mainapp). The legacy apps used `#004E9C` (deep blue); the current mainapp has moved to teal. Use teal for new work.
- **Accent:** `#D81B60` magenta (`colorAccent`) — very sparing; toggle thumb / Material-style highlights only.
- **Action orange `#EC8D00`** is the dominant *interactive* color. The Start Case button, patient-age readouts, sensor battery fill, and warning-level text all use it. It reads as "ready / action" in context, not "warning" — which is a Pascall-specific convention worth preserving.
- **Status bar `#37474F`** (slate) anchors the top of every screen. White 34-px text over slate is the global header pattern.
- **Surface:** mostly pure white `#FFFFFF` with a `#E2E2E2` grey band for secondary headers.
- **Waveform canvas:** pure black `#000000`. Channels are drawn in **pure RGB primaries + yellow** (R1=red, R2=blue, L1=green, L2=yellow) for maximum separability on black.
- **Spectrogram** uses a jet-like colormap (blue → cyan → green → yellow → red → dark-red), enumerated exactly in `SpectrogramColors.java`.
- **Semantic signal-quality palette** (from `AppConstants.java`): good/strong = `#00BA32`, low/weak = `#EC8D00`, dead = `#CDCDCD`, error/warning = `#CC0C00`.
- **No gradients** in UI chrome (gradients only appear in the spectrogram heatmap). Avoid the default "purple-blue SaaS gradient" entirely.

### Type
- **Roboto** (Regular 400 / Medium 500 / Bold 700) for all body, labels, buttons, headers.
- **Obvia Regular** for numeric readouts (digital clock, patient age, numpad digits). *Substitution flagged:* Obvia is a paid foundry face (Latinotype). We currently substitute **DM Sans** — please drop `obvia_regular.ttf` into `fonts/` when available and swap the `@font-face` in `colors_and_type.css`.
- Android layouts declare sizes in "layout pixels" at 1920×1200 — things like `34px`, `60px`. Those translate to ~24–40 px on a 16" display. The scale in `colors_and_type.css` uses modern web-friendly values; keep it generous.

### Spacing & layout
- 4-px base grid. Real layouts use a lot of 10-px multiples (`40px`, `80px`, `120px`, `465px`).
- Screens are **fixed-width landscape** (1920-px canvas). Everything is absolutely positioned / constraint-laid-out — no fluid reflow on the actual device. For web mockups, keep the fixed aspect and scale to fit.
- **Status bar: 100 px (~60 px web), full width, dark slate.** Contains charge icon, date, clock, firmware version, sensor-battery strip, patient age.
- **Content header band: 88 px (~56 px), light grey.** Section/screen title + meta.
- **Main content: black canvases for waveforms, white panels for controls.**

### Backgrounds
- No photography. No illustration. No hand-drawn anything. No repeating patterns.
- Solid fills only. The only "texture" in the entire app is the **spectrogram heatmap** and the **waveform trace itself** — both data, not decoration.
- Where the app uses imagery, it's the **logo** (on the Start Case splash), full stop.

### Borders & dividers
- 1-px solid borders in `#CCCCCC` (disabled) or `#707070` (active). `border_gray.xml` uses a 1px stroke with `#B0B0B0`.
- Dividers are 1-px `#F2F2F2` lines — very quiet.
- Dialogs get a subtle rounded rectangle (`dialog_bg.xml`).

### Corner radii
- Mostly **zero radius**. The Start Case button uses a ~3 px corner (barely rounded rectangle — see `btn_start_case.xml` path data with `2.679` radius). Dialogs use ~8 px. Keyboard buttons are pure rectangles.
- **No pills, no fully-rounded chips.** If you need a pill shape, reconsider — it's off-brand.

### Shadows
- Mostly flat. Material `elevation="10dp"` on the Start Case overlay gives a soft drop shadow — translated as `var(--shadow-lg)` in CSS.
- Buttons have no shadow; state is shown by fill color only (disabled grey → enabled orange → pressed light grey).
- No inner shadows, no glows.

### Animation / motion
- Extremely minimal. System `exitFadeDuration="@android:integer/config_shortAnimTime"` (~200 ms) on pressed-state transitions. A short fade is it.
- **No bounces, no springs, no confetti, no loaders with mascots.** Progress is an indeterminate Android spinner or the literal text `"… "`.
- When building web equivalents, use `var(--dur-base)` + `var(--ease-std)` for any state transition. Err on the side of "no animation."

### Hover / press / disabled states
- **Hover** (not a phone app concept — tablet is touch-first — but for web recreations): darken the fill by ~8 % or swap background to `#F8F8F8`.
- **Pressed:** *lighten* to a pale grey/white (`keyboard_button_bg.xml` goes from transparent → `#FFFFFF` on press; `btn_start_case.xml` goes orange → `#E2E2E2` on press). This is unusual — most systems darken on press. Pascall's convention is "lift" / "flash" on touch.
- **Disabled:** `#B4B4B4` fill (time buttons) or `#C3C3C3` (Start Case disabled). Text becomes mid-grey.
- **Focus rings:** none in the Android source. For web, use a 2 px `--pascall-primary` ring for accessibility.

### Transparency & blur
- Almost none. `colorClear` (`#00000000`) is used for transparent backgrounds on specific overlays but nothing is blurred. No glassmorphism.

### Cards
- Thin 1-px border, no shadow, 0–8 px radius, white fill. They're information containers, not visual objects. Use `border: 1px solid var(--border-default); background: var(--bg-surface); border-radius: var(--radius-md);`.

### Layout rules
- Status bar is **fixed top**, 100 px. Header below it. Content fills the rest.
- Buttons are **large** — 100 px tall is common — this is a gloved-hand tablet in an OR. Minimum touch target: 88 × 88 px.
- Data readouts (battery %, patient age, clock) are **right-aligned within their zones** and use tabular-num digits.

### Imagery color vibe
- No imagery to speak of. The closest thing is the logo mark on the splash. If adding imagery (marketing, decks), keep it **clinical / editorial** — cool light, desaturated, no grain, no warm Instagram filter.

---

## ICONOGRAPHY

The M0 app ships a small set of **hand-built vector XML drawables** — icons are drawn as Android `VectorDrawable` paths, not pulled from an icon font. There is no Material Icons / Lucide / Heroicons dependency in the res/ tree.

Icons found:
- `ic_battery.xml` — small battery outline (used for sensor + device battery)
- `ic_big_connection_bar.xml`, `ic_connection_bar.xml` — signal-strength bars (large + small)
- `ic_no_signal.xml` — "no signal" glyph
- `ic_radio_button.xml`, `ic_checked_radio_button.xml` — custom radio
- `ic_launcher_*` — app launcher (adaptive icon background + foreground)
- `ic_dropdow_arrow.png` — the one raster icon (PNG), used in dropdowns

### Usage rules
- **Stroke style:** 1–2 px flat stroke, square caps, no rounded joins. Monochrome — icons are almost always drawn in current text color (black on light, white on slate status bar).
- **No filled / duotone / gradient icon styles.** No "3D" icons.
- **No emoji anywhere in UI copy.** Not a single `🎉` `🚀` `✅`. Do not introduce them.
- **No unicode-char icons** (no `→`, `✓` in place of a proper glyph) — the app either uses a real vector icon or omits the visual.
- **Signal-strength indicators** come from per-state drawables (`signal_strength_indicator_strong.xml`, `_nomal.xml` [sic], `_weak.xml`, `_nosignal.xml`) — coloured bars, not icons.

### Substitution
Since the app's icon set is small and tightly purpose-built, **do not pull in Lucide / Heroicons / Material Icons wholesale** — it will feel off. For new surfaces:
1. First try to reuse one of the existing drawables in `assets/icons/` (copied from the repo).
2. If a new icon is needed, draw it in the same hairline-stroke, square-cap, monochrome style. Keep it utilitarian.
3. For *web* demos / marketing where you truly need a generic icon, **Lucide** is the closest visual match (thin stroke, minimal). Flag the substitution.

See `assets/icons/` for the full set pulled in.

---

## Caveats & open questions

- **No brand book, Figma, or logo files** were provided. The "logo" referenced in `screen_start_case.xml` as `@drawable/logo` was not in the inspected paths — we've drawn a **text-only placeholder wordmark** in `assets/logo-wordmark.svg`. Please send the official logo asset.
- **Obvia font file is missing.** We substitute DM Sans. Please send `obvia_regular.ttf`.
- The app is **Android-only, landscape-fixed, 1920×1200**. Web/responsive guidance is extrapolated — validate before shipping a web product.
- Marketing voice is *not* derived from a marketing site; the CONTENT FUNDAMENTALS section describes the **in-product** voice only. Marketing copy will likely need to be warmer and more narrative — that's a separate conversation.
