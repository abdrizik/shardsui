<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    value = $bindable(),
    onChipClick = undefined as ((event: MouseEvent) => void) | undefined,
    onRemoveClick = undefined as ((event: MouseEvent) => void) | undefined
  } = $props()
</script>

<Combobox.Root multiple {value}>
  <Combobox.Chips data-testid="chips">
    {#each value as chip (chip)}
      <Combobox.Chip data-testid="chip" onclick={onChipClick}>
        {chip}
        <Combobox.ChipRemove data-testid="remove" onclick={onRemoveClick} />
      </Combobox.Chip>
    {/each}
    <Combobox.Input data-testid="input" placeholder="Search..." />
  </Combobox.Chips>
</Combobox.Root>
