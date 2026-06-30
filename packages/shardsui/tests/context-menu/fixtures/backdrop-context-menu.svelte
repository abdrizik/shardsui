<script lang="ts">
  import { ContextMenu } from '$lib/components/context-menu'
</script>

<ContextMenu.Root open>
  <ContextMenu.Trigger data-testid="trigger">Right-click me</ContextMenu.Trigger>
  <ContextMenu.Portal>
    <ContextMenu.Backdrop data-testid="backdrop" />
    <ContextMenu.Positioner>
      <ContextMenu.Popup />
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>
