# Lead and SEO deployment

After editing `index.html`, run `python scripts/build-service-pages.py` to regenerate `kitchen-remodeling/index.html` and `bathroom-remodeling/index.html`, the sitemap, and organization/service metadata. The pages use real project content and existing contact handling. They intentionally omit unrelated visible project cards and use service-relevant project photos in their hero.

Deploy the tracked files through GitHub and a fast-forward pull in `/var/www/vad/public_html`. No build or Apache restart is required for these static pages.

Inquiry messages now include the website and entry path plus any tagged campaign or Google click ID. Session storage retains the campaign while navigating to another service page; unavailable storage does not block the form. This context does not enter Analytics events. The contact form exposes a visible retry/call fallback for failed HTTP requests.

The SEO metadata avoids invented addresses, opening hours, rating totals, and rich-result promises. Service pages have unique canonical URLs and are linked from the homepage. Search Console submission and existing Google Business Profile review remain separate tasks.

## Portfolio page

The portfolio is `assets.html`; `/assets/` is also the site's static-asset directory. Production Apache virtual hosts redirect only the exact `/assets` and `/assets/` URLs to `/assets.html` with `RedirectMatch 302 ^/assets/?$ /assets.html`. Keep nested asset URLs unchanged.

Live portfolio quotes use Gold API's public XAU/XAG endpoints. History uses World Bank Pink Sheet monthly averages via `/portfolio-data/metals-history.json` (runtime output excluded from Git). Run `python3 scripts/refresh-metals-history.py` after checkout to create or update it. Production `/etc/cron.d/vad-metals-history` runs this daily at 07:15 UTC; failed or regressing downloads preserve the last good file. The World Bank publishes monthly, so charts show 6 months, 1 year, 5 years, and 10 years through the latest available month. The source URL is in the script; update it if World Bank changes its publication path. Live quotes and monthly averages use different providers and are labeled separately.

## Kitchen and bathroom campaign pages — October 29, 2026

The service-page builder now generates distinct, lightweight landing pages from dedicated service content. It reuses the homepage's successful-submission handler. Run it with the bundled Python runtime after changing service copy or the homepage form handler. It no longer rewrites the homepage, robots.txt, or sitemap.

Selected project photos were downloaded from the owner's Google Photos library and optimized to WebP without EXIF metadata. The kitchen page uses blue-gray cabinetry with a white subway backsplash; the bathroom page uses the marble-pattern shower and freestanding tub. They are supplemented by the existing kitchen/bathroom portfolio images.

GA4 remains G-3ZWY4ES6FR. The page path determines `service_type` (kitchen, bathroom, general), and `content_group` identifies the page family. Successful backend responses emit `generate_lead`; attempts emit `estimate_submit_attempt`; errors emit `estimate_error`. `phone_click` and `sms_click` represent link clicks, not completed calls or qualified leads. Form contents are never custom Analytics event parameters. In GA4, register service_type as an event-scoped custom dimension for reporting if not already present. Use generate_lead as the lead key event; keep imported GA4 equivalents secondary in Ads when the direct Ads form action is primary.

The primary Ads action and enhanced-conversion diagnostics must be verified in the account. Publishing website code does not establish that diagnostics have cleared or that enhanced customer-data collection is configured. No new collection of email or phone data by measurement tags was added in this change.

### October 29: expanded galleries and quote confirmation
- Kitchen gallery now has five photos; bathroom has four. Added two owner Google Photos images and reused three previously verified Google/Thumbtack project photos; provenance in assets/service-photo-sources.json.
- All main/service quote forms redirect to /quote-thank-you/?service=kitchen|bathroom|general only after a successful backend response. Conversion events still fire once at confirmed submission; thank-you page views are not a separate conversion.
- Redirect waits for the GA4 callback with a 1.5-second fallback, including when the Google tag is blocked. The noindex confirmation page contains no client details.
- GA4 uses shared event names with event-scoped service_type and content_group. The confirmation page preserves the service through a validated, non-personal query parameter.
- Keep GA4 imported lead actions secondary in Ads to avoid counting the direct Ads lead and its GA4 import as separate primary leads. Do not add an unconditional thank-you URL conversion on top of the existing success event.
