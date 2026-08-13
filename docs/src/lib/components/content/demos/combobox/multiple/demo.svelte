<script lang="ts">
  import { Combobox } from '@shardsui/svelte/combobox'

  type Topic = {
    id: string
    value: string
  }

  const id = $props.id()

  const topics: Topic[] = [
    { id: 'kerning', value: 'Kerning' },
    { id: 'contrast-ratio', value: 'Contrast ratio' },
    { id: 'flexbox', value: 'Flexbox' },
    { id: 'focus-state', value: 'Focus state' },
    { id: 'easing', value: 'Easing' },
    { id: 'design-tokens', value: 'Design tokens' }
  ]

  let value = $state<Topic[]>([])
</script>

<Combobox.Root
  multiple
  items={topics}
  bind:value
  isItemEqualToValue={(a: Topic, b: Topic) => a.id === b.id}
>
  <div class="flex max-w-md flex-col gap-1 text-sm/5 font-semibold text-gray-900">
    <label for={id}>Topics</label>
    <Combobox.InputGroup
      class="flex min-h-8 w-64 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-gray-950 min-[500px]:w-88"
    >
      <Combobox.Chips class="flex w-full flex-wrap items-center gap-1">
        {#each value as topic (topic.id)}
          <Combobox.Chip
            aria-label={topic.value}
            class="flex min-h-5.5 items-center gap-1 rounded-md bg-gray-100 py-0 pr-1 pl-2 text-sm text-gray-900 outline-hidden focus-within:bg-gray-950 focus-within:text-gray-50"
          >
            {topic.value}
            <Combobox.ChipRemove
              class="flex size-4 items-center justify-center rounded-md p-0 text-inherit hover:bg-gray-200"
              aria-label={`Remove ${topic.value}`}
            >
              {@render crossIcon()}
            </Combobox.ChipRemove>
          </Combobox.Chip>
        {/each}
        <Combobox.Input
          {id}
          placeholder={value.length > 0 ? '' : 'e.g. Kerning'}
          class="h-5.5 min-w-12 flex-1 rounded-md border-0 bg-transparent p-0 text-sm font-normal text-gray-900 outline-hidden any-pointer-coarse:text-base"
        />
      </Combobox.Chips>
    </Combobox.InputGroup>
  </div>

  <Combobox.Portal>
    <Combobox.Positioner class="z-50 outline-hidden" sideOffset={4}>
      <Combobox.Popup
        class="max-h-[min(var(--available-height),24.5rem)] w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) scroll-py-1 overflow-y-auto overscroll-contain rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
      >
        <Combobox.Empty>
          <div class="py-2 pr-4 pl-2 text-sm/4 text-gray-600">No topics found.</div>
        </Combobox.Empty>
        <Combobox.List>
          <Combobox.Collection>
            {#snippet children(item)}
              {@const topic = item as Topic}
              <Combobox.Item
                value={topic}
                class="grid grid-cols-[1rem_1fr] items-center gap-2 py-2 pr-2 pl-2.5 text-sm/4 outline-hidden select-none [@media(hover:hover)]:data-highlighted:relative [@media(hover:hover)]:data-highlighted:z-0 [@media(hover:hover)]:data-highlighted:text-gray-50 [@media(hover:hover)]:data-highlighted:before:absolute [@media(hover:hover)]:data-highlighted:before:inset-x-1 [@media(hover:hover)]:data-highlighted:before:inset-y-0 [@media(hover:hover)]:data-highlighted:before:z-[-1] [@media(hover:hover)]:data-highlighted:before:rounded-sm [@media(hover:hover)]:data-highlighted:before:bg-gray-900"
              >
                <Combobox.ItemIndicator class="col-start-1">
                  {@render checkIcon()}
                </Combobox.ItemIndicator>
                <span class="col-start-2">{topic.value}</span>
              </Combobox.Item>
            {/snippet}
          </Combobox.Collection>
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
