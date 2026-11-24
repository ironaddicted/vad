/* Run against a local preview. All inquiry requests and measurement tags are intercepted. */
const { chromium } = require(process.env.VAD_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const base = process.env.VAD_QA_URL || 'http://127.0.0.1:3012';
const output = process.env.VAD_QA_OUTPUT || 'qa';
const adsLead = 'AW-16582460982/cr4VCNeZ2bMZELaMkeM9';
(async () => {
  await fs.mkdir(output, {recursive:true});
  const browser = await chromium.launch({ executablePath:process.env.VAD_BROWSER_PATH, headless:true });
  const errors = [], results = [];
  async function context(touch=false) {
    const c=await browser.newContext({hasTouch:touch});
    await c.route(/googletagmanager|google-analytics|clarity\.ms/, r=>r.abort());
    // Unhandled backend calls must fail closed; a test never sends a real inquiry.
    await c.route(/lambda-url/,r=>r.abort());
    const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));return {c,p};
  }
  function leadEvents(list){return list.filter(e=>e[0]==='event'&&(e[1]==='generate_lead'||(e[1]==='conversion'&&e[2]?.send_to===adsLead)));}
  for (const route of ['/kitchen-remodeling/','/bathroom-remodeling/','/']) {
    const {c,p}=await context();
    for (const width of [375,768,1280]) {
      await p.setViewportSize({width,height:1000});await p.goto(base+route);await p.locator('[data-vad-estimate]').first().waitFor();
      assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,route+' overflow at '+width);
      assert.ok(!(await p.locator('body').innerText()).includes('[[TODO'));
      assert.ok(!(await p.locator('body').innerText()).includes('750-9110'));
      assert.equal(await p.locator('a[href*="7509110"]').count(),0);
      assert.equal(await p.locator('a[href*="insurance"],a[href*="policy"]').count(),0);
      assert.ok(!/\blicensed\b/i.test(await p.locator('body').innerText()));
      assert.equal(await p.locator('.touch-contact').first().isVisible(),false);
      assert.equal(await p.locator('.desktop-contact').first().isVisible(),true);
      if(route!=='/') {
        assert.equal(await p.locator('#mainNav a').count(),3);
        assert.equal(await p.locator('#portfolio .project-grid img').count(),8);
        for(const img of await p.locator('#portfolio img').all()) {
          assert.equal(await img.getAttribute('loading'),'lazy');
          assert.ok(await img.getAttribute('alt'));assert.ok(await img.getAttribute('width'));assert.ok(await img.getAttribute('height'));
        }
        assert.equal(await p.locator('footer a').count(),1);
        const schema=JSON.parse(await p.locator('script[type="application/ld+json"]').textContent());
        const faq=schema['@graph'].find(x=>x['@type']==='FAQPage');
        const summaries=await p.locator('#questions summary').allTextContents();assert.deepEqual(faq.mainEntity.map(q=>q.name),summaries);
      }
      await p.screenshot({path:output+'/'+(route==='/'?'home':route.split('/')[1])+'-'+width+'.png',fullPage:width===1280});
      if(width===1280)await p.screenshot({path:output+'/'+(route==='/'?'home':route.split('/')[1])+'-hero.png'});
    }
    await c.close();
    const mobile=await context(true);await mobile.p.setViewportSize({width:375,height:812});await mobile.p.goto(base+route);
    assert.equal(await mobile.p.locator('.touch-contact').first().isVisible(),true);assert.equal(await mobile.p.locator('.desktop-contact').first().isVisible(),false);
    const boxes=await mobile.p.locator('.mobile-cta a').evaluateAll(links=>links.map(a=>({height:a.getBoundingClientRect().height,width:a.getBoundingClientRect().width})));
    assert.equal(boxes.length,3);assert.ok(boxes.every(b=>b.height>=44));assert.ok(Math.max(...boxes.map(b=>b.width))-Math.min(...boxes.map(b=>b.width))<2,route+' '+JSON.stringify(boxes));
    await mobile.p.screenshot({path:output+'/'+(route==='/'?'home':route.split('/')[1])+'-touch.png'});
    await mobile.c.close();results.push({route,layouts:[375,768,1280],touch:true});
  }
  for (const route of ['/kitchen-remodeling/','/bathroom-remodeling/','/']) {
    for (const id of route==='/'?['contactForm']:['heroEstimateForm','contactForm']) {
      const {c,p}=await context();
      const payloads=[];let finish;
      await p.route(/lambda-url/,async r=>{
        payloads.push(JSON.parse(r.request().postData()));await new Promise(resolve=>{finish=resolve;});
        await r.fulfill({status:200,body:'ok',headers:{'Access-Control-Allow-Origin':'*'}});
      });
      await p.goto(base+route+'?gclid=qa-id&utm_source=google&utm_medium=cpc&utm_campaign=qa&utm_term=remodel');
      const form=p.locator('#'+id), button=form.locator('button[type=submit]');
      await button.click();assert.equal(payloads.length,0);assert.equal(await form.locator('[name=phone]').getAttribute('aria-invalid'),'true');
      await form.locator('[name=name]').fill('QA visitor');await form.locator('[name=phone]').fill('123');await form.locator('[name=zip]').fill('12');await button.click();assert.equal(payloads.length,0);
      await form.locator('[name=phone]').fill('(704) 555-0123');await form.locator('[name=zip]').fill('28202');
      assert.equal(await form.locator('[name=gclid]').inputValue(),'qa-id');
      if(id==='contactForm')assert.equal(await form.locator('[name=email]').getAttribute('required'),null);
      const before=await p.evaluate(()=>dataLayer.map(x=>Array.from(x)));await button.click();await p.waitForFunction(()=>document.querySelector('button:disabled'));
      for(let attempt=0;attempt<50&&payloads.length===0;attempt++)await p.waitForTimeout(10);
      assert.equal(await button.isDisabled(),true);assert.equal(payloads.length,1);
      assert.equal(leadEvents(await p.evaluate(()=>dataLayer.map(x=>Array.from(x)))).length,leadEvents(before).length);
      await form.evaluate(f=>f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));assert.equal(payloads.length,1);
      for(const key of ['zip','gclid','utm_source','utm_medium','utm_campaign','utm_term'])assert.ok(payloads[0][key],key+' missing');
      assert.ok(payloads[0].message.includes('ZIP: 28202'));assert.ok(payloads[0].message.includes('gclid=qa-id'));assert.equal(payloads[0].email,'');
      finish();await p.locator('.estimate-success').waitFor();assert.equal(await p.locator('#'+id).count(),0);
      const events=await p.evaluate(()=>dataLayer.map(x=>Array.from(x)));assert.equal(leadEvents(events).length,2);
      assert.ok(!JSON.stringify(events).includes('QA visitor'));assert.ok(!JSON.stringify(events).includes('qa-id'));
      await c.close();
    }
  }
  // Failures remain retryable; honeypot requests and conversions are suppressed.
  for (const mode of ['http-error','network-error','honeypot','honeypot-whitespace']) {
    const {c,p}=await context();let calls=0;
    await p.route(/lambda-url/,r=>{calls++;return mode==='http-error'?r.fulfill({status:500,body:'error',headers:{'Access-Control-Allow-Origin':'*'}}):r.abort();});
    await p.goto(base+'/kitchen-remodeling/');const form=p.locator('#heroEstimateForm');
    await form.locator('[name=name]').fill('QA');await form.locator('[name=phone]').fill('7045550123');await form.locator('[name=zip]').fill('28202');
    if(mode.startsWith('honeypot'))await form.locator('[name=website]').evaluate((el,value)=>el.value=value,mode==='honeypot'?'spam':'   ');
    await form.locator('button').click();
    if(mode.startsWith('honeypot')){await p.locator('.estimate-success').waitFor();assert.equal(calls,0);}
    else{await form.locator('[data-form-status]').waitFor({state:'visible'});assert.equal(await form.locator('button').isDisabled(),false);}
    assert.equal(leadEvents(await p.evaluate(()=>dataLayer.map(x=>Array.from(x)))).length,0);await c.close();
  }
  // Verify click events for every public contact link, including the chat shadow tree.
  const {c,p}=await context(true);await p.goto(base+'/');
  const contacts=await p.locator('a[href^="tel:"],a[href^="sms:"]').all();
  for(const contact of contacts){const href=await contact.getAttribute('href');await contact.evaluate(a=>{a.addEventListener('click',e=>e.preventDefault(),{once:true});a.click();});const events=await p.evaluate(()=>dataLayer.map(x=>Array.from(x)));assert.equal(events.at(-1)[1],href.startsWith('tel:')?'click_to_call':'click_to_text');}
  const widget=p.locator('#project-chat-widget');
  await widget.getByRole('button',{name:'Ask about your project'}).click();
  const chatContact=widget.locator('a[href^="sms:"]');
  await chatContact.evaluate(a=>{a.addEventListener('click',e=>e.preventDefault(),{once:true});a.click();});
  assert.equal((await p.evaluate(()=>dataLayer.map(x=>Array.from(x)))).at(-1)[1],'click_to_text');
  await c.close();assert.deepEqual(errors,[]);await browser.close();
  await fs.writeFile(output+'/conversion-qa.json',JSON.stringify({passed:true,layouts:results,forms:5,backend:'mocked; no actual inquiry sent',runtimeErrors:errors},null,2));
  console.log('PASS: layouts, touch/desktop CTAs, 5 forms, attribution, success-only events, failures, duplicate submits, and honeypot. All backend requests mocked.');
})().catch(e=>{console.error(e);process.exit(1)});
