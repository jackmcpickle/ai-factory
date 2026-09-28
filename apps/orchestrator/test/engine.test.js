import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {orchestrate,safetyGate} from '../src/engine.js';
import {dispatch} from '../../../packages/contracts/src.js';
const signals=JSON.parse(readFileSync('fixtures/signals.json'));
const policy=JSON.parse(readFileSync('policy.json'));
const workspace=JSON.parse(readFileSync('fixtures/workspace.json'));
const run=(items,rule)=>orchestrate(items,rule,workspace);
test('deterministic multi-team trace and human release gate',()=>{
 const a=run(signals,policy),b=run(signals,policy);
 assert.deepEqual(a,b);assert.deepEqual(Object.keys(a.teams).sort(),['app','platform','safety']);
 assert.equal(a.summary.reviewReady,2);assert.equal(a.summary.humanOnly,2);assert.equal(a.summary.needsInfo,1);
 assert.equal(a.summary.releaseApproved,false);assert.ok(a.events.every((event,i)=>event.sequence===i+1));
 assert.ok(a.outcomes.every(o=>!o.customerCommitment&&!o.releaseApproved));
});
test('policy live change: app work becomes human-only',()=>{
 const altered={...policy,humanOnlyTags:[...policy.humanOnlyTags,'ui'],version:'demo-v2'};
 const changedRun=run(signals,altered);
 assert.equal(changedRun.outcomes.find(o=>o.id==='SIG-001').status,'human_only');
 assert.equal(changedRun.summary.reviewReady,1);
});
test('safety gate fails closed on missing evidence, mismatch and replay',()=>{
 const authority={flightId:'SYNTH-001',passengerToken:'synthetic-token',mealId:'M1',catalogueVersion:'v1',dietaryAttributes:['none'],inventoryAvailable:true,beforeCutoff:true,bookingActive:true,idempotencyKey:'fake-1'};
 const candidate={flightId:'SYNTH-001',mealId:'M1',dietaryAttributes:['none']};
 assert.equal(safetyGate(candidate,authority,policy).decision,'ELIGIBLE_FOR_HUMAN_REVIEW');
 assert.equal(safetyGate(candidate,{...authority,dietaryAttributes:['nut-free']},policy).decision,'HUMAN_ONLY');
 assert.equal(safetyGate(candidate,{...authority,duplicateIdempotencyKey:true},policy).decision,'HUMAN_ONLY');
 assert.equal(safetyGate(candidate,{...authority,inventoryAvailable:false},policy).decision,'HUMAN_ONLY');
 assert.equal(safetyGate(candidate,{...authority,idempotencyKey:null},policy).decision,'HUMAN_ONLY');
 assert.equal(safetyGate(candidate,authority,policy).commitmentExecuted,false);
});
test('non-synthetic input rejected',()=>assert.throws(()=>run([{...signals[0],synthetic:false}],policy),/non-synthetic/));
test('checks fail and do not become release approval',()=>{
 const changed={...signals[0],checks:{repro:true,contract:true,negative:false}};
 assert.equal(run([changed],policy).outcomes[0].status,'quality_failed');
});

test('projects own isolated loops, while users and teams exist outside them',()=>{
 const schedule=run(signals,policy);
 assert.equal(schedule.tenancyBoundary,'project');
 assert.equal(schedule.projectId,'meal-choice-demo');
 assert.deepEqual(schedule.loopDispatches.map(item=>item.loopId),['daily-discovery']);
 const webhook=orchestrate(signals,policy,workspace,{type:'webhook',eventType:'synthetic.feedback.received'});
 assert.deepEqual(webhook.loopDispatches.map(item=>item.loopId),['feedback-intake']);
 const other=dispatch({workspace,projectId:'separate-sandbox',trigger:{type:'webhook',eventType:'synthetic.feedback.received'},signalIds:[]});
 assert.deepEqual(other.map(item=>item.loopId),['other-intake']);
 assert.ok(other.every(item=>item.projectId==='separate-sandbox'&&!item.sideEffects));
 assert.throws(()=>orchestrate(signals,policy,workspace,{type:'schedule',expression:'daily-review'},'separate-sandbox'),/Team not assigned/);
});
test('invalid project assignments fail closed',()=>{
 const invalid=structuredClone(workspace);invalid.projects[0].assignedTeams=['missing-team'];
 assert.throws(()=>orchestrate(signals,policy,invalid),/Unknown project assignment/);
});
