<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    value = $bindable(),
    keepMounted = false,
    items = ['apple', 'apricot', 'banana'] as string[]
  } = $props()
</script>

<Combobox.Root bind:value>
  <Combobox.Trigger data-testid="trigger">
    <Combobox.Value />
  </Combobox.Trigger>
  <Combobox.Portal {keepMounted}>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.List>
          {#each items as item (item)}
            <Combobox.Item value={item}>{item}</Combobox.Item>
          {/each}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
