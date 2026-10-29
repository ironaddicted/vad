"""Build focused kitchen and bathroom pages without changing the homepage."""
from pathlib import Path
import html
import json
import re

ROOT = Path(__file__).resolve().parents[1]
HOME = (ROOT / 'index.html').read_text(encoding='utf-8')
FORM_SCRIPT = re.findall(r'<script>(.*?)</script>', HOME, re.S)[-1]
REVIEWS = json.loads((ROOT / 'assets/gallery-sources.json').read_text())['reviews']
E = html.escape
LOCAL_PHOTOS = json.loads((ROOT / 'assets/local-service-photos.json').read_text(encoding='utf-8'))['photos']
EXTRA_PHOTOS = {
 'kitchen': [
  ('white-subway-backsplash.webp', 'White subway tile backsplash with brass fixtures', 'White subway tile and warm brass details.', 'Photo shared by Julie Haneline on Google.'),
  ('porcelain-backsplash.webp', 'Gray porcelain kitchen backsplash framing the cooking area', 'A gray porcelain backsplash with a horizontal tile layout.', 'Photo shared by Azat s. on Thumbtack.'),
  ('porcelain-backsplash-detail.webp', 'Close view of the porcelain kitchen backsplash and grout lines', 'A closer look at the tile finish and grout lines.', 'Detail from the same Thumbtack backsplash project.')],
 'bathroom': [
  ('bathroom-subway-shower.webp', 'Glass shower with white subway tile, black fixtures and a linear drain', 'White subway tile, black fixtures, and a glass shower enclosure.', 'Selected from the VAD Google Photos library.'),
  ('bathroom-gray-tub.webp', 'White bathtub with gray tile surround and black plumbing fixtures', 'A bathtub framed by gray tile and black fixtures.', 'Selected from the VAD Google Photos library.')]
}

def project_photo(filename, alt, caption, credit):
 return f'<figure><a href="/assets/img/portfolio/{filename}" target="_blank" rel="noopener" aria-label="Open larger photo: {E(alt, quote=True)}"><img src="/assets/img/portfolio/{filename}" alt="{E(alt,quote=True)}" width="1400" height="1050" loading="lazy"></a><figcaption>{E(caption)}<span>{E(credit)}</span></figcaption></figure>'

SERVICES = {
 'kitchen': {
  'title':'Kitchen Remodeling in Charlotte, NC', 'headline':'A kitchen planned for everyday living.',
  'description':'Kitchen remodeling in Charlotte, Matthews, Mint Hill and nearby areas. Explore VAD Constructions project photos and request a free kitchen estimate.',
  'intro':'Bring better storage, fresh surfaces, and a more comfortable everyday routine to the heart of your home. Plan your kitchen renovation with VAD Constructions, from a focused update to a coordinated remodel.',
  'image':'kitchen-blue-cabinets.webp', 'alt':'Kitchen with blue-gray cabinets, brass hardware, white countertops and a subway tile backsplash',
  'caption':'Kitchen details: cabinetry, work surfaces, and a clean tile finish.',
  'cards':[
   ('Cabinets & storage','Explore cabinet replacement or updates to existing cabinetry, hardware, and storage. We start with what works in your kitchen and what needs to change.'),
   ('Countertops & backsplash','Coordinate work surfaces, sink details, and a tile backsplash. Material selections, cutouts, and installation responsibilities are part of the estimate.'),
   ('Flooring & finishing details','Bring the room together with flooring, trim, paint, and lighting plans. We identify any plumbing or electrical work needed for the agreed scope.')],
  'planning':'Keep the layout you love, or talk through a different approach. Cabinet dimensions, appliance specifications, access, and the condition of existing surfaces all shape the work. We review those details before committing to a scope.',
  'checks':['What you want to keep, replace, or move','Cabinet and appliance dimensions and material selections','Preparation, demolition, installation, and finish work','Who supplies each item, open allowances, and exclusions'],
  'second':'1.webp','secondalt':'Existing VAD kitchen project showing cabinetry, flooring and backsplash','secondcaption':'An existing kitchen renovation from our project portfolio.',
  'review_names':['Daniel McDowell','Julie H.','Azat s.'],
  'faqs':[
   ('What affects the cost of a kitchen remodel?','The size of the kitchen, cabinet scope, countertop and tile selections, existing conditions, and changes to plumbing, electrical, or layout all affect cost. We prepare a project-specific estimate rather than promise a one-size-fits-all price.'),
   ('Can I update the kitchen without replacing everything?','Yes. Depending on the condition of the room, a focused cabinet, backsplash, flooring, or finish update may suit your goals. Tell us what you want to keep so we can discuss practical options.'),
   ('How long will my kitchen renovation take?','Timing depends on scope, selections, material availability, and any required trade work or approvals. We discuss access and kitchen downtime and confirm scheduling when the work and materials are defined.'),
   ('Should I buy cabinets or appliances before contacting you?','You can share products you are considering, but confirm dimensions, compatibility, supply responsibilities, and lead times before ordering. Photos of your kitchen are enough to begin the conversation.')]
 },
 'bathroom': {
  'title':'Bathroom & Shower Remodeling in Charlotte, NC','headline':'Make room for a better everyday.',
  'description':'Bathroom and shower remodeling in Charlotte, Matthews, Weddington and nearby areas. See VAD Constructions project photos and request a free estimate.',
  'intro':'A more comfortable bathroom starts with the right plan. Talk with VAD Constructions about a bathroom renovation, a custom shower, new tile, or a vanity update built around the way you use the space.',
  'image':'bathroom-marble-shower.webp','alt':'Bathroom with marble-pattern wall tile, a walk-in shower, dark tile flooring and a freestanding bathtub',
  'caption':'Bathroom details: a walk-in shower, freestanding tub, and coordinated tile.',
  'cards':[
   ('Bathroom renovations','Update the vanity, fixtures, flooring, and finishes, or discuss a larger renovation. We define what stays and what changes before preparing your estimate.'),
   ('Showers & tub conversions','Explore a custom shower or a tub-to-shower conversion. Layout, drainage, glass, fixture choices, and ease of use are considered together.'),
   ('Tile & wet-area preparation','Discuss wall and floor tile, niches, trim, and the preparation behind the finish. The waterproofing assembly and substrate are part of the project scope.')],
  'planning':'A bathroom needs to work well beneath the surface as well as look good. We discuss existing moisture concerns, ventilation, substrate condition, and access. Concealed damage may require assessment after opening the area; changes are discussed before additional work proceeds.',
  'checks':['Your shower, tub, vanity, storage, and accessibility priorities','Tile selections, waterproofing scope, fixtures, and glass','Any plumbing, electrical, or ventilation changes','Bathroom downtime, material lead times, and open conditions'],
  'second':'3.webp','secondalt':'Existing VAD bathroom project showing tile and updated bathroom fixtures','secondcaption':'A bathroom renovation from our existing project portfolio.',
  'review_names':['Franklin Y.','Jill H.','Trevor Flanary'],
  'faqs':[
   ('What affects the cost of a bathroom remodel?','Room size, demolition, tile coverage, waterproofing, fixtures, glass, and layout changes affect cost. Existing moisture damage and needed repairs can also change the scope. We identify confirmed work and unresolved conditions in the estimate.'),
   ('Can you replace a bathtub with a shower?','We can discuss a tub-to-shower conversion and assess the available space, drainage, plumbing, waterproofing, and glass requirements. Final scope depends on the existing bathroom and your selections.'),
   ('How long will my bathroom be unavailable?','Bathroom downtime depends on the work, inspections where required, curing times, deliveries, and glass installation. We discuss access to another bathroom and confirm the proposed sequence before work starts.'),
   ('Can you help with a bathroom that has leaks or damaged tile?','Tell us about visible leaks, staining, loose tile, or soft flooring. Photos help start the discussion, but concealed conditions may need an on-site assessment or investigation. New tile alone does not resolve an underlying waterproofing problem.')]
 }
}

for service, data in SERVICES.items():
 slug = service+'-remodeling'; url='https://vadconstructions.com/'+slug+'/'
 other='bathroom' if service=='kitchen' else 'kitchen'
 title=data['title']+' | VAD Constructions'
 cards=''.join(f'<article class="card"><span class="num">0{i+1}</span><h3>{E(t)}</h3><p>{E(p)}</p></article>' for i,(t,p) in enumerate(data['cards']))
 faqs=''.join(f'<details><summary>{E(q)}</summary><p>{E(a)}</p></details>' for q,a in data['faqs'])
 reviews=''.join(f'<figure class="card review"><blockquote>“{E(r["excerpt"])}”</blockquote><figcaption><strong>{E(r["name"])}</strong><p class="micro">{E(r["service"])}</p><a href="{E(r["url"],quote=True)}" target="_blank" rel="noopener noreferrer">Read on {E(r["platform"])} ↗</a></figcaption></figure>' for r in REVIEWS if r['name'] in data['review_names'])
 photos = [(data['image'], data['alt'], data['caption'], 'Selected from the VAD Google Photos library.'), (data['second'], data['secondalt'], data['secondcaption'], 'From the existing VAD project portfolio.')] + EXTRA_PHOTOS[service]
 photos += [(p['image'], p['alt'], p['caption'], p['credit']) for p in LOCAL_PHOTOS if p['service'] == service]
 if len({p[0] for p in photos}) != len(photos):
  raise ValueError(f'Duplicate image in {service} gallery')
 gallery = ''.join(project_photo(*photo) for photo in photos)
 org={'@type':'HomeAndConstructionBusiness','@id':'https://vadconstructions.com/#organization','name':'VAD Constructions','url':'https://vadconstructions.com/','telephone':'+17047509110'}
 schema={'@context':'https://schema.org','@graph':[org,{'@type':'Service','@id':url+'#service','name':data['title'],'serviceType':service.capitalize()+' remodeling','url':url,'provider':{'@id':org['@id']},'areaServed':[{'@type':'City','name':n} for n in ['Charlotte','Matthews','Mint Hill','Weddington','Waxhaw','Monroe','Pineville','Stallings','Wesley Chapel']]},{'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':'https://vadconstructions.com/'},{'@type':'ListItem','position':2,'name':service.capitalize()+' remodeling','item':url}]}]}
 page=f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{E(title)}</title><meta name="description" content="{E(data['description'],quote=True)}"><link rel="canonical" href="{url}">
<meta property="og:title" content="{E(title,quote=True)}"><meta property="og:description" content="{E(data['description'],quote=True)}"><meta property="og:type" content="website"><meta property="og:url" content="{url}"><meta property="og:image" content="https://vadconstructions.com/assets/img/portfolio/{data['image']}">
<link rel="icon" href="/assets/favicon.png"><link rel="stylesheet" href="/css/service-pages.css"><link rel="preload" as="image" href="/assets/img/portfolio/{data['image']}">
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-16582460982"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','AW-16582460982');</script>
<script defer src="/js/analytics.js"></script><script defer src="/js/lead-context.js"></script><script type="application/ld+json">{json.dumps(schema)}</script></head>
<body data-service="{service}"><a class="skip" href="#main">Skip to content</a>
<nav id="mainNav" aria-label="Main navigation"><div class="wrap nav-inner"><a class="logo" href="/" aria-label="VAD Constructions home"><span class="brand-name">VAD<span>CONSTRUCTIONS</span></span></a><div class="nav-links"><a href="#services">Services</a><a href="#portfolio">Our work</a><a href="#reviews">Reviews</a><a class="nav-phone" href="tel:+17047509110">(704) 750-9110</a><a class="btn" href="#contact" data-cta-location="navigation">Free estimate</a></div></div></nav>
<main id="main"><header class="masthead hero" id="hero"><div class="wrap hero-grid"><div><p class="eyebrow">VAD Constructions / {service} remodeling</p><p class="micro">Charlotte · Matthews · Surrounding communities</p><h1>{E(data['title'])}</h1><p class="lede">{E(data['intro'])}</p><div class="actions"><a class="btn" href="#contact" data-cta-location="hero">Get a free {service} estimate</a><a class="btn secondary" href="#portfolio">See our work ↓</a></div><p class="micro">Tell us your priorities. No measurements needed to get started.</p></div><figure style="margin:0"><img class="hero-image" src="/assets/img/portfolio/{data['image']}" alt="{E(data['alt'],quote=True)}" width="1400" height="1050" fetchpriority="high"><figcaption class="photo-caption">{E(data['caption'])}</figcaption></figure></div></header>
<div class="trust"><div class="wrap"><span>Local remodeling service</span><span>Project-specific estimates</span><span>Real project photos</span><span>Call or text (704) 750-9110</span></div></div>
<section class="section" id="services"><div class="wrap"><p class="eyebrow">A thoughtful plan, from the start</p><h2>{E(data['headline'])}</h2><p class="section-intro">Start with what you want your {service} to do better. We help define the work, discuss materials, and identify the details that matter before preparing an estimate.</p><div class="cards">{cards}</div></div></section>
<section class="section alt" id="portfolio"><div class="wrap"><p class="eyebrow">See the details</p><h2>{service.capitalize()} project inspiration, from our work.</h2><p class="section-intro">A closer look at materials, layouts, and finishes. Your estimate will reflect your own room and agreed scope.</p><div class="project-grid">{gallery}</div><a class="btn" href="#contact" data-cta-location="projects">Let's talk about your {service}</a></div></section>
<section class="section" id="planning"><div class="wrap two-col"><div><p class="eyebrow">Clear scope. Better decisions.</p><h2>Know what goes into your estimate.</h2><p>{E(data['planning'])}</p><p>We serve Charlotte, Matthews, Mint Hill, Weddington, Waxhaw, Monroe, Pineville, Stallings, and Wesley Chapel. Share your ZIP code so we can confirm project availability.</p></div><div><h3>What we'll go over together</h3><ul class="checklist">{''.join('<li>'+E(x)+'</li>' for x in data['checks'])}</ul><p class="micro">Scope, selections, timing, and unresolved conditions are discussed before work is agreed.</p></div></div></section>
<section class="section alt" id="process"><div class="wrap"><p class="eyebrow">What happens next</p><h2>From your first idea to a defined project.</h2><div class="cards"><article class="card"><span class="num">01 / SHARE</span><h3>Tell us about the space</h3><p>Describe what you want to change, your location, and ideal timing. You can text photos to start the conversation.</p></article><article class="card"><span class="num">02 / REVIEW</span><h3>Work through the details</h3><p>We discuss priorities, review the space, and identify measurements, selections, or trade assessments needed for the estimate.</p></article><article class="card"><span class="num">03 / PLAN</span><h3>Agree on the next step</h3><p>Review your proposed scope, material responsibilities, open questions, and scheduling before deciding how to proceed.</p></article></div></div></section>
<section class="section" id="reviews"><div class="wrap"><p class="eyebrow">From our clients</p><h2>Details matter. So does communication.</h2><p class="section-intro">Selected excerpts from reviews on Google and Thumbtack.</p><div class="cards">{reviews}</div></div></section>
<section class="section alt" id="questions"><div class="wrap two-col"><div><p class="eyebrow">Before you begin</p><h2>Your {service} remodeling questions.</h2><p>Have a specific question about your home? <a href="#contact" data-cta-location="faq">Tell us what you are planning.</a></p></div><div>{faqs}</div></div></section>
<section class="contact" id="contact"><div class="wrap two-col"><div><p class="eyebrow">Let's plan your {service}</p><h2>Start with a conversation.</h2><p class="lede">Tell us what you want to change and where your project is located. We'll follow up to discuss the details and the next step toward your free estimate.</p><p><a href="tel:+17047509110">Call (704) 750-9110</a><br><a href="sms:+17047509110">Text your project photos</a></p><p class="micro" style="color:#d2dbd0">Prefer another service? Explore <a href="/{other}-remodeling/">{other} remodeling</a>.</p></div><form id="contactForm"><div class="honeypot-field" aria-hidden="true"><label for="website">Leave empty</label><input id="website" tabindex="-1" autocomplete="off"></div><div class="form-grid"><div><label for="name">Name *</label><input id="name" name="name" autocomplete="name" required></div><div><label for="phone">Phone *</label><input id="phone" name="phone" type="tel" autocomplete="tel" required></div><div class="full"><label for="email">Email *</label><input id="email" name="email" type="email" autocomplete="email" required></div><div class="full"><label for="message">Your {service} project (optional)</label><textarea id="message" name="message" placeholder="What would you like to change? Include your ZIP code and ideal timing."></textarea></div></div><button class="btn" id="submitButton" type="submit" style="margin-top:18px">Request my free estimate</button><p class="form-note">We use your details to respond to your inquiry. Website activity is measured with Google Analytics and Google Ads. <a href="/privacy.html">Privacy notice</a>.</p><p id="submissionError" class="alert" role="alert" hidden>We couldn't confirm your request. Please try again, or <a href="tel:+17047509110">call (704) 750-9110</a>.</p><p id="submissionMessage" class="alert" role="status" style="display:none">Thank you! Your estimate request has been sent. We will be in touch to discuss the details.</p></form></div></section></main>
<footer><div class="wrap"><span>© 2026 VAD Constructions · Charlotte, NC</span><nav aria-label="Footer"><a href="/">Home</a><a href="/{other}-remodeling/">{other.capitalize()} remodeling</a><a href="/privacy.html">Privacy</a></nav></div></footer><div class="mobile-cta"><a class="btn secondary" href="tel:+17047509110">Call VAD</a><a class="btn" href="#contact" data-cta-location="mobile-bar">Free estimate</a></div><script>{FORM_SCRIPT}</script></body></html>'''
 folder=ROOT/slug;folder.mkdir(exist_ok=True);(folder/'index.html').write_text('\n'.join(line.rstrip() for line in page.splitlines())+'\n',encoding='utf-8')
print('Built focused kitchen and bathroom pages.')
