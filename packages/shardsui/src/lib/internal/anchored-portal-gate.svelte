<script lang="ts">
  import type { Snippet } from 'svelte'
  import { AnchoredPortalContext } from '$lib/internal/anchored-portal'
  import { portalTo } from '$lib/internal/floating/portal'

  type Props = {
    ref?: HTMLDivElement | null
    container?: HTMLElement | null
    shouldRender: boolean
    children?: Snippet
  }

  let { ref = $bindable(null), container, shouldRender, children }: Props = $props()

  AnchoredPortalContext.set(true)
</script>

{#if shouldRender}
  <div bind:this={ref} {@attach portalTo(container)} data-shards-ui-portal>
    {@render children?.()}
  </div>
{/if}
