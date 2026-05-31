<script lang="ts">
  import type { AnchoredBackdropState } from '$lib/internal/anchored-state'
  import type { PartProps } from '$lib/internal/types'
  import AnchoredBackdrop from '$lib/internal/anchored-backdrop.svelte'
  import { NavigationMenuContext } from './context'

  type Props = PartProps<[AnchoredBackdropState]>

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()

  const navigationMenu = NavigationMenuContext.get()
</script>

<AnchoredBackdrop root={navigationMenu} bind:ref {as} {children} {...rest} />
