<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let { value = $bindable(['apple']) } = $props()
</script>

<Combobox.Root multiple items={['apple', 'banana']} bind:value>
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
      {/snippet}
    </Combobox.Value>
  </Combobox.Chips>
  <Combobox.Trigger data-testid="trigger">Open</Combobox.Trigger>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.Input data-testid="input" />
        <Combobox.List data-testid="list">
          <Combobox.Item value="apple">apple</Combobox.Item>
          <Combobox.Item value="banana">banana</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
