<script lang="ts">
  import { Menu } from '$lib/components/menu'
  import { Menubar } from '$lib/components/menubar'

  let {
    disabled = false,
    loopFocus = true,
    orientation = 'horizontal',
    outside = false
  }: {
    disabled?: boolean
    loopFocus?: boolean
    orientation?: 'horizontal' | 'vertical'
    outside?: boolean
  } = $props()
</script>

<div>
  <Menubar data-testid="menubar-root" style="display: flex" {disabled} {loopFocus} {orientation}>
    <Menu.Root>
      <Menu.Trigger data-testid="file-trigger">File</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner data-testid="file-menu">
          <Menu.Popup>
            <Menu.Item data-testid="file-item-1">Open</Menu.Item>
            <Menu.Item data-testid="file-item-2">Save</Menu.Item>
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger data-testid="share-trigger">Share</Menu.SubmenuTrigger>
              <Menu.Portal>
                <Menu.Positioner data-testid="share-menu">
                  <Menu.Popup>
                    <Menu.Item data-testid="share-item-1">Email</Menu.Item>
                    <Menu.Item data-testid="share-item-2">Print</Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.SubmenuRoot>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>

    <Menu.Root>
      <Menu.Trigger data-testid="edit-trigger">Edit</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner data-testid="edit-menu">
          <Menu.Popup>
            <Menu.Item data-testid="edit-item-1">Copy</Menu.Item>
            <Menu.Item data-testid="edit-item-2">Paste</Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>

    <Menu.Root>
      <Menu.Trigger data-testid="view-trigger">View</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner data-testid="view-menu">
          <Menu.Popup>
            <Menu.Item data-testid="view-item-1">Zoom In</Menu.Item>
            <Menu.Item data-testid="view-item-2">Zoom Out</Menu.Item>
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger data-testid="layout-trigger">Layout</Menu.SubmenuTrigger>
              <Menu.Portal>
                <Menu.Positioner data-testid="layout-menu">
                  <Menu.Popup>
                    <Menu.RadioGroup value="single">
                      <Menu.RadioItem value="single" data-testid="layout-item-1">
                        Single column
                      </Menu.RadioItem>
                      <Menu.RadioItem value="two" data-testid="layout-item-2">
                        Two columns
                      </Menu.RadioItem>
                    </Menu.RadioGroup>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.SubmenuRoot>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  </Menubar>
  {#if outside}
    <button data-testid="outside">Outside</button>
  {/if}
</div>
