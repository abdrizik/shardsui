<script lang="ts">
  import { Popover } from '@shardsui/svelte/popover'

  const triggers = [
    { id: 'details', label: 'Details', icon: bookIcon },
    { id: 'activity', label: 'Activity', icon: progressIcon },
    { id: 'team', label: 'Team', icon: peopleIcon }
  ]

  const demoPopover = new Popover.Handle()

  let open = $state(false)
  let triggerId = $state<string | null>(null)
</script>

<div class="flex flex-wrap justify-center gap-2">
  {#each triggers as trigger (trigger.id)}
    <Popover.Trigger
      handle={demoPopover}
      id={trigger.id}
      class="flex size-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100 data-popup-open:bg-gray-100"
      aria-label={trigger.label}
    >
      {@render trigger.icon()}
    </Popover.Trigger>
  {/each}

  <button
    type="button"
    class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
    onclick={() => {
      triggerId = 'activity'
      open = true
    }}
  >
    Open Activity
  </button>
</div>

<Popover.Root handle={demoPopover} bind:open bind:triggerId>
  <Popover.Portal>
    <Popover.Positioner
      class="h-(--positioner-height) w-(--positioner-width) max-w-(--available-width)"
      sideOffset={8}
    >
      <Popover.Popup
        class="relative flex h-(--popup-height,auto) w-(--popup-width,auto) max-w-72 origin-(--transform-origin) flex-col gap-1 rounded-lg bg-gray-50 p-3 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] duration-100 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
      >
        <Popover.Arrow
          class="data-[side=bottom]:-top-2 data-[side=left]:-right-3.25 data-[side=left]:rotate-90 data-[side=right]:-left-3.25 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180"
        >
          {@render arrow()}
        </Popover.Arrow>
        {#if triggerId === 'details'}
          {@render detailsPanel()}
        {:else if triggerId === 'team'}
          {@render teamPanel()}
        {:else}
          {@render activityPanel()}
        {/if}
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>

{#snippet bookIcon()}
  <svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true">
    <path
      d="M19.25 12V13.75C19.25 15.4069 17.9069 16.75 16.25 16.75H7C5.75736 16.75 4.75 17.7574 4.75 19C4.75 20.2426 5.75736 21.25 7 21.25H10M8.75 7H15.25M8.75 11H12.25M6.75 2.75H16.25C17.9069 2.75 19.25 4.09315 19.25 5.75V18.25C19.25 19.9069 17.9069 21.25 16.25 21.25H6.75C5.64543 21.25 4.75 20.3546 4.75 19.25V4.75C4.75 3.64543 5.64543 2.75 6.75 2.75Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}

{#snippet progressIcon()}
  <svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true">
    <circle cx="12" cy="12" r="9.25" stroke="currentColor" stroke-width="1.5" />
    <path
      d="M12 18.75C15.7279 18.75 18.75 15.7279 18.75 12C18.75 8.27208 15.7279 5.25 12 5.25V12H5.25C5.25 15.7279 8.27208 18.75 12 18.75Z"
      fill="currentColor"
    />
  </svg>
{/snippet}

{#snippet peopleIcon()}
  <svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true">
    <path
      d="M15.75 6.5C15.75 8.57107 14.0711 10.25 12 10.25C9.92893 10.25 8.25 8.57107 8.25 6.5C8.25 4.42893 9.92893 2.75 12 2.75C14.0711 2.75 15.75 4.42893 15.75 6.5Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
    />
    <path
      d="M11.9997 13.25C9.02123 13.25 6.67402 14.8039 5.43304 17.1121C4.59593 18.6691 6.02717 20.25 7.79494 20.25H16.2044C17.9722 20.25 19.4034 18.6691 18.5663 17.1121C17.3254 14.8039 14.9781 13.25 11.9997 13.25Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}

{#snippet detailsPanel()}
  <Popover.Title class="m-0 text-sm font-semibold">Details</Popover.Title>
  <Popover.Description class="m-0 text-sm text-gray-600">
    Three sections with twelve items in total.
  </Popover.Description>
{/snippet}

{#snippet activityPanel()}
  <Popover.Title class="m-0 text-sm font-semibold">Activity</Popover.Title>
  <Popover.Description class="m-0 text-sm text-gray-600">
    Seven of twelve items done this week.
  </Popover.Description>
{/snippet}

{#snippet teamPanel()}
  <Popover.Title class="m-0 text-sm font-semibold">Team</Popover.Title>
  <div class="mt-1 flex flex-col gap-1 text-sm">
    <a href="/" class="text-gray-900 no-underline hover:underline">Milton Glaser</a>
    <a href="/" class="text-gray-900 no-underline hover:underline">Paula Scher</a>
    <a href="/" class="text-gray-900 no-underline hover:underline">Stefan Sagmeister</a>
  </div>
{/snippet}

{#snippet arrow()}
  <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
    <path
      d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
      class="fill-gray-50"
    />
    <path
      d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
      class="fill-gray-200"
    />
    <path
      d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
    />
  </svg>
{/snippet}
