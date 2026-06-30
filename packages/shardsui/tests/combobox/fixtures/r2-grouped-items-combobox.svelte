<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  type ItemGroup = { value: string; items: string[] }

  let {
    open = $bindable(),
    limit = undefined as number | undefined,
    filter = undefined as ((item: unknown, query: string) => boolean) | null | undefined,
    groups = [
      { value: 'citrus', items: ['orange', 'lemon', 'lime'] },
      { value: 'berries', items: ['strawberry', 'blueberry', 'raspberry'] }
    ] as ItemGroup[],
    staticItems = undefined as string[] | undefined,
    groupLabel = (group: ItemGroup) => group.value
  } = $props()
</script>

<Combobox.Root
  {open}
  {limit}
  filter={filter as never}
  items={staticItems ? (undefined as never) : (groups as never)}
>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.List data-testid="list">
          {#if staticItems}
            {#each staticItems as item (item)}
              <Combobox.Item value={item}>{item}</Combobox.Item>
            {/each}
          {:else}
            <Combobox.Collection>
              {#snippet children(group: ItemGroup)}
                <Combobox.Group items={group.items}>
                  <Combobox.GroupLabel>{groupLabel(group)}</Combobox.GroupLabel>
                  <Combobox.Collection>
                    {#snippet children(item: string)}
                      <Combobox.Item value={item}>{item}</Combobox.Item>
                    {/snippet}
                  </Combobox.Collection>
                </Combobox.Group>
              {/snippet}
            </Combobox.Collection>
          {/if}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
