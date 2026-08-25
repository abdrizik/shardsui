<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  let { open = true, items = ['apple'] }: { open?: boolean; items?: string[] } = $props()
</script>

<Combobox.Root multiple inline {open} {items}>
  <Combobox.Input data-testid="inline-input" />
  <Combobox.Trigger>Toggle</Combobox.Trigger>
  <ItemsList />
</Combobox.Root>
