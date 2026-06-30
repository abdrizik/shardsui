<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let anchor = $state<HTMLDivElement | null>(null)
</script>

<div style="margin: 50px;">
  <Menu.Root open>
    <Menu.Portal>
      <Menu.Positioner
        side="bottom"
        align="start"
        {anchor}
        arrowPadding={0}
        data-testid="positioner"
      >
        <Menu.Popup>
          <Menu.Item>1</Menu.Item>
          <Menu.Item>2</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
  <div bind:this={anchor} data-testid="anchor" style="margin-top: 100px;"></div>
</div>
