import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {orchestrate} from './engine.js';
const args=process.argv.slice(2);
const option=(name,fallback)=>{const n=args.indexOf(name);return n>=0?args[n+1]:fallback};
const fixture=resolve(option('--fixtures','fixtures/signals.json'));
const policyFile=resolve(option('--policy','policy.json'));
const output=resolve(option('--out','outputs/run.json'));
try {
 const signals=JSON.parse(await readFile(fixture,'utf8'));
 const policy=JSON.parse(await readFile(policyFile,'utf8'));
 const workspace=JSON.parse(await readFile(resolve(option('--workspace','fixtures/workspace.json')),'utf8'));
 const triggerType=option('--trigger','schedule');
 const trigger=triggerType==='webhook'?{type:'webhook',eventType:option('--event-type','synthetic.feedback.received')}:{type:'schedule',expression:option('--expression','daily-review')};
 const report=orchestrate(signals,policy,workspace,trigger,option('--project','meal-choice-demo'));
 await mkdir(dirname(output),{recursive:true});
 await writeFile(output,JSON.stringify(report,null,2)+'\n');
 console.log(`Dry-run ${report.runId}: ${report.summary.reviewReady} ready for human review, ${report.summary.humanOnly} human-only, ${report.summary.needsInfo} needs-info; illustrative cost $${report.summary.estimatedUsd}. Output: ${output}`);
} catch(error) {console.error(error.message);process.exitCode=1;}
