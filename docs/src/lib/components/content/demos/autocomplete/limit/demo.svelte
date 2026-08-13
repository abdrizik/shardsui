<script lang="ts">
  import { Autocomplete } from '@shardsui/svelte/autocomplete'

  const limit = 5

  const tags = [
    'Accessible Components',
    'Animation Principles',
    'ARIA in Practice',
    'Color & Contrast',
    'Component API Design',
    'CSS Architecture',
    'Dark Mode',
    'Data Visualization',
    'Design Critique',
    'Design Handoff',
    'Design Systems Foundations',
    'Design Tokens',
    'Fluid Typography',
    'Forms & Validation',
    'Grid Systems',
    'Icon Design',
    'Intro to Typography',
    'Layout & Grids',
    'Motion & Animation',
    'Performance for Frontend',
    'Prototyping in Figma',
    'Responsive Design',
    'Semantic HTML',
    'State & Data Flow',
    'SVG & Vector',
    'Type Scales',
    'UX Writing',
    'Visual Hierarchy',
    'Web Animation',
    'WCAG Essentials'
  ]

  const filter = Autocomplete.createFilter()

  let value = $state('')

  const matchCount = $derived(tags.filter((tag) => filter.contains(tag, value)).length)
  const hiddenCount = $derived(Math.max(0, matchCount - limit))
</script>

<Autocomplete.Root items={tags} bind:value {limit}>
  <label class="flex flex-col gap-1 text-sm/5 font-semibold text-gray-900">
    Search tags
    <Autocomplete.Input
      placeholder="e.g. design"
      class="h-8 w-64 rounded-md border border-gray-200 bg-gray-50 px-2 text-sm font-normal text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-gray-950 any-pointer-coarse:text-base"
    />
  </label>

  <Autocomplete.Portal>
    <Autocomplete.Positioner class="outline-hidden" sideOffset={4}>
      <Autocomplete.Popup
        class="max-h-[min(var(--available-height),22.5rem)] w-(--anchor-width) max-w-(--available-width) scroll-py-1 overflow-y-auto overscroll-contain rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline-1 outline-gray-200"
      >
        <Autocomplete.Empty>
          <div class="py-2 pr-4 pl-2 text-sm/4 text-gray-600">No results found for "{value}"</div>
        </Autocomplete.Empty>
        <Autocomplete.List>
          <Autocomplete.Collection>
            {#snippet children(tag: string)}
              <Autocomplete.Item
                value={tag}
                class="flex py-2 pr-2 pl-2.5 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
              >
                {tag}
              </Autocomplete.Item>
            {/snippet}
          </Autocomplete.Collection>
        </Autocomplete.List>
        <Autocomplete.Status>
          {#if hiddenCount > 0}
            <div class="mt-1 py-2 pr-4 pl-2 text-sm/5 text-gray-600">
              {hiddenCount} more hidden — keep typing to narrow the list.
            </div>
          {/if}
        </Autocomplete.Status>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>
