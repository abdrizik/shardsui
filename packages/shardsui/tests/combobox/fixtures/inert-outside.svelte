<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let { open = $bindable() } = $props()
</script>

<div>
  <button data-testid="outside">Outside</button>
  <Combobox.Root items={['Apple', 'Banana']} {open}>
    <Combobox.Input data-testid="input" />
    <Combobox.Trigger data-testid="trigger">Open</Combobox.Trigger>
    <Combobox.Portal>
      <Combobox.Positioner>
        <Combobox.Popup data-testid="popup">
          <Combobox.List>
            <Combobox.Item value="Apple">Apple</Combobox.Item>
            <Combobox.Item value="Banana">Banana</Combobox.Item>
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
</div>
