// Run with PLAYWRIGHT_MODULE pointing at an installed Playwright package; no database writes.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 for(const [width,height] of [[1440,900],[1024,768],[768,700],[390,844],[320,568]]){
  const page=await browser.newPage({viewport:{width,height}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(process.env.APP_URL||'http://127.0.0.1:4173/bridge-scope-live/?survey=4');
  await page.waitForFunction(()=>document.querySelector('#mi').textContent==='53');
  if(width<=720){await page.locator('#menu').click();await page.waitForTimeout(250)}
  const listBefore=await page.locator('#list').boundingBox();
  await page.locator('#projectPicker summary').click();
  assert.deepEqual(await page.locator('#list').boundingBox(),listBefore,'Project picker shifts list');
  const options=await page.locator('.project-options').boundingBox();assert.ok(options.y+options.height<=height,'Project options outside viewport');
  await page.locator('#projectPicker summary').click();await page.locator('#q').fill('BR742');await page.locator('[data-c="BR742"]').click();
  const frame=page.frameLocator('#calcFrame');await frame.locator('.scope-check').first().waitFor();await page.waitForTimeout(250);
  const overflow=await frame.locator('.scope-table').evaluate(table=>[...table.querySelectorAll('.scope-qty,.scope-note')].filter(input=>{const r=input.getBoundingClientRect(),cell=input.closest('td').getBoundingClientRect();return r.left<cell.left||r.right>cell.right}).map(input=>input.dataset.workQuantity||input.dataset.workNote));
  assert.deepEqual(overflow,[],'Quantity/note inputs overlap adjacent table cells');
  const footer=await page.locator('.pf').boundingBox();
  await page.locator('#saveStatus').evaluate(el=>el.textContent='กำลังโหลดแบบสำรวจ…');
  assert.deepEqual(await page.locator('.pf').boundingBox(),footer,'Save status shifts footer');
  await page.locator('.pb').evaluate(el=>el.scrollTop=el.scrollHeight);
  await frame.locator('.scope-table-wrap').evaluate(el=>el.scrollLeft=200);
  const before=await frame.locator('.scope-table-wrap').evaluate(el=>({x:el.scrollLeft,y:window.scrollY}));
  // Invoke the checkbox change at the same scroll position to exclude intentional focus scrolling.
  await frame.locator('[data-work-enabled="work-electrical-repair"]').evaluate(el=>{el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}))});
  const after=await frame.locator('.scope-table-wrap').evaluate(el=>({x:el.scrollLeft,y:window.scrollY}));assert.deepEqual(after,before,'Work rerender shifts scroll');
  for(const id of ['close','save','onePdf']){const r=await page.locator('#'+id).boundingBox();assert.ok(r.x>=0&&r.x+r.width<=width+1&&r.y+r.height<=height+1,id+' outside viewport')}
  await page.locator('#close').click();if(width<=720){await page.locator('#menu').click();await page.waitForTimeout(250)}
  await page.locator('[data-c="BR742"]').click();assert.equal(await page.locator('.pb').evaluate(el=>el.scrollTop),0,'New bridge inherits scroll');
  await page.locator('#close').click();await page.locator('#projectSummary').click();assert.equal(await page.locator('#summaryDialog').isVisible(),true);await page.locator('#closeSummary').click();
  assert.deepEqual(errors,[]);console.log('PASS stable layout',width+'x'+height,'project list, footer, calculator scroll, reopen, summary, no JS errors; NO DB writes');await page.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
