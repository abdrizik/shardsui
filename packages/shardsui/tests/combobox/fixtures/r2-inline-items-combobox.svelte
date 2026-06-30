<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  let { open = true, items = ['Apple', 'Apricot', 'Banana', 'Grape', 'Orange'] as string[] } =
    $props()
</script>

<Combobox.Root items={items as never} {open} inline>
  <Combobox.Input data-testid="input" />
  <ItemsList />
</Combobox.Root>
