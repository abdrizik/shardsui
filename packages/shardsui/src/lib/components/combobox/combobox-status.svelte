<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { initialLiveRegionTextMutation } from './initial-live-region-text-mutation'

  type Props = PartProps

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {@attach initialLiveRegionTextMutation}
  role="status"
  aria-live="polite"
  aria-atomic="true"
  {...rest}
>
  {@render children?.()}
</svelte:element>
