<script lang="ts">
  import { Tooltip } from '@shardsui/svelte/tooltip'

  const bookmarkTooltip = new Tooltip.Handle()
</script>

<Tooltip.Provider>
  <Tooltip.Trigger
    class="flex size-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100 data-popup-open:bg-gray-100"
    handle={bookmarkTooltip}
    aria-label="Bookmark"
  >
    {@render bookmarkIcon()}
  </Tooltip.Trigger>

  <Tooltip.Root handle={bookmarkTooltip}>
    <Tooltip.Portal>
      <Tooltip.Positioner sideOffset={10}>
        <Tooltip.Popup
          class="origin-(--transform-origin) rounded-md bg-gray-50 px-2 py-1 text-sm text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] duration-100 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-instant:transition-none data-starting-style:scale-95 data-starting-style:opacity-0"
        >
          <Tooltip.Arrow
            class="data-[side=bottom]:-top-2 data-[side=left]:-right-3.25 data-[side=left]:rotate-90 data-[side=right]:-left-3.25 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180"
          >
            {@render arrow()}
          </Tooltip.Arrow>
          Save for later
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>

{#snippet bookmarkIcon()}
  <svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true">
    <path
      d="M19.25 20.2515V5.75C19.25 4.09315 17.9069 2.75 16.25 2.75H7.75C6.09315 2.75 4.75 4.09315 4.75 5.75V20.2515C4.75 21.0522 5.64414 21.5281 6.30839 21.081L10.3248 18.3776C11.3376 17.6959 12.6624 17.6959 13.6752 18.3776L17.6916 21.081C18.3559 21.5282 19.25 21.0522 19.25 20.2515Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
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
