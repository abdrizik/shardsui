<script lang="ts">
  import { Select } from '@shardsui/svelte/select'

  const topicGroups = [
    {
      label: 'Design',
      items: [
        { value: 'kerning', label: 'Kerning' },
        { value: 'type-scale', label: 'Type scale' }
      ]
    },
    {
      label: 'Frontend',
      items: [
        { value: 'html', label: 'HTML' },
        { value: 'css', label: 'CSS' }
      ]
    },
    {
      label: 'Accessibility',
      items: [
        { value: 'aria-label', label: 'aria-label' },
        { value: 'focus-state', label: 'Focus state' }
      ]
    }
  ]
</script>

<div class="flex flex-col gap-1">
  <Select.Root items={topicGroups}>
    <Select.Label class="text-sm/5 font-semibold text-gray-900">Topic</Select.Label>
    <Select.Trigger
      class="flex h-8 min-w-44 items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 pr-2 pl-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 data-popup-open:bg-gray-100"
    >
      <Select.Value class="data-placeholder:opacity-60" placeholder="Select topic" />
      <Select.Icon class="flex">
        {@render chevronGrabberIcon()}
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner class="z-10 outline-hidden select-none" sideOffset={8}>
        <Select.Popup
          class="group min-w-(--anchor-width) origin-(--transform-origin) rounded-md bg-gray-50 bg-clip-padding text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] duration-100 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
        >
          <Select.List class="max-h-(--available-height) scroll-pt-9 overflow-y-auto py-1">
            {#each topicGroups as group, index (group.label)}
              <Select.Group class="block pb-0.5">
                <Select.GroupLabel
                  class="sticky top-0 z-1 bg-gray-50 py-1.5 pr-4 pl-8.5 text-xs font-semibold tracking-wider text-gray-700 uppercase"
                >
                  {group.label}
                </Select.GroupLabel>
                {#each group.items as item (item.value)}
                  <Select.Item
                    value={item.value}
                    class="grid grid-cols-[1rem_1fr] items-center gap-2 py-1.5 pr-4 pl-2.5 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
                  >
                    <Select.ItemIndicator class="col-start-1">
                      {@render checkIcon()}
                    </Select.ItemIndicator>
                    <div class="col-start-2">{item.label}</div>
                  </Select.Item>
                {/each}
              </Select.Group>
              {#if index < topicGroups.length - 1}
                <Select.Separator class="mx-4 my-1 h-px bg-gray-200" />
              {/if}
            {/each}
          </Select.List>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
</div>

{#snippet chevronGrabberIcon()}
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="size-4">
    <path
      d="M8 8.99981L11.1161 5.88369C11.6043 5.39554 12.3957 5.39554 12.8839 5.8837L16 8.99981"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M16 15L12.8839 18.1161C12.3957 18.6043 11.6043 18.6043 11.1161 18.1161L8 15"
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
