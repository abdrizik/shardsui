<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    open = $bindable(),
    items = ['alpha', 'beta', 'alpine']
  }: { open?: boolean; items?: string[] } = $props()
</script>

<Combobox.Root {items} {open}>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.List data-testid="list">
          <Combobox.Collection>
            {#snippet children(item: string)}
              <Combobox.Item value={item} data-testid="item-{item}">{item}</Combobox.Item>
            {/snippet}
          </Combobox.Collection>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
