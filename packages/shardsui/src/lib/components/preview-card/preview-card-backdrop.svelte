<script lang="ts">
  import type { AnchoredBackdropState } from '$lib/internal/anchored-state'
  import type { PartProps } from '$lib/internal/types'
  import AnchoredBackdrop from '$lib/internal/anchored-backdrop.svelte'
  import { PreviewCardContext } from './context'

  type Props = PartProps<[AnchoredBackdropState]>

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()

  const previewCard = PreviewCardContext.get()
</script>

<AnchoredBackdrop root={previewCard} pointerEventsNone bind:ref {as} {children} {...rest} />
