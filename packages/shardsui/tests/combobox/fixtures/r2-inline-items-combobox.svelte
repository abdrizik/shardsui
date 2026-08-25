<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  let {
    open = true,
    items = ['Apple', 'Apricot', 'Banana', 'Grape', 'Orange']
  }: { open?: boolean; items?: string[] } = $props()
</script>

<Combobox.Root {items} {open} inline>
  <Combobox.Input data-testid="input" />
  <ItemsList />
</Combobox.Root>
