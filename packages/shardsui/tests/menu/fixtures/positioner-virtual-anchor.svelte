<script lang="ts">
  import { Menu } from '$lib/components/menu'
  import type { VirtualAnchorElement } from '$lib/internal/floating/anchor-positioning.svelte'

  let { anchor }: { anchor: VirtualAnchorElement } = $props()
</script>

<Menu.Root open>
  <Menu.Portal>
    <Menu.Positioner side="bottom" align="start" {anchor} arrowPadding={0} data-testid="positioner">
      <Menu.Popup>
        <Menu.Item>1</Menu.Item>
        <Menu.Item>2</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
