<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let { id }: { id?: string } = $props()
</script>

<Combobox.Root {id}>
  <Combobox.Label data-testid="label">Food</Combobox.Label>
  <Combobox.Trigger data-testid="trigger">Open</Combobox.Trigger>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.Input data-testid="input" />
        <Combobox.List data-testid="list">
          <Combobox.Item value="a">a</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
