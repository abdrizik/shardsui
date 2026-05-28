import type { Side } from '@floating-ui/utils'
import type { FloatingContextData } from './types'

type PublishCloseGuardContextOptions = {
  data: FloatingContextData
  enabled?: boolean
  side: Side
  domReference: Element | null
  floating: HTMLElement | null
  nodeId?: string | undefined
}

export function publishCloseGuardContext(options: () => PublishCloseGuardContextOptions): void {
  $effect(() => {
    const data = options().data
    if (options().enabled === false) return
    data.closeGuardContext = {
      side: options().side,
      elements: { domReference: options().domReference, floating: options().floating },
      nodeId: options().nodeId
    }
    return () => {
      data.closeGuardContext = undefined
    }
  })
}
