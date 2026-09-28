import {createHash} from 'node:crypto';
import {validateWorkspace,dispatch} from '../../../packages/contracts/src.js';

const sha = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const clone = obj => JSON.parse(JSON.stringify(obj));

export function validate(signal, policy) {
  if (!signal || !policy || !signal.id || !signal.kind || !signal.team || !Array.isArray(signal.tags)) throw new Error('Invalid signal or policy');
  if (!signal.synthetic) throw new Error('Demo refuses non-synthetic input');
  if (typeof signal.title !== 'string' || signal.title.length > 200) throw new Error('Invalid title');
  if (!signal.checks || !signal.estimatedTokens || !Number.isFinite(signal.estimatedTokens.input) || !Number.isFinite(signal.estimatedTokens.output)) throw new Error('Missing checks or token estimate');
}

export function estimateCost(signal, policy) {
  const {input, output} = signal.estimatedTokens;
  return Number(((input * policy.modelPricingUsdPerMillionTokens.input + output * policy.modelPricingUsdPerMillionTokens.output) / 1_000_000).toFixed(6));
}

export function safetyGate(candidate, authoritative, policy) {
  const failures = [];
  for (const key of ['flightId','passengerToken','mealId','catalogueVersion','dietaryAttributes','inventoryAvailable','beforeCutoff','bookingActive','idempotencyKey']) {
    if (authoritative?.[key] === undefined || authoritative?.[key] === null || authoritative?.[key] === '') failures.push(`missing ${key}`);
  }
  if (candidate?.mealId !== authoritative?.mealId) failures.push('meal mismatch');
  if (candidate?.flightId !== authoritative?.flightId) failures.push('flight mismatch');
  if (candidate?.dietaryAttributes && JSON.stringify(candidate.dietaryAttributes) !== JSON.stringify(authoritative?.dietaryAttributes)) failures.push('dietary mismatch');
  if (authoritative?.inventoryAvailable !== true || authoritative?.beforeCutoff !== true || authoritative?.bookingActive !== true) failures.push('not available for commitment');
  if (authoritative?.duplicateIdempotencyKey === true) failures.push('replay detected');
  // This is a dry-run decision only. Even a passing validation cannot commit or approve a release.
  return {decision:failures.length ? 'HUMAN_ONLY' : 'ELIGIBLE_FOR_HUMAN_REVIEW', failures, commitmentExecuted:false, policyVersion:policy.version};
}

function route(signal, policy, cost) {
  if (signal.tags.some(tag => policy.humanOnlyTags.includes(tag))) return ['human_only','safety-critical tag'];
  if (!policy.eligibleKinds.includes(signal.kind)) return ['needs_info','unknown kind'];
  if (!signal.reproducible || signal.confidence < 0.8) return ['needs_info','missing reproduction or low confidence'];
  if (cost > policy.maxEstimatedUsdPerRun) return ['human_only','estimated cost cap exceeded'];
  return ['eligible','bounded work candidate'];
}

export function orchestrate(input, policy, workspace, trigger={type:'schedule',expression:'daily-review'}, projectId='meal-choice-demo') {
  validateWorkspace(workspace);
  const project=workspace.projects.find(item=>item.id===projectId);
  if (!project) throw new Error('Unknown project');
  const signals = clone(input); const events = []; const outcomes = []; const seen = new Set();
  const emit = (signal, team, agent, event, detail) => events.push({sequence:events.length+1,signal:signal.id,team,agent,event,detail});
  for (const signal of signals) {
    validate(signal, policy);
    if (!project.assignedTeams.includes(`team-${signal.team}`)) throw new Error(`Team not assigned to project: ${signal.team}`);
    const fingerprint = sha([signal.kind,signal.title,signal.team]);
    if (seen.has(fingerprint)) {emit(signal,signal.team,'collector','deduplicated',fingerprint);continue;}
    seen.add(fingerprint);
    const cost=estimateCost(signal,policy); const [routeName,reason]=route(signal,policy,cost);
    emit(signal,'product','product-discovery','collected',{fingerprint,baseline:signal.baseline,synthetic:true});
    emit(signal,'design','experience-design','journey-proposed',{exceptions:['unavailable meal','cutoff','dietary unknown'],humanOwner:'designer'});
    emit(signal,signal.team,'orchestrator','routed',{route:routeName,reason,policyVersion:policy.version});
    const checks = Object.entries(signal.checks).map(([name,passed])=>({name,passed:Boolean(passed)}));
    let finalStatus=routeName;
    if(routeName==='eligible') {
      emit(signal,signal.team,'bounded-implementation','isolated-proposal',{change:'propose smallest fix in a fresh worktree; no code executed in this simulation',inputHash:sha(signal),retryCap:policy.maxRetries});
      const passing=checks.filter(check=>check.passed).length;
      finalStatus=passing>=policy.minimumPassingChecks && checks.find(check=>check.name==='repro')?.passed && checks.find(check=>check.name==='negative')?.passed ? 'awaiting_human_review':'quality_failed';
      emit(signal,'quality','independent-verification','quality-gate',{checks,passing,required:policy.minimumPassingChecks,finalStatus});
    }
    emit(signal,'operations','rollout-observer','cost-recorded',{estimatedUsd:cost,notMeasured:true,model:'illustrative policy rate'});
    outcomes.push({id:signal.id,team:signal.team,route:routeName,status:finalStatus,reason,checks,estimatedUsd:cost,inputHash:sha(signal),requiredHuman:routeName==='human_only'?'domain and security owner':finalStatus==='awaiting_human_review'?'engineer + QE + release owner':'PM/engineer',releaseApproved:false,customerCommitment:false});
  }
  const loopDispatches=dispatch({workspace,projectId,trigger,signalIds:outcomes.map(item=>item.id)});
  const byTeam=Object.groupBy(outcomes,o=>o.team);
  return {schemaVersion:'2',projectId,tenancyBoundary:'project',loopDispatches,policyVersion:policy.version,runId:sha({signals,policy,projectId,trigger}).slice(0,16),mode:'synthetic dry run; no agent model invoked',teams:Object.fromEntries(Object.entries(byTeam).map(([team,items])=>[team,items.map(i=>i.id)])),events,outcomes,summary:{signals:signals.length,reviewReady:outcomes.filter(o=>o.status==='awaiting_human_review').length,humanOnly:outcomes.filter(o=>o.status==='human_only').length,needsInfo:outcomes.filter(o=>o.status==='needs_info').length,estimatedUsd:Number(outcomes.reduce((sum,o)=>sum+o.estimatedUsd,0).toFixed(6)),releaseApproved:false}};
}
