<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { AvatarContext, type AvatarRootState } from './context'

  type Props = PartProps<[AvatarRootState], 'span'>

  let { as = 'span', ref = $bindable(null), children, ...rest }: Props = $props()

  const avatar = $state<AvatarRootState>({ imageLoadingStatus: 'idle' })

  AvatarContext.set(avatar)
</script>

<svelte:element this={as} bind:this={ref} {...rest}>
  {@render children?.(avatar)}
</svelte:element>
