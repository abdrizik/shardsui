<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { ToastPositionerContext, type ToastArrowState } from './context'
  import PositionerArrow from '$lib/internal/positioner-arrow.svelte'

  type Props = PartProps<[ToastArrowState]>

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()

  const positioner = ToastPositionerContext.get()
</script>

<PositionerArrow {positioner} bind:ref {as} {children} {...rest} />
