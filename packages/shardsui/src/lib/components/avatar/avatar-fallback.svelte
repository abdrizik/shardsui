<script lang="ts">
  import { Timeout } from '$lib/internal/timeout'
  import type { PartProps } from '$lib/internal/types'
  import { AvatarContext, type AvatarRootState } from './context'

  type Props = PartProps<[AvatarRootState], 'span'> & {
    delay?: number
  }

  let { as = 'span', ref = $bindable(null), delay = 0, children, ...rest }: Props = $props()

  const avatar = AvatarContext.get()
  let delayPassed = $state(false)
  const delayTimeout = new Timeout()

  $effect(() => {
    if (delay > 0) {
      delayTimeout.start(delay, () => (delayPassed = true))
    } else {
      delayPassed = true
    }
    return delayTimeout.clear
  })

  const visible = $derived(avatar.imageLoadingStatus !== 'loaded' && (delay <= 0 || delayPassed))
</script>

{#if visible}
  <svelte:element this={as} bind:this={ref} {...rest}>
    {@render children?.(avatar)}
  </svelte:element>
{/if}
