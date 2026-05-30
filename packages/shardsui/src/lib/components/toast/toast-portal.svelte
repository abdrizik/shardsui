<script lang="ts">
  import type { Snippet } from 'svelte'
  import { portalTo } from '$lib/internal/floating/portal'

  type Props = {
    ref?: HTMLDivElement | null
    container?: HTMLElement | null
    children?: Snippet
  }

  let { ref = $bindable(null), container, children }: Props = $props()
</script>

<div bind:this={ref} {@attach portalTo(container)} data-shards-ui-portal>
  {@render children?.()}
</div>
