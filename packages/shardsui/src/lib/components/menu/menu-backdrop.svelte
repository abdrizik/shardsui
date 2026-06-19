<script lang="ts">
  import type { AnchoredBackdropState } from '$lib/internal/anchored-state'
  import type { PartProps } from '$lib/internal/types'
  import { attachElement } from '$lib/internal/attach-element'
  import AnchoredBackdrop from '$lib/internal/anchored-backdrop.svelte'
  import { REASONS } from '$lib/internal/reasons'
  import { MenuContext } from './context'

  type Props = PartProps<[AnchoredBackdropState]>

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()

  const menu = MenuContext.get()
</script>

<AnchoredBackdrop
  root={menu}
  pointerEventsNone={menu.openChangeReason === REASONS.triggerHover}
  bind:ref
  {as}
  {children}
  {@attach attachElement((el) => (menu.backdropElement = el))}
  {...rest}
/>
