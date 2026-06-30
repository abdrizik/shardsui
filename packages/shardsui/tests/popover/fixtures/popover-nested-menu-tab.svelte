<script lang="ts">
  import { Menu } from '$lib/components/menu'
  import { Popover } from '$lib/components/popover'
</script>

<div>
  <Popover.Root open>
    <Popover.Trigger data-testid="trigger">Toggle</Popover.Trigger>
    <Popover.Portal keepMounted>
      <Popover.Positioner data-testid="positioner">
        <Popover.Popup data-testid="popover-popup">
          <button type="button" data-testid="before">Before</button>
          <Menu.Root>
            <Menu.Trigger data-testid="menu-trigger">Menu</Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner>
                <Menu.Popup data-testid="menu-popup">
                  <Menu.Item>Item</Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
          <button type="button" data-testid="after">After</button>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
</div>
