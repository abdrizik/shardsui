<script lang="ts">
  import { ContextMenu } from '$lib/components/context-menu'
</script>

<ContextMenu.Root>
  <ContextMenu.Trigger data-testid="outer-trigger">
    outer
    <ContextMenu.Root>
      <ContextMenu.Trigger data-testid="inner-trigger">inner</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner>
          <ContextMenu.Popup data-testid="inner-menu" />
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  </ContextMenu.Trigger>
  <ContextMenu.Portal>
    <ContextMenu.Positioner>
      <ContextMenu.Popup data-testid="outer-menu" />
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>
