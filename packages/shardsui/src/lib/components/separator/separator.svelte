<script lang="ts">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { Orientation, PartProps } from '$lib/internal/types'

  type Props = Omit<PartProps, 'children'> & {
    orientation?: Orientation
  }

  let { as = 'div', ref = $bindable(null), orientation = 'horizontal', ...rest }: Props = $props()

  const stateAttrs = $derived(dataAttrs({ orientation }))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  role="separator"
  aria-orientation={orientation}
  {...rest}
/>
