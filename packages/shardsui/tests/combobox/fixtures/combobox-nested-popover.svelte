<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { Popover } from '$lib/components/popover'

  let { open = $bindable(true) } = $props()
</script>

<Combobox.Root bind:open>
  <Combobox.Trigger>Open</Combobox.Trigger>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.Input />
        <Combobox.List>
          <Combobox.Item value="apple">Apple</Combobox.Item>
        </Combobox.List>
        <Popover.Root>
          <Popover.Trigger>Open nested popover</Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner>
              <Popover.Popup>
                <button type="button">Nested focusable content</button>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
