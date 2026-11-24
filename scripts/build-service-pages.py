"""Generate both ad landing pages from reviewed facts and shared components."""
from pathlib import Path
import html
import json

ROOT = Path(__file__).resolve().parents[1]
E = html.escape
load = lambda name: json.loads((ROOT / 'assets' / name).read_text(encoding='utf-8'))
SERVICES = load('landing-content.json')
DETAILS = load('landing-business-details.json')
REVIEWS = load('landing-reviews.json')
PHOTOS = load('local-service-photos.json')['photos']
SIZES = load('service-image-metadata.json')
THUMBTACK = REVIEWS['source']
GOOGLE = 'https://g.co/kgs/7Uc7n9J'
CITIES = ['Charlotte', 'Matthews', 'Mint Hill', 'Weddington', 'Waxhaw', 'Monroe', 'Pineville', 'Stallings', 'Wesley Chapel']

def resolved(value):
    return bool(value) and '[[TODO:' not in str(value)

def hidden(key, text):
    return f'<template data-unresolved="{key}"><span hidden>{E(text)}</span></template>'

def contact_actions(location, estimate=True):
    return f'''<div class="contact-actions" data-cta-location="{location}">
<div class="touch-contact"><a class="btn" href="tel:+17046650505">Call (704) 665-0505</a><a class="btn secondary" href="sms:+17046650505">Text Us</a></div>
<a class="desktop-contact" href="tel:+17046650505">Call or text (704) 665-0505</a>
{f'<a class="btn" href="#contact" data-cta-location="{location}">Free Estimate</a>' if estimate else ''}</div>'''

def estimate_form(service='general', hero=False):
    prefix = 'hero-' if hero else ''
    form_id = 'heroEstimateForm' if hero else 'contactForm'
    def field(name, label, kind='text', required=False, autocomplete=''):
        identifier = prefix + name
        attr = ' required' if required else ''
        extra = ' inputmode="numeric" maxlength="5" pattern="[0-9]{5}"' if name == 'zip' else ' maxlength="100"'
        return f'<div><label for="{identifier}">{label}</label><input id="{identifier}" name="{name}" type="{kind}" autocomplete="{autocomplete}"{attr}{extra} aria-describedby="{identifier}-error"><p class="field-error" id="{identifier}-error" data-error="{name}" aria-live="polite"></p></div>'
    description = f'<label for="{prefix}message">Project description (optional)</label><textarea id="{prefix}message" name="message" rows="3" maxlength="2000" placeholder="What would you like to change?"></textarea>'
    if hero:
        description = f'<details class="optional-project"><summary>Add project details (optional)</summary>{description}</details>'
    return f'''<form id="{form_id}" class="estimate-form" data-vad-estimate data-clarity-mask="true" novalidate>
<div class="honeypot-field" aria-hidden="true"><label for="{prefix}website">Leave this field empty</label><input id="{prefix}website" name="website" tabindex="-1" autocomplete="off"></div>
<div class="form-grid">{field('name','Name *',required=True,autocomplete='name')}{field('phone','Phone *','tel',True,'tel')}{field('zip','ZIP *',required=True,autocomplete='postal-code')}{'' if hero else field('email','Email (optional)','email',False,'email')}</div>
{description}<button class="btn estimate-submit" id="{prefix}submitButton" type="submit">Get My Free Estimate</button>
<p class="response-note">No obligation. We typically reply the same day.</p><p class="field-error" data-form-status role="alert" hidden></p>
<p class="form-note">We use your details to respond to your project inquiry. <a href="/privacy.html">Privacy</a>.</p>
</form>'''

def project_photo(filename, alt, caption):
    size = SIZES[filename]
    return f'<figure><a href="/assets/img/portfolio/{filename}" target="_blank" rel="noopener" aria-label="Open larger photo: {E(alt,quote=True)}"><img src="/assets/img/portfolio/{filename}" alt="{E(alt,quote=True)}" width="{size["width"]}" height="{size["height"]}" loading="lazy" decoding="async"></a><figcaption>{E(caption)}</figcaption></figure>'

def review_cards(service):
    result = []
    for review in REVIEWS['reviews']:
        if review['service'] != service:
            continue
        stars = f'<p class="stars" aria-label="{review["stars"]} out of 5 stars">{"★" * review["stars"]}</p>' if review['stars'] else hidden('review-rating', review['ratingTodo'])
        result.append(f'<figure class="card review">{stars}<blockquote>“{E(review["text"])}”</blockquote><figcaption><strong>{E(review["name"])}</strong><p class="micro">{E(review["project"])}</p><a href="{THUMBTACK}" target="_blank" rel="noopener">Read on Thumbtack ↗</a></figcaption></figure>')
    if service == 'bathroom':
        result.append(hidden('bathroom-reviews', REVIEWS['bathroomMore']))
    return ''.join(result)

def build():
    for service, data in SERVICES.items():
        url = f'https://vadconstructions.com/{service}-remodeling/'
        title = data['title'] + ' | VAD Constructions'
        image = data['image']
        stem = image.removesuffix('.webp')
        size = SIZES[image]
        photos = [(image, data['alt'], data['caption'])]
        if service == 'kitchen':
            photos += [('1.webp', 'Reconditioned kitchen cabinets, LVP flooring and subway tile in Mint Hill', 'Kitchen refresh · Mint Hill — reconditioned cabinets, LVP flooring, and subway tile.'),
                       ('porcelain-backsplash.webp', 'Gray porcelain tile backsplash around a kitchen cooking area', 'Kitchen backsplash — horizontal porcelain tile around the cooking area.'),
                       ('white-subway-backsplash.webp', 'White subway kitchen backsplash with brass fixtures', 'Kitchen backsplash — white subway tile with brass fixtures.')]
            photos += [(p['image'], p['alt'], 'Kitchen update — ' + p['caption']) for p in PHOTOS if p['service'] == service]
        else:
            photos += [('3.webp', 'Walk-in shower with glass enclosure and illuminated niche in Salisbury', 'Walk-in shower · Salisbury — seamless entry, glass enclosure, and illuminated niche.'),
                       ('4.webp', 'Bathroom renovation in a 1943 Charlotte home with dark blue shower tile', 'Bathroom renovation · Charlotte, 1943 home — dark blue shower tile and updated vanity.'),
                       ('bathroom-subway-shower.webp', 'White subway tile shower with black fixtures and glass enclosure', 'Shower update — white subway tile, black fixtures, and glass enclosure.')]
            photos += [(p['image'], p['alt'], 'Bathroom update — ' + p['caption']) for p in PHOTOS if p['service'] == service and p['image'] != '4.webp']
        photos = photos[:8]
        gallery = ''.join(project_photo(*photo) for photo in photos)
        cards = ''.join(f'<article class="card"><span class="num">0{i+1}</span><h3>{E(t)}</h3><p>{E(p)}</p></article>' for i, (t, p) in enumerate(data['cards']))
        price = DETAILS[service + 'Price']
        timeline = DETAILS[service + 'Timeline']
        cost_block = f'<section class="section" id="cost"><div class="wrap"><h2>What it costs</h2><p>{E(price)}</p><p>Final price depends on scope.</p></div></section>' if resolved(price) else hidden('cost', price)
        time_block = f'<p>How long it takes: {E(timeline)}</p>' if resolved(timeline) else hidden('timeline', timeline)
        why_block = f'<section class="section"><div class="wrap"><h2>Why VAD Constructions</h2><p>{E(DETAILS["differentiators"])}</p></div></section>' if resolved(DETAILS['differentiators']) else hidden('differentiators', DETAILS['differentiators'])
        turnaround = f' in {E(DETAILS["quoteTurnaround"])}' if resolved(DETAILS['quoteTurnaround']) else ''
        faq_items = list(data['faqs'])
        if resolved(price): faq_items[0] = (faq_items[0][0], price + ' Final price depends on scope. ' + faq_items[0][1])
        if resolved(timeline): faq_items[2] = (faq_items[2][0], timeline + ' ' + faq_items[2][1])
        faqs = ''.join(f'<details><summary>{E(q)}</summary><p>{E(a)}</p></details>' for q, a in faq_items)
        extras = hidden('quote-turnaround', DETAILS['quoteTurnaround']) if not turnaround else ''
        if resolved(DETAILS['googleRating']) and resolved(DETAILS['googleReviewCount']):
            google_trust = f'<a href="{GOOGLE}" target="_blank" rel="noopener">Google: {E(DETAILS["googleRating"])} / {E(DETAILS["googleReviewCount"])} reviews</a>'
        else: google_trust = hidden('google-reviews', DETAILS['googleRating'] + ' / ' + DETAILS['googleReviewCount'])
        years = f'<span>{E(DETAILS["years"])} years in business</span>' if resolved(DETAILS['years']) else hidden('years', DETAILS['years'])
        org = {'@type':'HomeAndConstructionBusiness', '@id':'https://vadconstructions.com/#organization', 'name':'VAD Constructions', 'url':'https://vadconstructions.com/', 'telephone':'+17046650505'}
        schema = {'@context':'https://schema.org', '@graph':[org, {'@type':'Service', 'name':data['title'], 'url':url, 'provider':{'@id':org['@id']}, 'areaServed':[{'@type':'City','name':city} for city in CITIES]}, {'@type':'FAQPage','mainEntity':[{'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}} for q,a in faq_items]}]}
        page = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{E(title)}</title><meta name="description" content="{E(data['description'],quote=True)}"><link rel="canonical" href="{url}">
<meta property="og:title" content="{E(title,quote=True)}"><meta property="og:description" content="{E(data['description'],quote=True)}"><meta property="og:type" content="website"><meta property="og:url" content="{url}"><meta property="og:image" content="https://vadconstructions.com/assets/img/portfolio/{image}">
<link rel="icon" href="/assets/favicon.png"><style>{(ROOT / "css/service-pages.css").read_text(encoding="utf-8")}</style>
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-16582460982"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','AW-16582460982');</script>
<script defer src="/js/contact-conversions.js"></script><script defer src="/js/analytics.js"></script><script defer src="/js/lead-context.js"></script><script defer src="/js/estimate-forms.js"></script></head>
<body data-service="{service}"><a class="skip" href="#main">Skip to content</a>
<nav id="mainNav" aria-label="Main navigation"><div class="wrap nav-inner"><a class="logo" href="/" aria-label="VAD Constructions home"><img src="/assets/img/vad-header-logo.svg" alt="VAD Constructions" width="1350" height="650"></a><div class="nav-links"><a class="nav-phone" href="tel:+17046650505">(704) 665-0505</a><a class="btn" href="#heroEstimateForm" data-cta-location="navigation">Free estimate</a></div></div></nav>
<main id="main"><header class="masthead hero" id="hero"><div class="wrap hero-grid"><div class="hero-copy"><p class="eyebrow">VAD Constructions / {service} remodeling</p><h1>{E(data['title'].replace('Bathroom & Shower', 'Bathroom'))}</h1><p class="lede">{E(data['intro'])}</p>{contact_actions('hero',False)}</div><aside class="hero-estimate" aria-labelledby="hero-form-heading"><h2 id="hero-form-heading">Your free estimate starts here.</h2>{estimate_form(service,True)}</aside><figure class="hero-project"><img class="hero-image" src="/assets/img/portfolio/{stem}-960.webp" srcset="/assets/img/portfolio/{stem}-640.webp 640w, /assets/img/portfolio/{stem}-960.webp 960w" sizes="(max-width:800px) 100vw, 540px" width="{size['width']}" height="{size['height']}" alt="{E(data['alt'],quote=True)}" loading="lazy" fetchpriority="low" decoding="async"><figcaption class="photo-caption">{E(data['caption'])}</figcaption></figure></div></header>
<div class="trust"><div class="wrap"><span><strong>Insured</strong><small>Certificate of insurance available on request</small></span><span>1-year workmanship warranty</span><span>Same-day response<small>We typically reply the same day</small></span><a href="{THUMBTACK}" target="_blank" rel="noopener">40+ reviews on Thumbtack</a>{google_trust}{years}</div></div>
<section class="section" id="services"><div class="wrap"><p class="eyebrow">A thoughtful plan, from the start</p><h2>{E(data['headline'])}</h2><div class="cards">{cards}</div></div></section>
<section class="section alt" id="portfolio"><div class="wrap"><p class="eyebrow">See the details</p><h2>{service.capitalize()} projects, from our work.</h2><p class="section-intro">A closer look at materials, layouts, and finishes. Your estimate reflects your own room and agreed scope.</p><div class="project-grid">{gallery}</div>{contact_actions('after-gallery')}</div></section>
<section class="section" id="planning"><div class="wrap two-col"><div><p class="eyebrow">Clear scope. Better decisions.</p><h2>Know what goes into your estimate.</h2><p>{E(data['planning'])}</p><p>All work is backed by a 1-year workmanship warranty.</p><p>We serve {', '.join(CITIES[:-1])}, and {CITIES[-1]}. Share your ZIP so we can discuss your project.</p></div><div><h3>What we'll go over together</h3><ul class="checklist">{''.join('<li>'+E(x)+'</li>' for x in data['checks'])}</ul>{time_block}</div></div></section>
<section class="section alt" id="process"><div class="wrap"><p class="eyebrow">What happens next</p><h2>Three simple steps to your estimate.</h2><div class="cards"><article class="card"><span class="num">01</span><h3>You get in touch</h3><p>You call, text, or submit the form.</p></article><article class="card"><span class="num">02</span><h3>We arrange a walkthrough</h3><p>We typically reply the same day and schedule a free walkthrough.</p></article><article class="card"><span class="num">03</span><h3>You review your quote</h3><p>You get a written quote{turnaround}.</p>{extras}</article></div></div></section>
<section class="section" id="reviews"><div class="wrap"><p class="eyebrow">From our clients</p><h2>Details matter. So does communication.</h2><p class="section-intro">Verbatim excerpts from Thumbtack reviews. Follow each link to read the full review.</p><div class="cards reviews-grid">{review_cards(service)}</div>{contact_actions('after-reviews')}</div></section>
{cost_block}{why_block}<section class="section alt" id="questions"><div class="wrap two-col"><div><p class="eyebrow">Before you begin</p><h2>Your {service} remodeling questions.</h2></div><div>{faqs}</div></div></section>
<section class="contact" id="contact"><div class="wrap two-col"><div><p class="eyebrow">Let's plan your {service}</p><h2>Start with a conversation.</h2><p class="lede">Tell us what you want to change. Request a free estimate for your {service} project.</p>{contact_actions('bottom',False)}</div>{estimate_form(service)}</div></section></main>
<footer><div class="wrap"><span>© 2026 VAD Constructions</span><nav aria-label="Footer"><a href="/privacy.html">Privacy</a></nav></div></footer><div class="mobile-cta"><a class="btn secondary" href="tel:+17046650505">Call</a><a class="btn secondary" href="sms:+17046650505">Text</a><a class="btn" href="#contact" data-cta-location="mobile-bar">Free Estimate</a></div><script type="application/ld+json">{json.dumps(schema)}</script></body></html>'''
        folder = ROOT / (service + '-remodeling')
        folder.mkdir(exist_ok=True)
        (folder / 'index.html').write_text(page + '\n', encoding='utf-8')

if __name__ == '__main__':
    build()
    print('Built kitchen and bathroom ad landing pages.')
