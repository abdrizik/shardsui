<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    open = $bindable(),
    value = $bindable(),
    onValueChange = undefined,
    onInputValueChange = undefined,
    withEmpty = false,
    grid = false
  } = $props()
</script>

<Combobox.Root inline {grid} {open} {value} {onValueChange} {onInputValueChange}>
  <Combobox.Input data-testid="input" />
  <Combobox.List data-testid="list">
    <Combobox.Item value="apple">Apple</Combobox.Item>
    <Combobox.Item value="banana">Banana</Combobox.Item>
  </Combobox.List>
  {#if withEmpty}
    <Combobox.Empty data-testid="empty">No results</Combobox.Empty>
  {/if}
</Combobox.Root>
