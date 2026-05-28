<script lang="ts">
  import { DelayGroup } from './delay-group.svelte'
  import type { Snippet } from 'svelte'
  import { TooltipProviderContext } from './context'

  type Props = {
    delay?: number
    closeDelay?: number
    timeout?: number
    children?: Snippet
  }

  let { delay, closeDelay, timeout = 400, children }: Props = $props()

  const delayGroup = new DelayGroup(() => ({
    delay: { open: delay, close: closeDelay },
    timeoutMs: timeout
  }))

  TooltipProviderContext.set({
    get delay() {
      return delay
    },
    delayGroup
  })
</script>

{@render children?.()}
