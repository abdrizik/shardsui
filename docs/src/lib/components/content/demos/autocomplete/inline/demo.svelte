<script lang="ts">
  import { Autocomplete } from '@shardsui/svelte/autocomplete'

  const topics = [
    'Kerning',
    'Contrast ratio',
    'Flexbox',
    'Focus state',
    'Easing',
    'Design tokens',
    'Grid',
    'Semantic HTML'
  ]
</script>

<Autocomplete.Root items={topics} mode="both">
  <label class="flex flex-col gap-1 text-sm/5 font-semibold text-gray-900">
    Pick a topic to learn
    <Autocomplete.Input
      placeholder="e.g. Flexbox"
      class="h-8 w-64 rounded-md border border-gray-200 bg-gray-50 px-2 text-sm font-normal text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-gray-950 any-pointer-coarse:text-base"
    />
  </label>

  <Autocomplete.Portal>
    <Autocomplete.Positioner class="outline-hidden data-empty:hidden" sideOffset={4}>
      <Autocomplete.Popup
        class="max-h-92 w-(--anchor-width) max-w-(--available-width) rounded-md bg-gray-50 text-gray-900 shadow-lg outline-1 outline-gray-200"
      >
        <Autocomplete.List
          class="max-h-[min(22.5rem,var(--available-height))] scroll-py-1 overflow-y-auto overscroll-contain py-1 outline-0"
        >
          <Autocomplete.Collection>
            {#snippet children(topic: string)}
              <Autocomplete.Item
                value={topic}
                class="flex items-center gap-2 py-2 pr-2 pl-2.5 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
              >
                {topic}
              </Autocomplete.Item>
            {/snippet}
          </Autocomplete.Collection>
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>
