<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let items = $state(['apple'])
</script>

<div>
  <Combobox.Root inline open {items}>
    <Combobox.Input data-testid="input" />
    <Combobox.List data-testid="list">
      {#each items as item (item)}
        <Combobox.Item value={item}>{item}</Combobox.Item>
      {/each}
    </Combobox.List>
  </Combobox.Root>
  <button type="button" onclick={() => (items = [])}>remove items</button>
</div>
