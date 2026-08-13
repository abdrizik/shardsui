<script lang="ts">
  import { Popover } from '@shardsui/svelte/popover'
</script>

<Popover.Root>
  <Popover.Trigger
    openOnHover
    class="flex size-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100 data-popup-open:bg-gray-100"
    aria-label="Activity"
  >
    {@render fireIcon()}
  </Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner sideOffset={8}>
      <Popover.Popup
        class="flex max-w-72 origin-(--transform-origin) flex-col gap-1 rounded-lg bg-gray-50 p-3 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] duration-100 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
      >
        <Popover.Arrow
          class="data-[side=bottom]:-top-2 data-[side=left]:-right-3.25 data-[side=left]:rotate-90 data-[side=right]:-left-3.25 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180"
        >
          {@render arrow()}
        </Popover.Arrow>
        <Popover.Title class="text-sm font-semibold">Activity</Popover.Title>
        <Popover.Description class="text-sm text-gray-600">
          12 days active this month.
        </Popover.Description>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>

{#snippet fireIcon()}
  <svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true">
    <path
      d="M17.8186 7.96008C18.9803 9.06824 19.4816 10.4992 19.6695 11.9928C20.8623 21.3865 8.45545 24.7553 4.84302 16.7772C3.33975 13.447 4.88844 10.2793 7.31572 7.94562C8.99792 6.33156 10.6416 5.03914 11.3646 2.5C14.5716 4.58333 15.0895 8.75 15.0895 10.8333C15.0895 10.8333 17.2824 8.71744 17.8186 7.96008Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
    />
  </svg>
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
