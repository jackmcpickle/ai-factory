import type { ReactElement } from 'react'
import { EditorPage } from '@/components/editor-frame'
import { AGENT_ID, AgentUsageReadout } from '@/modules/dashboard'
import { RuleForm } from '@/modules/rules/components/RuleForm'
import { RuleList } from '@/modules/rules/components/RuleList'

export function RulesView(): ReactElement {
  return (
    <EditorPage
      title="Rules"
      lede="Write a plain-language rule, keep it in the list, and run it. Each rule is aimed at the app on all pull requests. Running records a mock pull-request result on this page. No engine is called."
    >
      <AgentUsageReadout agentId={AGENT_ID.rules} />
      <RuleForm />
      <RuleList />
    </EditorPage>
  )
}
