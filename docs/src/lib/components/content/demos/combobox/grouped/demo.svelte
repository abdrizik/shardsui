<script lang="ts">
  import { Combobox } from '@shardsui/svelte/combobox'

  type Topic = {
    id: string
    label: string
  }

  type TopicGroup = {
    value: string
    items: Topic[]
  }

  const id = $props.id()

  const topicGroups: TopicGroup[] = [
    {
      value: 'Design',
      items: [
        { id: 'kerning', label: 'Kerning' },
        { id: 'contrast-ratio', label: 'Contrast ratio' },
        { id: 'easing', label: 'Easing' }
      ]
    },
    {
      value: 'Frontend',
      items: [
        { id: 'flexbox', label: 'Flexbox' },
        { id: 'html', label: 'HTML' },
        { id: 'css', label: 'CSS' },
        { id: 'javascript', label: 'JavaScript' }
      ]
    }
  ]
</script>

<Combobox.Root items={topicGroups}>
  <div class="relative flex flex-col gap-1 text-sm/5 font-semibold text-gray-900">
    <label for={id}>Pick a topic</label>
    <Combobox.InputGroup
      class="relative box-content h-8 w-64 rounded-md border border-gray-200 bg-gray-50 focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-gray-950 [&>input]:pr-8 has-[.combobox-clear]:[&>input]:pr-[calc(0.5rem+1.5rem*2)]"
    >
      <Combobox.Input
        {id}
        placeholder="e.g. CSS"
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
        class="max-h-92 w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) overflow-hidden rounded-md bg-gray-50 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
      >
        <Combobox.Empty>
          <div class="py-4 pr-4 pl-2 text-sm/4 text-gray-600">No topics found.</div>
        </Combobox.Empty>
        <Combobox.List
          class="max-h-[min(22.5rem,var(--available-height))] scroll-pt-9 scroll-pb-1 overflow-y-auto overscroll-contain outline-0"
        >
          <Combobox.Collection>
            {#snippet children(item)}
              {@const group = item as TopicGroup}
              <Combobox.Group items={group.items} class="pb-2">
                <Combobox.GroupLabel
                  class="sticky top-0 z-1 mr-2 w-[calc(100%-0.5rem)] bg-gray-50 py-2 pr-2 pl-8 text-xs font-semibold tracking-wider uppercase"
                >
                  {group.value}
                </Combobox.GroupLabel>
                <Combobox.Collection>
                  {#snippet children(groupItem)}
                    {@const topic = groupItem as Topic}
                    <Combobox.Item
                      value={topic}
                      class="grid grid-cols-[1rem_1fr] items-center gap-2 py-2 pr-2 pl-2.5 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
                    >
                      <Combobox.ItemIndicator class="col-start-1 flex items-center justify-center">
                        {@render checkIcon()}
                      </Combobox.ItemIndicator>
                      <span class="col-start-2">{topic.label}</span>
                    </Combobox.Item>
                  {/snippet}
                </Combobox.Collection>
              </Combobox.Group>
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
