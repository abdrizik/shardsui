<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    open = $bindable(true),
    value = $bindable(),
    autoHighlight = false,
    items = ['apple', 'banana', 'cherry']
  }: {
    open?: boolean
    value?: string[] | null
    autoHighlight?: boolean
    items?: string[]
  } = $props()
</script>

<Combobox.Root multiple {open} {value} {autoHighlight} {items}>
  <Combobox.Chips data-testid="chips">
    <Combobox.Value>
      {#snippet children(selected)}
        {@const chips = (selected ?? []) as string[]}
        {#each chips as chip (chip)}
          <Combobox.Chip data-testid="chip-{chip}">
            {chip}
            <Combobox.ChipRemove data-testid="remove-{chip}" aria-label="Remove {chip}" />
          </Combobox.Chip>
        {/each}
        <Combobox.Input data-testid="input" />
      {/snippet}
    </Combobox.Value>
  </Combobox.Chips>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.List data-testid="list">
          {#each items as item (item)}
            <Combobox.Item value={item}>{item}</Combobox.Item>
          {/each}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
