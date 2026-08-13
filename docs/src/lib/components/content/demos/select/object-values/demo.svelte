<script lang="ts">
  import { Select } from '@shardsui/svelte/select'

  type Person = {
    id: string
    name: string
    role: string
  }

  const people: Person[] = [
    { id: 'i1', name: 'Paula Scher', role: 'Identity' },
    { id: 'i2', name: 'Massimo Vignelli', role: 'Typography' },
    { id: 'i3', name: 'Saul Bass', role: 'Motion' }
  ]

  let value = $state<Person>({ id: 'i1', name: 'Paula Scher', role: 'Identity' })
</script>

<div class="flex flex-col gap-1">
  <Select.Root
    bind:value
    itemToStringValue={(item) => item.id}
    isItemEqualToValue={(item, val) => item.id === val.id}
  >
    <Select.Label class="text-sm/5 font-semibold text-gray-900">Assignee</Select.Label>
    <Select.Trigger
      class="flex min-h-8 min-w-56 items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 py-1.5 pr-2 pl-3 text-sm text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 data-popup-open:bg-gray-100"
    >
      <Select.Value>
        {#snippet children(current)}
          {@const assignee = current as Person | null}
          {#if assignee}
            <span class="flex flex-col items-start gap-0.5">
              <span class="text-sm/6">{assignee.name}</span>
              <span class="text-xs/4 text-gray-600">{assignee.role}</span>
            </span>
          {/if}
        {/snippet}
      </Select.Value>
      <Select.Icon class="flex items-center self-center">
        {@render chevronGrabberIcon()}
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner class="z-10 outline-hidden select-none" sideOffset={8}>
        <Select.Popup
          class="group min-w-(--anchor-width) origin-(--transform-origin) rounded-md bg-gray-50 bg-clip-padding text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] duration-100 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
        >
          <Select.List class="max-h-(--available-height) overflow-y-auto py-1">
            {#each people as person (person.id)}
              <Select.Item
                value={person}
                class="grid grid-cols-[1rem_1fr] items-start gap-2 py-1.5 pr-4 pl-2.5 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
              >
                <Select.ItemIndicator
                  class="relative top-[0.4em] col-start-1 flex items-center self-start"
                >
                  {@render checkIcon()}
                </Select.ItemIndicator>
                <div class="col-start-2 flex flex-col items-start gap-0.5">
                  <span class="text-sm/6">{person.name}</span>
                  <span class="text-xs/4 opacity-80">{person.role}</span>
                </div>
              </Select.Item>
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
