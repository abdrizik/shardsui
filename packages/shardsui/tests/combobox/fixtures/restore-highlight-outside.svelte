<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  let {
    items = ['apple', 'banana', 'cherry'] as readonly unknown[],
    value = $bindable(),
    open = $bindable(false),
    multiple = false,
    autoHighlight = false,
    keepMounted = false,
    controlled = false
  } = $props()
</script>

<Combobox.Root
  items={items as never}
  bind:value={
    () => value,
    (next: unknown) => {
      if (!controlled) value = next
    }
  }
  bind:open
  {multiple}
  {autoHighlight}
>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal {keepMounted}>
    <Combobox.Positioner>
      <Combobox.Popup>
        <ItemsList />
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
