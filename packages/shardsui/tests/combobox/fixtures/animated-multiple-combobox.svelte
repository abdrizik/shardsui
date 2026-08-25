<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  let { open = $bindable(), multiple = true } = $props()
</script>

<Combobox.Root {multiple} items={['apple', 'apricot', 'banana']} {open}>
  <Combobox.Trigger data-testid="trigger">
    <Combobox.Value />
  </Combobox.Trigger>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup" class="animation-test-popup" aria-label="Fruits">
        <Combobox.Input data-testid="input" />
        <Combobox.Empty data-testid="empty">No matches</Combobox.Empty>
        <ItemsList />
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>

<style>
  @keyframes combobox-close-test {
    to {
      opacity: 0;
    }
  }

  :global(.animation-test-popup[data-ending-style]) {
    animation: combobox-close-test 100ms linear;
  }
</style>
