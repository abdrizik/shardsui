<script lang="ts">
  import { Combobox } from '@shardsui/svelte/combobox'

  type Person = {
    value: string
    label: string
  }

  const people: Person[] = [
    { value: 'rand', label: 'Paul Rand' },
    { value: 'bass', label: 'Saul Bass' },
    { value: 'glaser', label: 'Milton Glaser' },
    { value: 'vignelli', label: 'Massimo Vignelli' },
    { value: 'scher', label: 'Paula Scher' },
    { value: 'rams', label: 'Dieter Rams' },
    { value: 'sagmeister', label: 'Stefan Sagmeister' }
  ]
</script>

<div class="flex flex-col gap-1">
  <Combobox.Root items={people} isItemEqualToValue={(a: Person, b: Person) => a.value === b.value}>
    <Combobox.Label class="text-sm/5 font-semibold text-gray-900">Assignee</Combobox.Label>
    <Combobox.Trigger
      class="flex h-8 min-w-40 items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 pr-2 pl-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 data-popup-open:bg-gray-100"
    >
      <Combobox.Value>
        {#snippet children(v)}
          {#if v}
            {(v as Person).label}
          {:else}
            <span class="opacity-60">Select assignee</span>
          {/if}
        {/snippet}
      </Combobox.Value>
      <Combobox.Icon class="flex">
        {@render chevronDownIcon()}
      </Combobox.Icon>
    </Combobox.Trigger>
    <Combobox.Portal>
      <Combobox.Positioner class="z-10 outline-hidden" sideOffset={8}>
        <Combobox.Popup
          class="group min-w-(--anchor-width) origin-(--transform-origin) rounded-md bg-gray-50 bg-clip-padding text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
        >
          <Combobox.Input
            class="box-border w-full border-0 border-b border-gray-200 bg-transparent px-3 py-2 text-sm font-normal text-gray-900 outline-hidden placeholder:text-gray-500 any-pointer-coarse:text-base"
            placeholder="Search…"
            aria-label="Select assignee"
          />
          <Combobox.Empty>
            <div class="py-4 pr-4 pl-2 text-sm/4 text-gray-600">No results found.</div>
          </Combobox.Empty>
          <Combobox.List
            class="max-h-[min(22.5rem,var(--available-height))] scroll-py-1 overflow-y-auto overscroll-contain py-1 outline-0 data-empty:p-0"
          >
            <Combobox.Collection>
              {#snippet children(item)}
                {@const person = item as Person}
                <Combobox.Item
                  value={person}
                  class="grid grid-cols-[1rem_1fr] items-center gap-2 py-2 pr-2 pl-2.5 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
                >
                  <Combobox.ItemIndicator class="col-start-1">
                    {@render checkIcon()}
                  </Combobox.ItemIndicator>
                  <span class="col-start-2">{person.label}</span>
                </Combobox.Item>
              {/snippet}
            </Combobox.Collection>
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
</div>

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
