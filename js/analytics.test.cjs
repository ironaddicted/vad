const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=readFileSync(__dirname+'/analytics.js','utf8');
function setup(path='/',destinations){
 const events=[],handlers={};
 const document={addEventListener:(name,fn)=>handlers[name]=fn,querySelectorAll:()=>[],querySelector:()=>({getBoundingClientRect:()=>({bottom:80})}),hidden:true,hasFocus:()=>false};
 const window={location:{pathname:path,search:''},gtag:(...args)=>events.push(args),addEventListener(){},vadContactConversionDestinations:destinations};
 vm.runInNewContext(source,{window,document,URLSearchParams,performance:{now:()=>0},setInterval(){}});
 handlers.DOMContentLoaded();return {events,handlers,window};
}
for(const service of ['kitchen','bathroom','general']){
 const test=setup(service==='general'?'/':`/${service}-remodeling/`);
 assert.equal(test.events[0][2].content_group,service);
 assert.equal(test.events.filter(e=>e[1]==='generate_lead'||e[1]==='conversion').length,0,'Page views never create leads');
 test.window.vadAnalytics.leadSuccess('heroEstimateForm');
 assert.equal(test.events.filter(e=>e[1]==='generate_lead').length,1);
 assert.equal(test.events.at(-1)[2].send_to,'AW-16582460982/cr4VCNeZ2bMZELaMkeM9');
 for(const kind of ['tel','sms']){
  const link={closest:selector=>selector.includes(kind+':')?link:null};
  test.handlers.click({target:link});
  assert.equal(test.events.at(-1)[1],kind==='tel'?'click_to_call':'click_to_text');
  assert.equal(test.events.at(-1)[2].service_type,service);
 }
}
const shadow=setup('/kitchen-remodeling/',{click_to_call:'AW-test/verified-test-only'});
const link={matches:()=>true,closest:s=>s.includes('tel:')?link:null};
shadow.handlers.click({target:{closest:()=>null},composedPath:()=>[link]});
assert.equal(shadow.events.at(-1)[1],'conversion');
assert.equal(shadow.events.at(-1)[2].send_to,'AW-test/verified-test-only');
const thanks=setup('/quote-thank-you/');
assert.equal(thanks.events.filter(e=>e[1]==='generate_lead'||e[1]==='conversion').length,0,'Thank-you URL refreshes never create leads');
console.log('PASS: service attribution, GA4 contact events, verified Ads routing, shadow-root links, and no page-view conversions.');
