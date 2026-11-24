# Landing-page measurement and form contract

GA4: `G-3ZWY4ES6FR`. Google Ads: `AW-16582460982`. Existing successful-form conversion: `AW-16582460982/cr4VCNeZ2bMZELaMkeM9`.

## Events

| Event | Trigger | Routing |
| --- | --- | --- |
| `generate_lead` | Existing Lambda endpoint returns a successful non-opaque HTTP response; once per accepted form | GA4, plus the existing native Ads form conversion |
| `click_to_call` | Any `tel:` link click, including dynamically inserted thank-you links and chat shadow-root links | GA4; native Ads conversion only when a verified destination is configured |
| `click_to_text` | Any `sms:` link click, including chat shadow-root links | GA4; native Ads conversion only when a verified destination is configured |
| `estimate_start` | First edit of each form, excluding its `website` honeypot | GA4 diagnostic |
| `estimate_submit_attempt` | Valid request starts | GA4 diagnostic; never a conversion |
| `estimate_error` | HTTP error, network failure, or timeout | GA4 diagnostic; never a conversion |
| `estimate_click` | Link to the hero or bottom estimate form | GA4 diagnostic |
| `section_view`, `section_engagement`, `project_category_click` | Existing visibility/engagement/gallery interactions | Existing GA4 diagnostics retained |

`service_type` distinguishes kitchen, bathroom, and general/home. `form_id` distinguishes `heroEstimateForm` and `contactForm`. Contact clicks include CTA placement. No names, emails, phone values, ZIPs, messages, gclid, or UTM values are added to these custom event parameters. Google tags may independently process advertising and browser identifiers.

Opening or refreshing the thank-you URL, clicking Submit, failing validation, filling the honeypot, or receiving an unsuccessful response never creates a lead conversion. Pending/completed forms reject duplicate submissions. A 20-second network timeout restores the submit button and shows direct contact options. Navigation is not dependent on an analytics callback: success replaces the form in place.

## Contact conversion destinations: release blocker

`js/contact-conversions.js` deliberately contains null destinations until the distinct call and text conversion snippets can be verified. The existing form label is known and used. Separate call/text labels were not present in the repository or saved account audit; the current Brave Ads page did not load sufficiently to verify them. Do not reuse the form label for contact clicks or fabricate labels. GA4 contact events are implemented and browser-tested. Configure the verified `AW-.../label` strings before marking native Ads contact tracking complete.

Keep click actions distinct from confirmed leads: a click does not establish a connected call or sent text. Avoid importing the same GA4 `generate_lead` as another Primary Ads action alongside the existing native form conversion.

## Form payload and attribution

`js/lead-context.js` stores bounded campaign fields in tab session storage and populates hidden inputs in every estimate form: `gclid`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, plus existing `utm_content`, `gbraid`, and `wbraid` support. Values persist across same-origin page navigation; blocked storage falls back to memory.

`js/estimate-forms.js` sends JSON to the existing Lambda URL with the existing name/phone/email/message fields, plus `source=vad`, `service`, `form_id`, `zip`, empty `website`, and captured campaign fields. ZIP and a readable campaign summary are also included in `message` so existing email formatting can retain the context even if it ignores unknown top-level fields. Email is optional and sent as an empty string when omitted.

A clearly marked QA request with blank email, ZIP, and campaign fields returned HTTP 200 on November 23, 2026. No advertising events were sent for that direct endpoint test. This verifies request acceptance, not receipt of the notification email; the owner should confirm the labeled test arrived with ZIP and attribution intact. Backend implementation is not in this repository.

Each form retains a hidden `website` honeypot excluded from accessibility/keyboard navigation. Nonempty values, including whitespace, show success without network requests or conversion events. This remains a browser-side filter; server-side enforcement has not been verified.

## Checks

Run `node js/analytics.test.cjs`. Run `scripts/conversion-qa.cjs` against a local HTTP preview with Playwright available (`VAD_PLAYWRIGHT_MODULE`, `VAD_BROWSER_PATH`, optional `VAD_QA_URL` and `VAD_QA_OUTPUT`). It intercepts all inquiry requests and measurement SDKs: five forms, all required attribution, success-only events, validation, duplicates, retries, honeypots, contact clicks including the chat shadow tree, schema/FAQ sync, and layouts at 375/768/1280px.

Account-side verification in GA4 DebugView / Tag Assistant remains required after deployment and destination configuration. Browser queue assertions are not a substitute for confirming account receipt. During production verification, do not submit fabricated advertising conversions merely to test a tag; use the tool's diagnostic flow and a genuine authorized lead for final success verification.
