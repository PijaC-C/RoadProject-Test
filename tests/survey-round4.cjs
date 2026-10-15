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
assert.equal(data.bridges.find(b=>b.code==='BR004').externalPriceSource,'ทาง 2');
assert.equal(data.bridges.find(b=>b.code==='BR706').externalPriceSource,'ทางสะพาน');
const missing=data.bridges.filter(b=>b.priceSource==='pending');
assert.equal(missing.filter(b=>Number.isFinite(b.lat)&&Number.isFinite(b.lng)).length,29,'Every pending survey has a map marker');
const verifiedCoordinates={BR004:[13.74915651,100.5165535],BR706:[13.77830019,100.4771558],BR742:[13.8498238,100.8037365],BR743:[13.851946,100.8102204],BR744:[13.8522806,100.8128659],BR745:[13.8524001,100.8150167],BR746:[13.8454481,100.7953135],BR747:[13.8368079,100.7796742],BR748:[13.8332125,100.7740117],BR749:[13.8291713,100.767927],BR758:[13.7320449,100.5455445],BR759:[13.7368461,100.5390698]};
for(const [code,[lat,lng]] of Object.entries(verifiedCoordinates)){
  const b=data.bridges.find(b=>b.code===code);
  assert.equal(b.lat,lat,code);assert.equal(b.lng,lng,code);
  assert.ok(b.name!==code&&b.road&&b.district!=='ไม่ระบุเขต',code+' has verified location metadata');
  assert.match(b.sourceRef,/2570\.xlsx/);
}
assert.match(data.bridges.find(b=>b.code==='BR706').project,/พระนครและสัมพันธวงศ์/,'Preserve the project until the user confirms its correction');
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
const savedCodes=new Set(),knownCodes=new Set();
context.done=code=>savedCodes.has(code);context.baseline=code=>knownCodes.has(code)?{}:null;
vm.runInContext("const projectLabel=b=>b.project||'สะพานที่เพิ่มเอง';"+source.slice(source.indexOf('const hasSurveyData='),source.indexOf('function renderProjectSelection()')),context);
const filter=context.matchesFilters,b={code:'BR004',name:'สะพาน ทดสอบ',road:'ทดสอบ',district:'จตุจักร',project:'โครงการ ก',priceSource:'pending'};
assert.equal(filter(b,'','',true,new Set(['โครงการ ก'])),true);
assert.equal(filter(b,'','',true,new Set()),false,'No selected projects means no results');
assert.equal(filter(b,'','',true,new Set(['โครงการ ข'])),false);
assert.equal(filter(b,'br004','จตุจักร',true,new Set(['โครงการ ก','โครงการ ข'])),true);
assert.equal(filter(b,'not found','',false,new Set(['โครงการ ก'])),false);
assert.equal(filter({...b,priceSource:'way2'},'','',true,new Set(['โครงการ ก'])),false,'Way2 survey data is not missing');
assert.equal(filter({...b,externalPriceSource:'ทาง 2'},'','',true,new Set(['โครงการ ก'])),false,'BR004 has an external price source');
assert.equal(filter({...b,externalPriceSource:'ทางสะพาน'},'','',true,new Set(['โครงการ ก'])),false,'BR706 has an external price source');
context.R={};context.legacyReady=true;context.m=String;
vm.runInContext(source.slice(source.indexOf('function priceStatus('),source.indexOf('// Keep this in sync')),context);
assert.match(context.priceStatus(data.bridges.find(b=>b.code==='BR004')),/มีราคาจากทาง 2.*ยังไม่ได้นำเข้ายอด/);
assert.match(context.priceStatus(data.bridges.find(b=>b.code==='BR706')),/มีราคาจากทางสะพาน.*ยังไม่ได้นำเข้ายอด/);
savedCodes.add(b.code);assert.equal(filter(b,'','',true,new Set(['โครงการ ก'])),false);savedCodes.clear();
knownCodes.add(b.code);assert.equal(filter(b,'','',true,new Set(['โครงการ ก'])),false);
console.log('PASS round4 dataset, BR/project uniqueness, provenance, item mapping, price factors/rounding/zero, isolated database and browser storage namespaces.');
