<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    value = $bindable(),
    onValueChange,
    open = $bindable(),
    disabled = false,
    readOnly = false,
    chips = [],
    removeAs = 'button'
  }: {
    value?: string[] | null
    onValueChange?: (value: unknown) => void
    open?: boolean
    disabled?: boolean
    readOnly?: boolean
    chips?: string[]
    removeAs?: 'button' | 'div'
  } = $props()
</script>

<Combobox.Root multiple {value} {onValueChange} {open} {disabled} {readOnly}>
  <Combobox.Chips data-testid="chips">
    {#each chips as chip (chip)}
      <Combobox.Chip data-testid="chip-{chip}">
        {chip}
        <Combobox.ChipRemove as={removeAs} data-testid="remove-{chip}" />
      </Combobox.Chip>
    {/each}
    <Combobox.Input data-testid="input" placeholder="Search..." />
  </Combobox.Chips>
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
