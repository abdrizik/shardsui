<script lang="ts">
  import type { Orientation, PartProps } from '$lib/internal/types'

  type Props = Omit<PartProps, 'children'> & {
    orientation?: Orientation
  }

  let { as = 'div', ref = $bindable(null), orientation = 'horizontal', ...rest }: Props = $props()
</script>

<svelte:element
  this={as}
  bind:this={ref}
  data-orientation={orientation}
  role="presentation"
  {...rest}
/>
