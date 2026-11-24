# Kitchen / bathroom conversion improvements — November 23, 2026

This is a review branch, not a production deployment. The original local checkout and production document root have existing uncommitted edits; they were preserved. Changes were made in an isolated worktree on `codex/vad-ad-conversion-20261123`.

## Implemented

- Separate short hero and bottom forms on both landing pages; required name/US phone/5-digit ZIP, optional email and project description. Pending submissions lock; failures allow retry; accepted responses replace the form in place. Existing honeypot and Lambda destination retained.
- Hidden gclid/UTM inputs and matching submission fields; ZIP and attribution also included in the existing message field. One labeled backend test with an empty email returned HTTP 200. Owner confirmation of notification delivery/content remains outstanding.
- Existing native Google Ads successful-form conversion and GA4 `generate_lead` fire only after HTTP success. GA4 `click_to_call` / `click_to_text` cover ordinary and chat shadow-root links. No form-value parameters are added to analytics.
- Confirmed new phone in public VAD source, contact links, privacy pages, chat contact link, and schema. Touch contact buttons use `pointer: coarse`; desktop shows a tel link. Three equal mobile tap targets are at least 44px high.
- Landing navigation trimmed to logo/phone/estimate; footer trimmed to Privacy; repeated contact/estimate actions after gallery and reviews. Cross-service exit removed.
- Confirmed insurance/warranty/response/review-count strip. No insurance document or policy number published. No business licensing claim added.
- Eight gallery photos per page with real dimensions, descriptive alt text, lazy loading, and captions from verified project data. Mint Hill kitchen and Salisbury/Charlotte bathroom captions use existing portfolio evidence. Unknown cities are omitted. No verified before/after pair exists among the available assets; no unrelated images were presented as a pair.
- Responsive 640/960px WebP hero copies; no new production libraries. Existing fonts/colors retained. Mobile copy and form flow shortened.
- Four kitchen review excerpts and two bathroom excerpts, all verbatim with verified stars, first name/last initial, project type, and Thumbtack source link. Longer source reviews were favored; excerpts are explicitly identified and truncated. Two more verified bathroom reviews are still needed to reach the requested minimum of four. Review text is never rewritten or invented.
- Hidden owner-data templates for incomplete pricing/timing/ratings/years/differentiators; no visible TODO text. Populating the business-detail JSON automatically updates relevant FAQ answers and matching FAQPage schema on rebuild.
- Home backsplash link now opens Queen City Backsplash in a new tab with `rel="noopener"` — owner confirmation requested. Broken Terms of Use link removed.

## Outstanding owner / account items

1. Verify distinct native Ads call/text conversion destinations in `js/contact-conversions.js`. Saved source/audit contains only the form label; do not reuse it for click actions. GA4 click events are implemented; native Ads contact conversions remain intentionally disabled until verified destinations are available.
2. Run account-side Tag Assistant / GA4 DebugView after deployment. Local queue assertions do not establish account receipt.
3. Supply two more bathroom/shower/tile Thumbtack reviews, with exact text, first name/last initial, stars, project type, and source link. Additional full-length text can also replace current excerpts when supplied by the owner.
4. Fill approved business details: Google rating/count, years, written-quote turnaround, kitchen/bathroom price ranges and timelines, and differentiators. All unresolved content remains hidden.
5. Confirm the labeled backend QA inquiry arrived with ZIP and attribution, and confirm the QCB new-tab home link.
6. Before deployment, reconcile the pre-existing local/server edits and update VAD's approved contact facts in the separate shared chat backend. The browser's chat contact link is updated here; that backend is maintained in the separate QCB project and has its own pending edits. Do not overwrite it with the older server source.

## QA

| Check | Result |
| --- | --- |
| Five forms: hero/bottom for both services plus home | Passed with intercepted success/failure responses |
| ZIP, gclid, requested UTMs in hidden fields and JSON | Passed |
| Blank email accepted by real backend | HTTP 200, one explicitly labeled QA request; email delivery not independently confirmed |
| Success-only form conversion; no pending/failed/honeypot conversions | Passed in browser and unit tests |
| Duplicate submit prevention and retry after error | Passed |
| Phone/ZIP inline validation and optional email | Passed |
| GA4 contact clicks, including chat shadow tree | Passed browser queue tests |
| Native Ads contact conversion destinations | Blocked pending verified call/text labels |
| Tag Assistant / GA4 DebugView receipt | Not verified in account |
| Pointer-coarse Call/Text versus desktop tel link | Passed |
| Layouts at 375 / 768 / 1280px; no horizontal overflow | Passed |
| Three equal touch targets, minimum 44px | Passed |
| No old phone in public VAD source; no visible TODOs | Passed |
| No insurance-certificate link; no business licensed claim | Passed |
| Gallery count, alt/dimensions/lazy loading, FAQ/schema sync | Passed |
| Review attribution, excerpts and stars | Verified against public Thumbtack page HTML/structured data; only two bathroom reviews available |

Lighthouse mobile comparison is recorded in `reports/conversion-qa-2026-11-23.json`. Measurements use a local static server, simulated mobile throttling, and blocked Google measurement SDK requests to avoid sending QA traffic. They do not measure production hosting latency or live third-party tags. Review the exact reported scores rather than treating a local run as a production guarantee.

## Rebuild and test

`python scripts/build-service-pages.py` regenerates both pages from `assets/landing-content.json`, `assets/landing-business-details.json`, `assets/landing-reviews.json`, and the photo manifests. Styles are embedded from `css/service-pages.css` for the landing-page critical render path. Regenerate after changing that stylesheet. `node js/analytics.test.cjs` checks event routing; the Playwright script and environment variables are documented in `ANALYTICS.md`.

## Final measured scores

| Page | Baseline performance / accessibility (median of 3) | Final performance / accessibility (1 run) |
| --- | --- | --- |
| kitchen | 100 / 100 | 100 / 100 |
| bathroom | 100 / 100 | 100 / 100 |

## Unresolved TODO markers

- `[[TODO: BATH_PRICE_RANGE]]`
- `[[TODO: BATH_TIMELINE]]`
- `[[TODO: DIFFERENTIATORS]]`
- `[[TODO: GOOGLE_RATING]]`
- `[[TODO: GOOGLE_REVIEW_COUNT]]`
- `[[TODO: KITCHEN_PRICE_RANGE]]`
- `[[TODO: KITCHEN_TIMELINE]]`
- `[[TODO: QUOTE_TURNAROUND]]`
- `[[TODO: TWO_ADDITIONAL_VERIFIED_BATHROOM_REVIEWS]]`
- `[[TODO: VERIFIED_ADS_CALL_DESTINATION]]`
- `[[TODO: VERIFIED_ADS_TEXT_DESTINATION]]`
- `[[TODO: YEARS]]`

## Changed files

- `.gitignore`
- `ANALYTICS.md`
- `CONVERSION-RELEASE.md`
- `assets/img/portfolio/bathroom-marble-shower-640.webp`
- `assets/img/portfolio/bathroom-marble-shower-960.webp`
- `assets/img/portfolio/kitchen-blue-cabinets-640.webp`
- `assets/img/portfolio/kitchen-blue-cabinets-960.webp`
- `assets/landing-business-details.json`
- `assets/landing-content.json`
- `assets/landing-reviews.json`
- `assets/service-image-metadata.json`
- `bathroom-remodeling/index.html`
- `chat-privacy.html`
- `css/conversion-components.css`
- `css/service-pages.css`
- `index.html`
- `js/analytics.js`
- `js/analytics.test.cjs`
- `js/contact-conversions.js`
- `js/estimate-forms.js`
- `js/lead-context.js`
- `js/project-chat.js`
- `kitchen-remodeling/index.html`
- `privacy.html`
- `quote-thank-you/index.html`
- `reports/conversion-qa-2026-11-23.json`
- `scripts/build-service-pages.py`
- `scripts/conversion-qa.cjs`
