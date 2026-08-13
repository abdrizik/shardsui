<script lang="ts">
  import { Autocomplete } from '@shardsui/svelte/autocomplete'

  type Item = {
    id: string
    name: string
  }

  const ROW_HEIGHT = 32
  const VISIBLE = 12
  const OVERSCAN = 8

  const items: Item[] = Array.from({ length: 10_000 }, (_, i) => {
    const id = String(i + 1)
    return { id, name: `Item #${id.padStart(5, '0')}` }
  })

  const filter = Autocomplete.createFilter()
  let value = $state('')

  let scrollEl = $state<HTMLElement | null>(null)
  let scrollTop = $state(0)

  const filteredItems = $derived(
    value.trim() === '' ? items : items.filter((item) => filter.contains(item.name, value))
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

<Autocomplete.Root
  virtualized
  bind:value
  {filteredItems}
  filter={null}
  itemToStringValue={(item) => item.name}
  onItemHighlighted={scrollHighlightedIntoView}
>
  <label class="flex flex-col gap-1 text-sm/5 font-semibold text-gray-900">
    Search 10,000 items
    <Autocomplete.Input
      placeholder="Type to filter…"
      class="h-8 w-64 rounded-md border border-gray-200 bg-gray-50 px-2 text-sm font-normal text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-gray-950 any-pointer-coarse:text-base"
    />
  </label>

  <Autocomplete.Portal>
    <Autocomplete.Positioner class="outline-hidden" sideOffset={4}>
      <Autocomplete.Popup
        class="max-h-[min(22.5rem,var(--available-height))] w-(--anchor-width) max-w-(--available-width) rounded-md bg-gray-50 text-gray-900 shadow-lg outline-1 outline-gray-200"
      >
        <Autocomplete.Empty>
          <div class="px-2 py-3 text-sm/4 text-gray-600">No results found.</div>
        </Autocomplete.Empty>
        <Autocomplete.List class="p-0">
          <div
            role="presentation"
            bind:this={scrollEl}
            class="h-[min(22.5rem,var(--total-size))] max-h-(--available-height) overflow-auto overscroll-contain"
            style:--total-size="{totalHeight}px"
            {onscroll}
          >
            <div role="presentation" class="relative w-full" style:height="{totalHeight}px">
              <div role="presentation" class="absolute inset-x-0" style:top="{offsetTop}px">
                {#each slice as item, i (item.id)}
                  <Autocomplete.Item
                    index={start + i}
                    value={item}
                    aria-setsize={count}
                    aria-posinset={start + i + 1}
                    class="flex py-2 pr-2 pl-2.5 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
                    style="height:{ROW_HEIGHT}px;"
                  >
                    {item.name}
                  </Autocomplete.Item>
                {/each}
              </div>
            </div>
          </div>
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>
