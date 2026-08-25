<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import { Combobox } from '$lib/components/combobox'

  type ItemGroup = { value: string; items: string[] }

  let {
    open = $bindable(),
    limit,
    filter,
    groups = [
      { value: 'citrus', items: ['orange', 'lemon', 'lime'] },
      { value: 'berries', items: ['strawberry', 'blueberry', 'raspberry'] }
    ],
    staticItems,
    groupLabel = (group: ItemGroup) => group.value
  }: {
    open?: boolean
    limit?: number
    filter?: ComponentProps<typeof Combobox.Root>['filter']
    groups?: ItemGroup[]
    staticItems?: string[]
    groupLabel?: (group: ItemGroup) => string
  } = $props()
</script>

<Combobox.Root {open} {limit} {filter} items={staticItems ? undefined : groups}>
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
