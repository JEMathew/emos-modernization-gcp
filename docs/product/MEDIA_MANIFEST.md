# EMOS landing-media manifest

## Beta v2 Workstream 1 — landing media performance

This manifest records only the real EMOS public-sandbox capture used on the landing page. It does not represent generated product UI and does not change the capability scope of the product.

### Source and provenance

- Source production commit: `ed9afe275b918e613c770afb127c56febf9cc03d`.
- Source Cloud Run revision: `gemini-reflection-journal-media-ed9afe2`, which was serving 100% of traffic when this workstream began.
- Recorded cloud rollback: `gemini-reflection-journal-cache-b7915d4` (Ready and retained).
- Capture provenance: the original PNG and MP4 were assembled in Higgsedit from the live public EMOS evaluation sandbox using synthetic enterprise data. This workstream applies deterministic compression only; it does not generate, alter, add, or remove product-screen content.
- Optimizer: FFmpeg 6.0 / libx264 for the loop, preserving 1920×1080, 30 fps, 16.000 seconds, silent H.264 video and `faststart`; Sharp WebP encoder (quality 84, effort 6) for the poster.

### Baseline measured on production

| Asset / behavior | Baseline | Finding |
| --- | --- | --- |
| `emos-product-hero-production-v2.png` | 321,630 bytes; 1920×1080; SHA-256 `7fd912ddc82651684e3f9d485a7c805433d9b64c07a20880fdeadca12831e1a6` | Real capture used as first visual and retained for rollback/evidence |
| `emos-product-demo-v2.mp4` | 15,333,676 bytes; H.264; 1920×1080; 30 fps; 16.000 seconds; silent; SHA-256 `ea048e4369f792481447543aae410b09568a9df4e2c0cfc458e99bf3558bfbb7` | 7.67 Mbps transfer; too large for a decorative landing loop |
| Initial render | Poster and autoplaying video were both in the first rendered hero | `preload="none"` reduced eager buffering but the autoplay element was eligible before primary content usability and had no connection/preference gate |
| Desktop / tablet / mobile | Same auto-playing media treatment | No small-screen or constrained-network default to the static capture |

### Versioned optimized assets

| Role | Source | New versioned asset | Technical record | Accessibility and rollback |
| --- | --- | --- | --- | --- |
| Landing poster | `emos-product-hero-production-v2.png` | `emos-product-hero-production-v2-performance.webp` | 1920×1080; 70,132 bytes; SHA-256 `2a05f3d6d47f7712b3d12f9bcea866a6527be4ea0f567a7c7ac1b41597a37b9f` | `<picture>` supplies the retained PNG as browser fallback; original PNG remains the rollback/evidence source |
| Silent landing loop | `emos-product-demo-v2.mp4` | `emos-product-demo-v2-performance.mp4` | H.264 High, 1920×1080, 30 fps, 16.000 seconds, silent, 1,985,917 bytes, ~993 kbps; SHA-256 `7ec315f7fda794da6114386fa8da461fe2f2b0241e51ff7b7a44c764078bace4` | Original v2 MP4 is retained as the rollback/evidence source; the longer narrated product demo remains future scope |

### Runtime treatment

- The poster always renders first at the hero's intrinsic 16:9 dimensions.
- The video element is absent until 800 ms after first render, and only on an unconstrained desktop/tablet that has not requested reduced motion.
- Reduced-motion users receive only the static poster. Data Saver, `2g`, and `slow-2g` users receive the poster until they explicitly choose playback. Smaller mobile layouts also default to the poster until the user requests playback.
- The loop uses `preload="metadata"` only after it is requested/deferred, is muted and silent, pauses outside the viewport, and has a visible keyboard-accessible Play/Pause control.
- The poster remains beneath the loop until media is ready; any video error removes the loop and leaves the capture visible. The synthetic-data disclosure remains in the accessible caption.

### Immutable media and scope safeguards

The approved v1 assets remain unchanged:

- `emos-landing-hero-v1.png` — `e05e206dca5ffb5a6231f4931329f4997c42bca6f5478dcdabd474d8dc0ba08f`
- `emos-hero-animation-v1.mp4` — `5e3886be464442fb4714912205ce19a23913afdfa9a47105c9bde065b39ca8a3`
- `emos-command-center-dashboard-v1.png` — `555fee90bf4b4dd7d6b0c83f9e326c19292eee7ad0439af878d36550cb24061d`
- `emos-enterprise-dna-v1.png` — `68329cbcd2e52498a65585cfc4bd3f47348e912586d757903a43e1ff16b45fff`

Production candidate and promotion evidence are appended to this manifest after the release gate completes.
