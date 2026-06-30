<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let { open = $bindable(), statusText = 'Searching...' } = $props()
</script>

<Combobox.Root {open}>
  <Combobox.Input data-testid="input" placeholder="Search..." />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.Status data-testid="status">{statusText}</Combobox.Status>
        <Combobox.List data-testid="list">
          <Combobox.Item value="apple">Apple</Combobox.Item>
          <Combobox.Item value="banana">Banana</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
