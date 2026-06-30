<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    open = $bindable(),
    value = $bindable(),
    onValueChange = undefined,
    groupLabelId = undefined as string | undefined
  } = $props()
</script>

<Combobox.Root {open} {value} {onValueChange}>
  <Combobox.Input data-testid="input" placeholder="Search..." />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.List data-testid="list">
          <Combobox.Group data-testid="group-fruits">
            <Combobox.GroupLabel id={groupLabelId} data-testid="group-label-fruits"
              >Fruits</Combobox.GroupLabel
            >
            <Combobox.Item value="apple">Apple</Combobox.Item>
            <Combobox.Item value="banana">Banana</Combobox.Item>
          </Combobox.Group>
          <Combobox.Group data-testid="group-vegetables">
            <Combobox.GroupLabel data-testid="group-label-vegetables"
              >Vegetables</Combobox.GroupLabel
            >
            <Combobox.Item value="carrot">Carrot</Combobox.Item>
            <Combobox.Item value="spinach">Spinach</Combobox.Item>
          </Combobox.Group>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
