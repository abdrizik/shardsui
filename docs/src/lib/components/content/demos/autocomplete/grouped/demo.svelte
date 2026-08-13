<script lang="ts">
  import { Autocomplete } from '@shardsui/svelte/autocomplete'

  type Subject = {
    value: string
    items: string[]
  }

  const subjects: Subject[] = [
    { value: 'Design', items: ['Kerning', 'Type scale', 'Negative space'] },
    { value: 'Frontend', items: ['HTML', 'CSS', 'JavaScript'] },
    { value: 'Accessibility', items: ['aria-label', 'Focus state', 'Contrast ratio'] }
  ]
</script>

<Autocomplete.Root items={subjects}>
  <label class="flex flex-col gap-1 text-sm/5 font-semibold text-gray-900">
    Find a topic
    <Autocomplete.Input
      placeholder="e.g. CSS"
      class="h-8 w-64 rounded-md border border-gray-200 bg-gray-50 px-2 text-sm font-normal text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-gray-950 any-pointer-coarse:text-base"
    />
  </label>

  <Autocomplete.Portal>
    <Autocomplete.Positioner class="outline-hidden" sideOffset={4}>
      <Autocomplete.Popup
        class="max-h-90 w-(--anchor-width) max-w-(--available-width) rounded-md bg-gray-50 text-gray-900 shadow-lg outline-1 outline-gray-200"
      >
        <Autocomplete.Empty>
          <div class="py-4 pr-4 pl-2 text-sm/4 text-gray-600">No topics found.</div>
        </Autocomplete.Empty>
        <Autocomplete.List
          class="max-h-[min(22.5rem,var(--available-height))] scroll-pt-9 scroll-pb-1 overflow-y-auto overscroll-contain outline-0"
        >
          <Autocomplete.Collection>
            {#snippet children(subject: Subject)}
              <Autocomplete.Group items={subject.items} class="block pb-2">
                <Autocomplete.GroupLabel
                  class="sticky top-0 z-1 mr-2 w-[calc(100%-0.5rem)] bg-gray-50 px-2 pt-2 pb-1 text-xs font-semibold tracking-wider uppercase"
                >
                  {subject.value}
                </Autocomplete.GroupLabel>
                <Autocomplete.Collection>
                  {#snippet children(topic)}
                    <Autocomplete.Item
                      value={topic}
                      class="flex items-center gap-2 py-2 pr-2 pl-2.5 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
                    >
                      {topic}
                    </Autocomplete.Item>
                  {/snippet}
                </Autocomplete.Collection>
              </Autocomplete.Group>
            {/snippet}
          </Autocomplete.Collection>
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>
