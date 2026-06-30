<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  let { open = true, items = ['apple'] as string[] } = $props()
</script>

<Combobox.Root multiple inline {open} items={items as never}>
  <Combobox.Input data-testid="inline-input" />
  <Combobox.Trigger>Toggle</Combobox.Trigger>
  <ItemsList />
</Combobox.Root>
