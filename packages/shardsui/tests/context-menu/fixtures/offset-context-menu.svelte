<script lang="ts">
  import { ContextMenu } from '$lib/components/context-menu'

  let {
    onOpenChange = undefined,
    disabled = false,
    side = undefined,
    align = undefined,
    sideOffset = undefined,
    alignOffset = undefined
  }: {
    onOpenChange?: (open: boolean) => void
    disabled?: boolean
    side?: 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end'
    align?: 'start' | 'center' | 'end'
    sideOffset?: number
    alignOffset?: number
  } = $props()
</script>

<ContextMenu.Root {onOpenChange} {disabled}>
  <ContextMenu.Trigger data-testid="context-trigger">Surface</ContextMenu.Trigger>
  <ContextMenu.Portal>
    <ContextMenu.Positioner
      data-testid="context-positioner"
      {side}
      {align}
      {sideOffset}
      {alignOffset}
    >
      <ContextMenu.Popup data-testid="context-popup">
        <ContextMenu.Item data-testid="context-item">Action</ContextMenu.Item>
      </ContextMenu.Popup>
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>
