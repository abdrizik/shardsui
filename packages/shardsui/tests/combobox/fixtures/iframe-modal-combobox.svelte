<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
</script>

<Combobox.Root modal open items={['Apple', 'Banana']}>
  <Combobox.InputGroup data-testid="group">
    <Combobox.Input data-testid="input" aria-label="Combobox input" />
    <Combobox.Trigger data-testid="trigger">Open</Combobox.Trigger>
  </Combobox.InputGroup>
  <Combobox.Portal>
    <Combobox.Positioner data-testid="positioner">
      <Combobox.Popup data-testid="popup">
        <Combobox.List>
          <Combobox.Item value="Apple">Apple</Combobox.Item>
          <Combobox.Item value="Banana">Banana</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
