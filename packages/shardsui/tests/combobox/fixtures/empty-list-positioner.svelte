<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  let {
    open = $bindable(true),
    items = [] as readonly unknown[],
    withEmpty = false
  }: {
    open?: boolean
    items?: readonly unknown[]
    withEmpty?: boolean
  } = $props()
</script>

<Combobox.Root {open} items={items as never}>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner data-testid="positioner">
      <Combobox.Popup data-testid="popup">
        <ItemsList />
        {#if withEmpty}
          <Combobox.Empty data-testid="empty">No results.</Combobox.Empty>
        {/if}
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
