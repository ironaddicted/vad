"""Regenerate the static service pages after editing the shared homepage."""
from pathlib import Path
from html.parser import HTMLParser
import html, json, re

root = Path(__file__).resolve().parents[1]
source = (root / 'index.html').read_text(encoding='utf-8')
source = re.sub(r'<script type="application/ld\+json">.*?</script>\s*', '', source, flags=re.S)

class Cards(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.text = text; self.depth = 0; self.active = None; self.cards = []
        self.offsets = [0]
        for line in text.splitlines(keepends=True): self.offsets.append(self.offsets[-1] + len(line))
    def position_offset(self):
        line, col = self.getpos(); return self.offsets[line - 1] + col
    def handle_starttag(self, tag, attrs):
        if tag != 'div': return
        self.depth += 1
        data = dict(attrs)
        if 'project-column' in data.get('class', '').split():
            self.active = (self.position_offset(), self.depth, data.get('data-category', '').split())
    def handle_endtag(self, tag):
        if tag != 'div': return
        if self.active and self.depth == self.active[1]:
            self.cards.append((self.active[0], self.position_offset() + len('</div>'), self.active[2])); self.active = None
        self.depth -= 1

parser = Cards(source); parser.feed(source)
services = [
    ('kitchen-remodeling', 'kitchen', 'Kitchen Remodeling in Charlotte, NC',
     'Kitchen renovations, cabinet updates, backsplash installation, and flooring by VAD Constructions. See real local projects and request a free estimate.',
     'A kitchen update built around the way you live.',
     'Refresh your existing kitchen with cabinet updates, flooring, a tile backsplash, and finishing details. We start with your priorities and the condition of the space, then discuss a scope that fits your home.',
     'Kitchen Refresh · Mint Hill', 'Reconditioned cabinets, LVP flooring, and a subway tile backsplash gave this existing kitchen a fresh start.'),
    ('bathroom-remodeling', 'bathroom', 'Bathroom & Shower Remodeling in Charlotte, NC',
     'Bathroom renovation and custom shower remodeling in Charlotte by VAD Constructions. Explore real tile, shower, and vanity projects and request a free estimate.',
     'Make your bathroom work better every day.',
     'Plan a bathroom renovation, custom shower, tile update, or vanity replacement with VAD Constructions. We discuss layout, materials, wall and floor condition, and the work needed before preparing your estimate.',
     'Historic Home Bathroom · Charlotte', 'A new shower, vanity, tile flooring, and improved ventilation gave an older bathroom a fresh chapter.'),
]

def metadata(text, url, name, service=None):
    schema = {'@context': 'https://schema.org', '@type': 'Organization', '@id': 'https://vadconstructions.com/#organization', 'name': 'VAD Constructions', 'url': 'https://vadconstructions.com/', 'telephone': '+17047509110'}
    if service:
        schema = {'@context':'https://schema.org','@type':'Service','name':name,'serviceType':service,'areaServed':{'@type':'City','name':'Charlotte'},'provider':schema}
    return text.replace('</head>', '<script type="application/ld+json">' + json.dumps(schema) + '</script>\n</head>')

# The homepage metadata is generated separately to avoid duplicate schemas on regeneration.
source = re.sub(r'<script type="application/ld\+json">.*?</script>\s*', '', source, flags=re.S)
for slug, category, title, description, subheading, intro, project, project_copy in services:
    page = source
    for start, end, categories in reversed(parser.cards):
        if category not in categories: page = page[:start] + page[end:]
    page = re.sub(r'<title>.*?</title>', '<title>' + html.escape(title) + ' | VAD Constructions</title>', page)
    page = re.sub(r'<meta name="description"[^>]*>', '<meta name="description" content="' + html.escape(description, quote=True) + '" />', page)
    page = page.replace('https://vadconstructions.com/" />', f'https://vadconstructions.com/{slug}/" />', 1)
    page = re.sub(r'<div class="masthead-subheading">.*?</div>', '<div class="masthead-subheading">' + subheading + '</div>', page)
    page = re.sub(r'<h1 class="masthead-heading">.*?</h1>', '<h1 class="masthead-heading">' + html.escape(title) + '</h1>', page)
    page = re.sub(r'<p class="masthead-description">.*?</p>', '<p class="masthead-description">' + intro + '</p>', page)
    section = f'''<section class="page-section" id="services"><div class="container"><h2>Plan your {category} renovation</h2><div class="row g-4"><div class="col-md-7"><p>{intro}</p><h3>What shapes the price?</h3><p>Project size, material choices, the condition of existing surfaces, and any changes to the layout affect the estimate. Photos and a conversation help us identify the right next step. We confirm the scope before quoting; no measurements are needed for your first inquiry.</p></div><div class="col-md-5"><h3>{project}</h3><p>{project_copy}</p><a href="#portfolio">Explore the project photos below</a></div></div><a class="btn btn-primary mt-3" href="#contact">Request a {category} estimate</a></div></section>'''
    page = re.sub(r'<section class="page-section" id="services">.*?</section>', section, page, flags=re.S)
    page = page.replace('Beautiful surfaces. Real homes.', 'Real ' + category + ' projects')
    page = page.replace('Explore our kitchens, bathrooms, backsplash, and flooring projects. Open any project for a closer look.', 'Explore completed ' + category + ' work by VAD Constructions. Open a project for details and photos.')
    page = re.sub(r'<div class="gallery-filters".*?</div>', '', page, flags=re.S)
    page = page.replace('placeholder="Project details (optional):', 'placeholder="' + category.capitalize() + ' project (optional):')
    page = re.sub(r'((?:src|href)=["\'])(assets/|css/|js/)', r'\1/\2', page)
    page = page.replace('href="#page-top"', 'href="/"')
    page = metadata(page, f'https://vadconstructions.com/{slug}/', title, category + ' remodeling')
    project_image = '3.jpg' if category == 'bathroom' else '1.jpg'
    page = page.replace('</head>', f'''<style>header.masthead {{ background-image: linear-gradient(rgba(0,0,0,.58), rgba(0,0,0,.58)), url('/assets/img/portfolio/{project_image}'); }}</style>\n</head>''')
    page = '\n'.join(line.rstrip() for line in page.splitlines()) + '\n'
    folder = root / slug; folder.mkdir(exist_ok=True); (folder/'index.html').write_text(page, encoding='utf-8')

(root/'index.html').write_text(metadata(source, 'https://vadconstructions.com/', 'VAD Constructions'), encoding='utf-8')
urls = ['https://vadconstructions.com/'] + [f'https://vadconstructions.com/{s[0]}/' for s in services]
(root/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join('<url><loc>'+url+'</loc></url>' for url in urls) + '\n</urlset>\n', encoding='utf-8')
(root/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: https://vadconstructions.com/sitemap.xml\n', encoding='utf-8')
print('Generated two focused service pages, organization/service metadata, robots.txt, and sitemap.xml.')
