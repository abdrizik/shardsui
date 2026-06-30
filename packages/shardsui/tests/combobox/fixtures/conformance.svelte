<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let { open = undefined, popupId = undefined }: { open?: boolean; popupId?: string } = $props()
</script>

<Combobox.Root {open}>
  <Combobox.Input data-testid="trigger" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.List id={popupId} data-testid="popup">
          <Combobox.Item value="item">Item</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
