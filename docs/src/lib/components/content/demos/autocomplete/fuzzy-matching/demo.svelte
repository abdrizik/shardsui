<script lang="ts">
  import { Autocomplete } from '@shardsui/svelte/autocomplete'

  type Item = {
    title: string
    summary: string
  }

  const items: Item[] = [
    { title: 'Grid systems in layout', summary: 'Structure pages with columns and gutters' },
    { title: 'Choosing a type scale', summary: 'Set consistent heading and body sizes' },
    { title: 'Color contrast basics', summary: 'Hit the WCAG contrast ratio' },
    { title: 'Pairing typefaces', summary: 'Match x-height and cap height' },
    { title: 'Spacing and rhythm', summary: 'Use negative space to guide the eye' },
    { title: 'Designing with constraints', summary: 'Turn limits into creative direction' }
  ]

  function fuzzyMatch(text: string, query: string): boolean {
    const haystack = text.toLowerCase()
    const needle = query.toLowerCase()
    let i = 0
    for (let j = 0; j < haystack.length && i < needle.length; j += 1) {
      if (haystack[j] === needle[i]) i += 1
    }
    return i === needle.length
  }

  function fuzzyFilter(item: Item, query: string): boolean {
    const needle = query.trim()
    return fuzzyMatch(item.title, needle) || fuzzyMatch(item.summary, needle)
  }
</script>

<Autocomplete.Root {items} filter={fuzzyFilter} itemToStringValue={(item) => item.title}>
  <label class="flex flex-col gap-1 text-sm/5 font-semibold text-gray-900">
    Search items
    <Autocomplete.Input
      placeholder="e.g. grdsys"
      class="h-8 w-64 rounded-md border border-gray-200 bg-gray-50 px-2 text-sm font-normal text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-gray-950 any-pointer-coarse:text-base"
    />
  </label>

  <Autocomplete.Portal>
    <Autocomplete.Positioner class="outline-hidden" sideOffset={4}>
      <Autocomplete.Popup
        class="max-h-[min(var(--available-height),28rem)] w-(--anchor-width) max-w-(--available-width) scroll-py-2 overflow-y-auto overscroll-contain rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline-1 outline-gray-200"
      >
        <Autocomplete.Empty>
          <div class="py-3 pr-4 pl-2 text-sm/4 text-gray-600">
            No results found for "<Autocomplete.Value />"
          </div>
        </Autocomplete.Empty>
        <Autocomplete.List class="flex flex-col">
          <Autocomplete.Collection>
            {#snippet children(item: Item)}
              <Autocomplete.Item
                value={item}
                class="flex flex-col gap-1 py-3 pr-2 pl-2.5 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-200"
              >
                <span class="leading-5 font-semibold">{item.title}</span>
                <span class="text-sm/5 text-gray-600">{item.summary}</span>
              </Autocomplete.Item>
            {/snippet}
          </Autocomplete.Collection>
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>
