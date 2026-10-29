const guides = {
 kitchen: {title:'Kitchen estimate', goal:'a kitchen that supports the way you cook, gather, and live', questions:[
 'Walk me through a typical meal here. Where do you run out of space, storage, or patience?',
 'Are you keeping the layout, or considering moving the sink, appliances, walls, or island? What should that change solve?',
 'Which appliances are staying? Do you have model numbers for replacements, including any ventilation requirements?',
 'What are your preferences for cabinets, storage accessories, countertops, backsplash, flooring, lighting, and finishes?',
 'What must stay usable during construction? How would a temporary kitchen work for your household?'], checks:[
 'Measure the room, ceiling height, openings, appliance spaces, and proposed cabinet runs. Photograph with permission.',
 'Record cabinet scope: replace, reface, or retain; note fillers, panels, hardware, trim, and storage accessories.',
 'Define countertop material, edge, sink, cutouts, backsplash area, and responsibility for templating and installation.',
 'Record plumbing, electrical, lighting, ventilation, floor transitions, wall changes, and finish repairs for qualified review.',
 'Identify appliance supply and installation responsibilities, delivery dates, access, debris removal, and temporary kitchen needs.'], risk:'Do not confirm wall removal, utility relocation, final cabinet fit, or appliance compatibility until measurements and the appropriate trade assessments are complete.'},
 bathroom: {title:'Bathroom estimate', goal:'a bathroom that feels comfortable and works reliably every day', questions:[
 'Who uses this bathroom, and what is the biggest frustration: space, cleaning, storage, comfort, or accessibility?',
 'Are you keeping a tub, converting to a shower, or changing the layout? What matters most about that decision?',
 'Have you noticed leaks, soft flooring, staining, odors, or ventilation problems? What repairs have already been tried?',
 'What do you envision for tile, shower glass, vanity, fixtures, lighting, storage, and easy cleaning?',
 'Would you like to discuss step-free access, grab-bar backing, seating, or a handheld shower? Is there another bathroom available during work?'], checks:[
 'Measure room, openings, shower or tub footprint, vanity, fixture positions, and ceiling height; photograph with permission.',
 'Define demolition, substrate preparation, waterproofing system, tile extent, niches, bench, trim, grout, and sealant.',
 'Record plumbing changes, valve and drain selections, fixture supply responsibilities, and access for service.',
 'Review ventilation, lighting, electrical needs, glass measurements, accessibility requests, and finish repairs.',
 'Flag visible moisture damage and concealed-condition uncertainty. Confirm inspection, testing, curing, and glass-installation sequencing with the responsible trades.'], risk:'Tile and grout alone are not the waterproofing system. Explain the proposed assembly without promising concealed conditions or a completion date before the necessary assessments.'},
 general: {title:'General remodeling estimate', goal:'a coordinated renovation with clear priorities and a well-defined scope', questions:[
 'Which rooms or areas are involved, and what is motivating the project now?',
 'What are your three most important outcomes? Which changes are essential, and which could be a later phase?',
 'Are you considering wall changes, additions to openings, utility moves, flooring, painting, trim, or built-ins?',
 'What materials and finishes do you want to keep, match, repair, or replace? Where should the work stop?',
 'Will you live here during the project? What do we need to plan around for access, work hours, pets, furniture, and daily routines?'], checks:[
 'Create a room-by-room scope with dimensions, quantities, photos with permission, and clear start and stop boundaries.',
 'Separate demolition, framing, trade work, surface preparation, installation, painting, trim, and cleanup.',
 'Flag structural changes and permit or design questions for appropriate professional review before pricing them as confirmed work.',
 'Identify floor transitions, matching limitations, utility shutoffs, protection of occupied areas, and furniture-moving responsibilities.',
 'Map dependencies, material lead times, owner-supplied items, phases, site access, disposal, and exclusions.'], risk:'Avoid a single vague line such as “remodel room.” Define each area, finish, quantity, allowance, exclusion, and dependency so everyone can compare the same work.'}
};
const stages = g => [
 {title:'Open & set the agenda',say:`“Thanks for inviting me over. I’d like to understand what you want to change, walk through the space, and discuss priorities and investment. Then we can agree on what you need from the estimate. Does that work for you?”`,items:['What prompted you to reach out now?','What would make this project a success for you?','Who else should be involved in selections, reviewing the estimate, and making decisions?'],tip:'Build rapport without taking over the appointment. Ask permission before taking photos or measurements.'},
 {title:'Discover the real priorities',say:`“Before we talk about products, I want to understand what ${g.goal} means to you.”`,items:g.questions,tip:'Reflect back: “So your top priorities are [priority one] and [priority two], and you want to avoid [concern]. Have I understood correctly?”'},
 {title:'Walk through & define scope',say:'“Let’s walk through what stays, what changes, and what needs a closer look. I’ll separate what we can confirm today from items that need measurements, selections, or a trade assessment.”',checks:g.checks,tip:g.risk},
 {title:'Discuss investment & timing',say:'“Have you set a comfortable investment range for this project? That helps me recommend a scope and materials that fit. If you have not, we can first define the essentials and separate optional upgrades.”',items:['Is that range for construction only, or should it also include materials, appliances, design, and other project costs?','Is there a target date or an event driving your timeline? How flexible is it?','Which matters most if we need to make tradeoffs: scope, finish level, or timing?','Would you prefer one complete project or clearly priced phases?'],tip:'Do not invent a price to fill a silence. Explain what is needed for reliable pricing. Discuss a separate owner contingency for unknowns without presenting it as a guaranteed cost.'},
 {title:'Present the estimate',say:'“You told me [priorities] matter most. This estimate addresses those through [specific scope]. Let’s walk through what is included, the selections and allowances, the exclusions, and the total investment of [verified amount].”',checks:['Explain quantities, labor, material responsibilities, preparation, protection, disposal, and cleanup.','Identify each allowance and its basis; explain how final selections can change the price. Distinguish allowances from optional upgrades.','Call out exclusions, unresolved conditions, taxes or fees where applicable, permit responsibilities, and estimate validity.','Explain the proposed schedule and its dependencies, payment milestones, written change process, and only verified warranty terms.'],tip:'If pricing is not ready: “I’ll confirm [open items] and send a written estimate by [agreed date].” Never imply this guide supplies a price, contract, or company policy.'},
 {title:'Handle concerns with curiosity',say:'“What feels right about the proposal, and what would you like us to clarify or adjust?”',items:['“That is more than expected.” → “What range were you planning for? Let’s identify what to keep and which finishes or phases we could adjust.”','“Another contractor is cheaper.” → “Let’s compare scope, quantities, preparation, materials, allowances, exclusions, and terms so you can evaluate the difference.”','“We need to think.” → “Of course. What questions remain, and what would help you feel ready to decide?”','“Can you start right away?” → “I’ll verify availability, selections, deliveries, and any required approvals before confirming a start date.”'],tip:'Acknowledge the concern, ask one clarifying question, then respond with facts. Avoid pressure, invented discounts, or promises about competitors.'},
 {title:'Agree on the next step',say:'“Based on what we reviewed, does this scope fit what you want to accomplish? The next step would be [actual next step]. Would you like to move forward with that, or resolve any remaining questions first?”',checks:['Recap priorities, agreed scope, optional items, and unresolved questions.','Confirm who will provide selections, measurements, assessments, or revisions and by when.','Agree on a specific follow-up date and the homeowner’s preferred contact method.','If proceeding, review the actual written agreement and payment terms before requesting acceptance or payment.'],tip:'Follow-up memo: “Thank you for meeting today. Your priorities are [A/B]. I’m preparing [scope] and confirming [open items]. I’ll send [deliverable] by [date], and we agreed to reconnect on [date/time].”'}
];
const state = {kitchen:new Set(),bathroom:new Set(),general:new Set()};
let current='kitchen';
const script=document.querySelector('#script');
function render(type){
 current=type; const g=guides[type]; const sections=stages(g);
 document.querySelector('#guide-title').textContent=g.title;
 document.querySelectorAll('[data-type]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.type===type)));
 document.querySelector('#flow').innerHTML=sections.map((s,i)=>`<a href="#step-${i}">${String(i+1).padStart(2,'0')} / ${s.title}</a>`).join('');
 script.innerHTML=sections.map((s,i)=>`<article id="step-${i}"><h3><span>${String(i+1).padStart(2,'0')}</span>${s.title}</h3><p class="label">SAY THIS</p><blockquote>${s.say}</blockquote>${s.items?`<p class="label">ASK / DISCUSS</p><ul>${s.items.map(t=>`<li>${t}</li>`).join('')}</ul>`:''}${s.checks?`<p class="label">CONFIRM BEFORE YOU LEAVE</p>${s.checks.map((t,j)=>`<label class="check"><input type="checkbox" data-check="${i}-${j}" ${state[type].has(`${i}-${j}`)?'checked':''}><span>${t}</span></label>`).join('')}`:''}<p class="tip">${s.tip}</p></article>`).join('');
}
document.querySelectorAll('[data-type]').forEach(b=>b.addEventListener('click',()=>render(b.dataset.type)));
script.addEventListener('change',e=>{if(e.target.matches('[data-check]')){const key=e.target.dataset.check;e.target.checked?state[current].add(key):state[current].delete(key);}});
document.querySelector('#print').addEventListener('click',()=>window.print());
window.addEventListener('beforeprint',()=>{const n=document.querySelector('#notes');n.style.height='auto';n.style.height=`${n.scrollHeight+10}px`;});
window.addEventListener('afterprint',()=>document.querySelector('#notes').style.height='');
render(current);
