<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    value = $bindable(),
    open = $bindable(),
    disabled = false,
    readOnly = false,
    onValueChange = undefined,
    keepMounted = false,
    multiple = false
  } = $props()
</script>

<Combobox.Root {multiple} {value} {open} {disabled} {readOnly} {onValueChange}>
  {#if multiple}
    <Combobox.Chips data-testid="chips">
      <Combobox.Value>
        {#snippet children(selected)}
          {@const chips = (selected ?? []) as string[]}
          {#each chips as chip (chip)}
            <Combobox.Chip data-testid="chip-{chip}">{chip}</Combobox.Chip>
          {/each}
        {/snippet}
      </Combobox.Value>
      <Combobox.Input data-testid="input" placeholder="Search..." />
    </Combobox.Chips>
  {:else}
    <Combobox.Input data-testid="input" placeholder="Search..." />
  {/if}
  <Combobox.Clear data-testid="clear" {keepMounted} {disabled} />
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
