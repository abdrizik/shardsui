<script lang="ts">
  import type { AnchoredBackdropState } from '$lib/internal/anchored-state'
  import type { PartProps } from '$lib/internal/types'
  import AnchoredBackdrop from '$lib/internal/anchored-backdrop.svelte'
  import { ComboboxContext } from './context'

  type Props = PartProps<[AnchoredBackdropState]>

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()

  const combobox = ComboboxContext.get()
</script>

<AnchoredBackdrop root={combobox} bind:ref {as} {children} {...rest} />
