<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'

  let {
    open = $bindable(false),
    onOpenChangeComplete = undefined,
    animated = false
  }: {
    open?: boolean
    onOpenChangeComplete?: (open: boolean) => void
    animated?: boolean
  } = $props()
</script>

<button onclick={() => (open = !open)}>Toggle</button>
<Tooltip.Root bind:open {onOpenChangeComplete}>
  <Tooltip.Portal>
    <Tooltip.Positioner>
      <Tooltip.Popup class={animated ? 'anim-popup' : undefined} data-testid="popup" />
    </Tooltip.Positioner>
  </Tooltip.Portal>
</Tooltip.Root>

<style>
  @keyframes tip-enter {
    from {
      opacity: 0;
    }
  }
  @keyframes tip-exit {
    to {
      opacity: 0;
    }
  }
  :global(.anim-popup[data-starting-style]) {
    animation: tip-enter 1ms;
  }
  :global(.anim-popup[data-ending-style]) {
    animation: tip-exit 1ms;
  }
</style>
