<script lang="ts">
  import type { Snippet } from 'svelte'
  import AnchoredPortalGate from '$lib/internal/anchored-portal-gate.svelte'
  import { TooltipContext } from './context'

  type Props = {
    ref?: HTMLDivElement | null
    container?: HTMLElement | null
    keepMounted?: boolean
    children?: Snippet
  }

  let { ref = $bindable(null), container, keepMounted = false, children }: Props = $props()

  const tooltip = TooltipContext.get()
</script>

<AnchoredPortalGate bind:ref {container} shouldRender={tooltip.mounted || keepMounted} {children} />
