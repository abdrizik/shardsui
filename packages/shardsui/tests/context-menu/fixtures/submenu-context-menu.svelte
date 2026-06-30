<script lang="ts">
  import { ContextMenu } from '$lib/components/context-menu'

  let {
    rootOnOpenChange = undefined,
    submenuOnOpenChange = undefined,
    submenuOpen = true,
    submenuOpenOnHover = true
  }: {
    rootOnOpenChange?: (open: boolean) => void
    submenuOnOpenChange?: (open: boolean) => void
    submenuOpen?: boolean
    submenuOpenOnHover?: boolean
  } = $props()
</script>

<ContextMenu.Root onOpenChange={rootOnOpenChange}>
  <ContextMenu.Trigger data-testid="context-trigger">Surface</ContextMenu.Trigger>
  <ContextMenu.Portal>
    <ContextMenu.Positioner>
      <ContextMenu.Popup data-testid="context-root-popup">
        <ContextMenu.SubmenuRoot open={submenuOpen} onOpenChange={submenuOnOpenChange}>
          <ContextMenu.SubmenuTrigger
            delay={1}
            openOnHover={submenuOpenOnHover}
            data-testid="context-submenu-trigger"
          >
            More options
          </ContextMenu.SubmenuTrigger>
          <ContextMenu.Portal>
            <ContextMenu.Positioner>
              <ContextMenu.Popup data-testid="context-submenu-popup">
                <ContextMenu.Item data-testid="context-submenu-item">Deep action</ContextMenu.Item>
              </ContextMenu.Popup>
            </ContextMenu.Positioner>
          </ContextMenu.Portal>
        </ContextMenu.SubmenuRoot>
      </ContextMenu.Popup>
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>
