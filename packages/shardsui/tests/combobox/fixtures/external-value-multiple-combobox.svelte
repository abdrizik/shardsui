<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  let {
    items = undefined as readonly string[] | undefined,
    staticItems = undefined as string[] | undefined,
    initialValue = [] as string[],
    externalValue = [] as string[]
  } = $props()

  // svelte-ignore state_referenced_locally
  let value = $state<string[]>(initialValue)
</script>

<Combobox.Root items={items as never} multiple bind:value>
  <Combobox.Input data-testid="input" />
  <button type="button" data-testid="clear" onclick={() => (value = [])}>Clear</button>
  <button type="button" data-testid="set-external" onclick={() => (value = externalValue)}>
    Set external
  </button>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        {#if staticItems}
          <Combobox.List>
            {#each staticItems as item (item)}
              <Combobox.Item value={item}>{item}</Combobox.Item>
            {/each}
          </Combobox.List>
        {:else}
          <ItemsList label={(item) => String(item)} />
        {/if}
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
