<script lang="ts">
  import { Autocomplete } from '@shardsui/svelte/autocomplete'

  type Page = {
    title: string
    section: string
  }

  const pages: Page[] = [
    { title: 'Kerning and tracking', section: 'Typography' },
    { title: 'Building a color ramp', section: 'Color' },
    { title: 'Grid vs. flexbox', section: 'Layout' },
    { title: 'Focus states and keyboard nav', section: 'Accessibility' },
    { title: 'Naming design tokens', section: 'Tokens' },
    { title: 'Easing and duration', section: 'Motion' },
    { title: 'Fluid typography', section: 'Responsive' },
    { title: 'Color scales', section: 'Data viz' },
    { title: 'ARIA in practice', section: 'Accessibility' },
    { title: 'Skeleton loading states', section: 'Performance' }
  ]

  const filter = Autocomplete.createFilter()

  async function searchPages(query: string): Promise<{ pages: Page[]; error: string | null }> {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 400 + 200))
    if (query === 'error') {
      return { pages: [], error: 'Could not reach the server. Please try again.' }
    }
    return {
      pages: pages.filter(
        (page) => filter.contains(page.title, query) || filter.contains(page.section, query)
      ),
      error: null
    }
  }

  let value = $state('')
  let results = $state<Page[]>([])
  let error = $state<string | null>(null)
  let pending = $state(false)

  let requestId = 0

  async function search(query: string) {
    const id = ++requestId

    if (!query) {
      results = []
      error = null
      pending = false
      return
    }

    pending = true
    error = null

    const result = await searchPages(query)
    if (id !== requestId) return

    results = result.pages
    error = result.error
    pending = false
  }

  const status = $derived.by(() => {
    if (error) return error
    if (!value) return null
    if (results.length === 0) return `No results match "${value}".`
    return `${results.length} ${results.length === 1 ? 'result' : 'results'} found`
  })
</script>

<Autocomplete.Root
  items={results}
  filter={null}
  itemToStringValue={(page: Page) => page.title}
  bind:value
  onValueChange={search}
>
  <label class="flex flex-col gap-1 text-sm/5 font-semibold text-gray-900">
    Search pages
    <Autocomplete.Input
      placeholder="e.g. Kerning"
      class="h-8 w-64 rounded-md border border-gray-200 bg-gray-50 px-2 text-sm font-normal text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-gray-950 any-pointer-coarse:text-base"
    />
  </label>

  <Autocomplete.Portal>
    <Autocomplete.Positioner class="outline-hidden" sideOffset={4} align="start">
      <Autocomplete.Popup
        aria-busy={pending || undefined}
        class="max-h-[min(var(--available-height),22.5rem)] w-(--anchor-width) max-w-(--available-width) scroll-py-1 overflow-y-auto overscroll-contain rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline-1 outline-gray-200"
      >
        <Autocomplete.Status>
          {#if pending}
            <div class="flex items-center gap-2 py-1 pr-8 pl-2 text-sm text-gray-600">
              <div
                class="size-3 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600"
                aria-hidden="true"
              ></div>
              Searching…
            </div>
          {:else if status}
            <div class="py-1 pr-8 pl-2 text-sm text-gray-600">{status}</div>
          {/if}
        </Autocomplete.Status>
        <Autocomplete.List>
          <Autocomplete.Collection>
            {#snippet children(page: Page)}
              <Autocomplete.Item
                value={page}
                class="flex py-2 pr-2 pl-2.5 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
              >
                <span class="flex w-full flex-col gap-1">
                  <span class="leading-5 font-semibold">{page.title}</span>
                  <span class="text-sm/4 opacity-80">{page.section}</span>
                </span>
              </Autocomplete.Item>
            {/snippet}
          </Autocomplete.Collection>
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>
