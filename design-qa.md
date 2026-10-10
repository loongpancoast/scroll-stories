# design-qa.md — scroll-stories clean rebuild (screenshot-to-code, no scroll animation)

**Method:** `visual-to-code` skill (upstream: OpenAI `image-to-code`, openai/plugins on GitHub),
adapted per `~/workspace/skills/visual-to-code/SKILL.md`. Static 1:1 rebuilds — all GSAP/canvas
scroll-scrub machinery removed at Loong's direction ("forget the scroll animations, start again cleanly").

## Comparison 1 — roadmap.html vs Zajno "Space Pollution" (shot 25914349)

- Source visual truth: `~/workspace/media-kit-2026-10-09/dribbble-refs/3-zajno.png` (3200×2400)
- Implementation: `/tmp/q2-road.png` (1440×900 @1x), `/tmp/q2-road390.png` (390×844 @1x)
- State: default (hero viewport, no interaction)
- Density: both captures at deviceScaleFactor 1; source inspected at native pixels, no density mismatch filed.

**Full-view evidence:** HUD (left 2-line mono / center letterspaced wordmark / right CTA link),
full-bleed cinematic visual, giant bottom-bleed display type, orbit icon + "SCREENING: ACTIVE"
bottom-left, "ALL SYSTEMS: ACTIVE" bottom-right. All five required fidelity surfaces checked:
typography (Inter Tight 900 + Space Mono, matched weights), spacing (HUD padding, bottom-bleed
offset -0.17em), colors (#000 ground, white type), image quality (real aerial still, 16:9→full-bleed
cover), copy (briefing lede, 3 act chapters, finale CTA).

**Findings (iteration 1):**
- [P1] Giant "THE ROADMAP" overflowed viewport width at 11.5vw (clipped "P").
  Fix: 9.8vw desktop / 12vw mobile. Verified in `/tmp/q2-road.png` — full word visible, edge-to-edge bleed.
- [P2] Lede paragraph touched the giant type. Fix: lede bottom 21% → 27%.
  Verified clear in re-capture.
- [P2] Mobile giant clipped ("THE ROADMA"). Fix: 15.5vw → 12vw + tighter tracking.
- [P3] HUD right link wraps to two lines on 390px — acceptable, logged as follow-up.

**Focused regions:** not separately captured — all fidelity-critical elements (HUD type, giant
type fit, corner labels) are legible at full-view scale; no sub-pixel detail disputes.

## Comparison 2 — swing.html vs Nixtio F1 Driver Profile

- Source visual truth: `~/workspace/media-kit-2026-10-09/dribbble-refs/4-nixtio-f1.jpg`
- Implementation: `/tmp/q2-swing.png` (1440×900 @1x), `/tmp/q2-swing390.png` (390×844 @1x)
- State: default hero viewport.

**Full-view evidence:** nav (SC•29 / center links / pill CTA + burger), left label+display+paragraph
block, full-bleed night-range image, outlined "01" watermark, right swing-path stat rail,
bottom strip. Mark cards section below with static telestrator SVG marks on real frames.

**Findings (iteration 1):**
- [P1] Hero telestrator SVG marks were oversized scribbles spanning the viewport, not coach markup.
  Fix: redrew as one red circle + pointer on the hands + yellow dashed shoulder line, positioned
  on the golfer's body in viewBox units. Verified in `/tmp/q2-swing.png`.
- [P2] "01" watermark collided with the stat rail label. Fix: moved to right 9% / top 3%.
- [P3] Mobile hides hero marks SVG (simplification) — acceptable, logged as follow-up.

**Focused regions:** not separately captured — marks and rail legible at full view.

## Comparison 3 — audit.html vs Clipzo Spatial Storytelling

- Source visual truth: `~/workspace/media-kit-2026-10-09/dribbble-refs/5-clipzo.png` (3200×2400)
- Implementation: `/tmp/q-audit1440.png` (1440×900 @1x), `/tmp/q2-audit390.png` (390×844 @1x)
- State: default hero viewport.

**Full-view evidence:** corner-bracket viewfinder, "GOLF FITNESS AUDIT" top-right, globe
bottom-left, timeline ruler bottom-center, filmstrip + editorial row, bracket CTA. Passed with
no P0/P1/P2 findings on first capture.

## Required fidelity surfaces (all three pages)

- Fonts/typography: Inter Tight (800/900 display, letterspacing per ref) + Space Mono micro-labels. Pass.
- Spacing/layout rhythm: section order, proportions, and alignment match references. Pass.
- Colors/tokens: pure-black grounds, white type, F1 red `#E10600` / yellow `#FFD200` accents. Pass.
- Image quality: real stills extracted from the project's own film frames (no AI, no placeholders);
  `public/stills/` (9 files, ~300KB). SOURCES: frames of the project's own footage. Pass.
- Copy/content: pain-point marketing copy; zero invented testimonials/statistics; no credential
  claims stated (standing rule). Pass.

## Console errors

None — pages are static HTML/CSS, zero JS. (Only third-party note: Google Fonts requires network;
renders with system fallback offline.)

## Comparison history

- Pass 1 (roadmap/swing/audit @1440 + @390): 2× P1, 3× P2 filed (giant-type overflow ×2,
  lede/type collision, hero marks redraw, watermark/rail collision).
- Fixes applied, rebuilt, re-captured: all P0/P1/P2 resolved and visually verified.

**final result: passed**
