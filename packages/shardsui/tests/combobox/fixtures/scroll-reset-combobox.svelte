<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  let {
    variant = 'list',
    items = Array.from({ length: 50 }, (_, index) => `item-${index}`)
  }: {
    variant?: 'list' | 'wrapper' | 'clip' | 'dialog' | 'inline-dialog'
    items?: string[]
  } = $props()

  let dialogElement = $state<HTMLElement | null>(null)
</script>

{#if variant === 'inline-dialog'}
  <Combobox.Root {items} inline open>
    <div
      role="dialog"
      data-testid="dialog"
      style="height: 80px; overflow-y: auto; overflow-anchor: none;"
    >
      <div style="height: 100px"></div>
      <Combobox.Input data-testid="input" />
      <div data-testid="viewport" style="height: 100px; overflow-y: auto;">
        <ItemsList />
      </div>
    </div>
  </Combobox.Root>
{:else if variant === 'dialog'}
  <Combobox.Root {items} open>
    <div
      bind:this={dialogElement}
      role="dialog"
      data-testid="dialog"
      style="height: 80px; overflow-y: auto; overflow-anchor: none;"
    >
      <div style="height: 100px"></div>
      <Combobox.Input data-testid="input" />
      <Combobox.Portal container={dialogElement}>
        <Combobox.Positioner>
          <Combobox.Popup>
            <ItemsList />
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </div>
  </Combobox.Root>
{:else}
  <Combobox.Root {items}>
    <Combobox.Input data-testid="input" />
    <Combobox.Portal>
      <Combobox.Positioner>
        <Combobox.Popup>
          {#if variant === 'wrapper'}
            <div data-testid="viewport" style="max-height: 100px; overflow-y: auto;">
              <Combobox.List data-testid="list" style="overflow-y: auto;">
                {#each items as item (item)}
                  <Combobox.Item value={item}>{item}</Combobox.Item>
                {/each}
              </Combobox.List>
            </div>
          {:else if variant === 'clip'}
            <div data-testid="viewport" style="height: 100px; overflow-y: auto;">
              <div style="overflow-y: clip;">
                <Combobox.List data-testid="list">
                  {#each items as item (item)}
                    <Combobox.Item value={item}>{item}</Combobox.Item>
                  {/each}
                </Combobox.List>
              </div>
            </div>
          {:else}
            <Combobox.List data-testid="list" style="max-height: 100px; overflow-y: auto;">
              {#each items as item (item)}
                <Combobox.Item value={item}>{item}</Combobox.Item>
              {/each}
            </Combobox.List>
          {/if}
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
{/if}
