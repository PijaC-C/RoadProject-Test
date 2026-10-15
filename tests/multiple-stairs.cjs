const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../bridge-scope-live/bridge-paint-calculator.html'),'utf8');
let id=0;const context={clampInt:(v,a,b)=>Math.min(b,Math.max(a,Number(v)||0)),ensureSurveyState:s=>s.survey??={},syncSurveyRecords:()=>{},make:(type,n,side)=>({id:++id,type,side}),pendingStair:(side,n)=>({id:++id,type:'stair',side}),makeSurveySpan:n=>({id:++id,type:'span'})};vm.createContext(context);
vm.runInContext(html.slice(html.indexOf('function syncLayoutLegacy('),html.indexOf('normalizeState();let activeId=')),context);
for(const count of [0,1,2,4]){const s={layout:{spans:4,columns:0,leftStairs:count,rightStairs:count},components:[],survey:{active:false}};context.syncLayoutLegacy(s);assert.equal(s.components.filter(c=>c.type==='stair').length,count*2);assert.equal(s.components.filter(c=>c.type==='span').length,4);const ids=s.components.map(c=>c.id);context.syncLayoutLegacy(s);assert.deepEqual(s.components.map(c=>c.id),ids,'Reopen must retain all stair IDs');}
const s={layout:{spans:1,columns:0},components:[],survey:{active:false}};context.syncLayoutLegacy(s);assert.equal(s.components.filter(c=>c.type==='stair').length,2,'Existing default unchanged');
console.log('PASS zero, default two, four and eight stairs; repeated normalization preserves components');
