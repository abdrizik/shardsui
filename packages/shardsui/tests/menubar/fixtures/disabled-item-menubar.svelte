<script lang="ts">
  import { Menubar } from '$lib/components/menubar'
  import { Menu } from '$lib/components/menu'

  let { open = false, onItemClick }: { open?: boolean; onItemClick?: (event: MouseEvent) => void } =
    $props()
</script>

<Menubar disabled>
  <Menu.Root {open}>
    <Menu.Trigger data-testid="file-trigger">File</Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner>
        <Menu.Popup>
          <Menu.Item data-testid="file-item" onclick={(event) => onItemClick?.(event)}>
            Open
          </Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
</Menubar>
