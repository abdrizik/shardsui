<script lang="ts">
  import type { AnchoredBackdropState } from '$lib/internal/anchored-state'
  import type { PartProps } from '$lib/internal/types'
  import AnchoredBackdrop from '$lib/internal/anchored-backdrop.svelte'
  import { PopoverContext } from './context'
  import { REASONS } from '$lib/internal/reasons'

  type Props = PartProps<[AnchoredBackdropState]>

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()

  const popover = PopoverContext.get()
</script>

<AnchoredBackdrop
  root={popover}
  pointerEventsNone={popover.openChangeReason === REASONS.triggerHover}
  bind:ref
  {as}
  {children}
  {...rest}
/>
