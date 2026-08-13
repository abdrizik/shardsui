<script lang="ts">
  import { Combobox } from '@shardsui/svelte/combobox'

  type Item = {
    id: string
    name: string
  }

  const ROW_HEIGHT = 32
  const VISIBLE = 12
  const OVERSCAN = 8

  const items: Item[] = Array.from({ length: 10_000 }, (_, i) => {
    const id = String(i + 1)
    return { id, name: `Item ${id.padStart(4, '0')}` }
  })

  const filter = Combobox.createFilter()
  const id = $props.id()

  let inputValue = $state('')

  let scrollEl = $state<HTMLElement | null>(null)
  let scrollTop = $state(0)

  const filteredItems = $derived(
    inputValue.trim() === ''
      ? items
      : items.filter((item) => filter.contains(item.name, inputValue))
  )

  const count = $derived(filteredItems.length)
  const totalHeight = $derived(count * ROW_HEIGHT)
  const start = $derived(Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN))
  const end = $derived(Math.min(count, start + VISIBLE + OVERSCAN * 2))
  const offsetTop = $derived(start * ROW_HEIGHT)
  const slice = $derived(filteredItems.slice(start, end))

  function scrollHighlightedIntoView(
    item: Item | undefined,
    reason: 'keyboard' | 'pointer' | 'none',
    index: number
  ) {
    if (reason === 'pointer') return
    if (!item || !scrollEl) return
    const top = index * ROW_HEIGHT
    const bottom = top + ROW_HEIGHT
    if (top < scrollEl.scrollTop) {
      scrollEl.scrollTop = top
    } else if (bottom > scrollEl.scrollTop + scrollEl.clientHeight) {
      scrollEl.scrollTop = bottom - scrollEl.clientHeight
    }
  }

  function onscroll(event: Event) {
    scrollTop = (event.target as HTMLElement).scrollTop
  }
</script>

<Combobox.Root
  virtualized
  bind:inputValue
  {filteredItems}
  filter={null}
  isItemEqualToValue={(a: Item, b: Item) => a.id === b.id}
  itemToStringLabel={(item) => (item ? item.name : '')}
  onItemHighlighted={scrollHighlightedIntoView}
>
  <div class="relative flex flex-col gap-1 text-sm/5 font-semibold text-gray-900">
    <label for={id}>Search 10,000 items</label>
    <Combobox.InputGroup
      class="relative box-content h-8 w-64 rounded-md border border-gray-200 bg-gray-50 focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-gray-950 [&>input]:pr-8 has-[.combobox-clear]:[&>input]:pr-[calc(0.5rem+1.5rem*2)]"
    >
      <Combobox.Input
        {id}
        class="size-full border-0 bg-transparent pl-2 text-sm font-normal text-gray-900 outline-hidden any-pointer-coarse:text-base"
      />
      <div class="absolute right-1 bottom-0 flex h-8 items-center justify-center text-gray-600">
        <Combobox.Clear
          class="combobox-clear flex h-8 w-6 items-center justify-center rounded bg-transparent p-0"
          aria-label="Clear selection"
        >
          {@render crossIcon()}
        </Combobox.Clear>
        <Combobox.Trigger
          class="flex h-8 w-6 items-center justify-center rounded bg-transparent p-0"
          aria-label="Open popup"
        >
          {@render chevronDownIcon()}
        </Combobox.Trigger>
      </div>
    </Combobox.InputGroup>
  </div>

  <Combobox.Portal>
    <Combobox.Positioner class="outline-hidden" sideOffset={4}>
      <Combobox.Popup
        class="max-h-[min(22rem,var(--available-height))] w-(--anchor-width) max-w-(--available-width) rounded-md bg-gray-50 text-gray-900 shadow-lg outline-1 outline-gray-200"
      >
        <Combobox.Empty>
          <div class="px-2 py-3 text-sm/4 text-gray-600">No results found.</div>
        </Combobox.Empty>
        <Combobox.List class="p-0">
          <div
            role="presentation"
            bind:this={scrollEl}
            class="h-[min(22.5rem,var(--total-size))] max-h-(--available-height) scroll-py-1 overflow-auto overscroll-contain"
            style:--total-size="{totalHeight}px"
            {onscroll}
          >
            <div role="presentation" class="relative w-full" style:height="{totalHeight}px">
              <div role="presentation" class="absolute inset-x-0" style:top="{offsetTop}px">
                {#each slice as item, i (item.id)}
                  <Combobox.Item
                    index={start + i}
                    value={item}
                    aria-setsize={count}
                    aria-posinset={start + i + 1}
                    class="grid grid-cols-[1rem_1fr] items-center gap-2 py-2 pr-2 pl-2.5 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
                    style="height:{ROW_HEIGHT}px;"
                  >
                    <Combobox.ItemIndicator class="col-start-1">
                      {@render checkIcon()}
                    </Combobox.ItemIndicator>
                    <span class="col-start-2">{item.name}</span>
                  </Combobox.Item>
                {/each}
              </div>
            </div>
          </div>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>

{#snippet crossIcon()}
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="size-4">
    <path
      d="M6.25 6.25L17.75 17.75M17.75 6.25L6.25 17.75"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
{/snippet}

{#snippet chevronDownIcon()}
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="size-4">
    <path
      d="M5.75 9.5L12 15.75L18.25 9.5"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}

{#snippet checkIcon()}
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="size-4">
    <path
      d="M6 14.15L10.0321 18L18 7"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}
