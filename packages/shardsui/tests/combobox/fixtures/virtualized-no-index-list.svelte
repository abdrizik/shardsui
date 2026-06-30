<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let { items }: { items: string[] } = $props()
</script>

<Combobox.List data-testid="list">
  {#each items as item (item)}
    <Combobox.Item value={item}>{item}</Combobox.Item>
  {/each}
</Combobox.List>
