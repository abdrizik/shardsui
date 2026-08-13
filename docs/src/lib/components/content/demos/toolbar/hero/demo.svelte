<script lang="ts">
  import { Toolbar } from '@shardsui/svelte/toolbar'
  import { ToggleGroup } from '@shardsui/svelte/toggle-group'
  import { Toggle } from '@shardsui/svelte/toggle'
  import { Select } from '@shardsui/svelte/select'

  const views = [
    { value: 'grid', label: 'Grid view', text: 'Grid' },
    { value: 'list', label: 'List view', text: 'List' }
  ]

  const zoomControls = [
    { label: 'Zoom out', text: '−' },
    { label: 'Zoom in', text: '+' }
  ]

  const sorts = ['Newest', 'Oldest']
</script>

<Toolbar.Root
  class="flex w-full max-w-150 items-center gap-px rounded-md border border-gray-200 bg-gray-50 p-px"
>
  <ToggleGroup class="flex gap-px" aria-label="View">
    {#each views as view (view.value)}
      <Toggle
        aria-label={view.label}
        value={view.value}
        class="font-inherit flex h-8 min-w-8 items-center justify-center gap-2 rounded-xs px-3 text-sm font-normal text-gray-600 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-200 data-pressed:bg-gray-100 data-pressed:text-gray-900"
      >
        {view.text}
      </Toggle>
    {/each}
  </ToggleGroup>
  <Toolbar.Separator class="m-1 h-4 w-px bg-gray-300" />
  <Toolbar.Group class="flex gap-px" aria-label="Zoom">
    {#each zoomControls as control (control.label)}
      <Toolbar.Button
        class="font-inherit flex h-8 min-w-8 items-center justify-center gap-2 rounded-xs text-sm font-normal text-gray-600 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-200"
        aria-label={control.label}
      >
        {control.text}
      </Toolbar.Button>
    {/each}
  </Toolbar.Group>
  <Toolbar.Separator class="m-1 h-4 w-px bg-gray-300" />
  <Select.Root value="Newest">
    <Select.Trigger
      class="flex h-8 min-w-32 items-center justify-between gap-2 rounded-md pr-1 pl-2 text-sm font-normal text-gray-600 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 data-popup-open:bg-gray-100"
    >
      <Select.Value />
      <Select.Icon class="flex">
        {@render chevronGrabberIcon()}
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner class="outline-hidden select-none" sideOffset={8}>
        <Select.Popup
          class="group max-h-(--available-height) origin-(--transform-origin) overflow-y-auto rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] duration-100 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 data-[side=none]:data-ending-style:transition-none data-[side=none]:data-starting-style:scale-100 data-[side=none]:data-starting-style:opacity-100 data-[side=none]:data-starting-style:transition-none"
        >
          {#each sorts as sort (sort)}
            <Select.Item
              value={sort}
              class="grid min-w-(--anchor-width) grid-cols-[1rem_1fr] items-center gap-2 py-1.5 pr-4 pl-2.5 leading-4 outline-hidden select-none group-data-[side=none]:min-w-[calc(var(--anchor-width)+1rem)] group-data-[side=none]:pr-12 data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
            >
              <Select.ItemIndicator class="col-start-1">
                {@render checkIcon()}
              </Select.ItemIndicator>
              <div class="col-start-2 text-sm">{sort}</div>
            </Select.Item>
          {/each}
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
  <Toolbar.Separator class="m-1 h-4 w-px bg-gray-300" />
  <Toolbar.Link
    class="mr-3.5 ml-auto flex-none self-center text-sm text-gray-500 no-underline hover:text-gray-900 focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-950"
    href="/"
  >
    128 notes
  </Toolbar.Link>
</Toolbar.Root>

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
