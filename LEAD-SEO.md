# Lead and SEO deployment

After editing `index.html`, run `python scripts/build-service-pages.py` to regenerate `kitchen-remodeling/index.html` and `bathroom-remodeling/index.html`, the sitemap, and organization/service metadata. The pages use real project content and existing contact handling. They intentionally omit unrelated visible project cards and use service-relevant project photos in their hero.

Deploy the tracked files through GitHub and a fast-forward pull in `/var/www/vad/public_html`. No build or Apache restart is required for these static pages.

Inquiry messages now include the website and entry path plus any tagged campaign or Google click ID. Session storage retains the campaign while navigating to another service page; unavailable storage does not block the form. This context does not enter Analytics events. The contact form exposes a visible retry/call fallback for failed HTTP requests.

The SEO metadata avoids invented addresses, opening hours, rating totals, and rich-result promises. Service pages have unique canonical URLs and are linked from the homepage. Search Console submission and existing Google Business Profile review remain separate tasks.
