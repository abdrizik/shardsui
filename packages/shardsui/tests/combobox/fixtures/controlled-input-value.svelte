<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let inputValue = $state('')
</script>

<Combobox.Root {inputValue} onInputValueChange={(next: string) => (inputValue = next)}>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.List>
          <Combobox.Item value="apple">apple</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
