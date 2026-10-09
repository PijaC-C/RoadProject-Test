const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'../bridge-scope-live');
const context={window:{}};vm.createContext(context);
for(const name of ['bridge-work-catalog.js','survey-round4-data.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),context);
const data=context.window.BRIDGE_ROUND4_DATA;
assert.equal(data.bridges.length,95);
assert.equal(new Set(data.bridges.map(b=>b.code)).size,95);
assert.equal(new Set(data.bridges.map(b=>b.project)).size,16);
assert.equal(Object.keys(data.round2).length,17);
assert.equal(data.bridges.filter(b=>b.priceSource==='round3').length,36);
assert.equal(data.bridges.filter(b=>b.priceSource==='way2').length,13);
assert.equal(data.bridges.filter(b=>b.priceSource==='pending').length,29);
const catalog=new Map([...context.window.BRIDGE_WORK_CATALOG,...data.extraCatalog].map(item=>[item.id,item]));
for(const [code,b] of Object.entries(data.round2)){
  assert.ok(data.bridges.some(x=>x.code===code));
  assert.ok(Math.abs(b.items.reduce((s,i)=>s+i.amount,0)-b.total)<0.001);
  for(const item of b.items){assert.ok(catalog.has(item.id),item.name);assert.ok(item.quantity>=0);assert.equal(item.factor,1.266);}
}
for(const b of data.bridges){assert.ok(b.project&&b.name);assert.equal(b.lat===null,b.lng===null);if(b.lat!==null){assert.ok(Math.abs(b.lat)<=90&&Math.abs(b.lng)<=180);}}
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const fn=source.slice(source.indexOf('function factorWorkRow('),source.indexOf('function estimateRows('));
vm.runInContext('const ROUND4=true, WORK_FACTOR_F=1.226;'+fn,context);
const factor=context.factorWorkRow;
assert.equal(factor({quantity:2,rate:100}).amount,245.2);
assert.equal(factor({quantity:2,rate:100,factor:1.266}).amount,253.2);
assert.equal(factor({quantity:2,rate:100,factor:1.266,amount:253.19}).amount,253.19,'Preserve historical rounding');
assert.equal(factor({quantity:0,rate:100,factor:1.266,amount:0}).amount,0);
assert.match(source,/ROUND4\?'bridge_scope_round4_records':'bridge_scope_records_v3'/);
assert.match(source,/ROUND4\?'bridge-survey-round4-records':'bridge-survey-202609-records'/);
const calculator=fs.readFileSync(path.join(root,'bridge-paint-calculator.html'),'utf8');
assert.match(calculator,/ROUND4_CALC\?'bridge-survey-round4-calculator-':'bridge-survey-202609-calculator-'/);
console.log('PASS round4 dataset, BR/project uniqueness, provenance, item mapping, price factors/rounding/zero, isolated database and browser storage namespaces.');
