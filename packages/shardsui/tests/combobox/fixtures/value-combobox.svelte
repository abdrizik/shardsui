<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    value = $bindable(),
    multiple = false,
    placeholder = undefined as string | undefined
  } = $props()
</script>

<Combobox.Root {value} {multiple}>
  <Combobox.Trigger data-testid="trigger">
    <Combobox.Value {placeholder} />
  </Combobox.Trigger>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.List data-testid="list">
          <Combobox.Item value="apple">Apple</Combobox.Item>
          <Combobox.Item value="banana">Banana</Combobox.Item>
          <Combobox.Item value="cherry">Cherry</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
