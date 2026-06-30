<script lang="ts">
  import { ContextMenu } from '$lib/components/context-menu'

  let container = $state<HTMLElement | null>(null)
</script>

<ContextMenu.Root open>
  <ContextMenu.Trigger data-testid="trigger">
    Right-click me
    <div bind:this={container}></div>
  </ContextMenu.Trigger>
  <ContextMenu.Portal {container}>
    <ContextMenu.Positioner>
      <ContextMenu.Popup data-testid="popup" />
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>
