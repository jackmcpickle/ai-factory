// Synthetic dry-run domain model. Projects are the isolation boundary; people and teams are global.
export function validateWorkspace({users,teams,projects}) {
  const ids = values => new Set(values.map(value => value.id));
  const userIds = ids(users), teamIds = ids(teams), projectIds = ids(projects);
  if (userIds.size !== users.length || teamIds.size !== teams.length || projectIds.size !== projects.length) throw new Error('Duplicate identity');
  for (const team of teams) {
    if (!team.members.every(id => userIds.has(id))) throw new Error('Unknown team member');
  }
  for (const project of projects) {
    if (!project.id || !project.synthetic || !Array.isArray(project.assignedUsers) || !Array.isArray(project.assignedTeams) || !Array.isArray(project.loops)) throw new Error('Invalid project');
    if (!project.assignedUsers.every(id => userIds.has(id)) || !project.assignedTeams.every(id => teamIds.has(id))) throw new Error('Unknown project assignment');
    if (new Set(project.loops.map(loop => loop.id)).size !== project.loops.length) throw new Error('Duplicate loop');
    for (const loop of project.loops) {
      if (!loop.id || !loop.agentRole || !['schedule','webhook'].includes(loop.trigger?.type)) throw new Error('Invalid loop trigger');
      if (loop.trigger.type === 'schedule' && !loop.trigger.expression) throw new Error('Missing schedule expression');
      if (loop.trigger.type === 'webhook' && !loop.trigger.eventType) throw new Error('Missing webhook event type');
    }
  }
  return {userIds,teamIds,projectIds};
}

export function dispatch({workspace,projectId,trigger,signalIds}) {
  const {projectIds}=validateWorkspace(workspace);
  if (!projectIds.has(projectId)) throw new Error('Unknown project');
  const project=workspace.projects.find(item=>item.id===projectId);
  const matched=project.loops.filter(loop=>loop.trigger.type===trigger.type && (trigger.type==='schedule' ? loop.trigger.expression===trigger.expression : loop.trigger.eventType===trigger.eventType));
  // A dispatch matches only loops belonging to the named project, never loops on another project.
  return matched.map(loop=>({projectId,loopId:loop.id,agentRole:loop.agentRole,trigger:{...trigger},signalIds:[...signalIds],execution:'simulated',sideEffects:false}));
}
