<script lang="ts">
  import { Tooltip } from '@shardsui/svelte/tooltip'

  const actions = [
    { label: 'Bookmark', tip: 'Save for later', icon: bookmarkIcon },
    { label: 'Transcript', tip: 'Read along', icon: captionsIcon },
    { label: 'Speed', tip: 'Change playback speed', icon: gaugeIcon }
  ]
</script>

<Tooltip.Provider>
  <div class="flex">
    {#each actions as action (action.label)}
      <Tooltip.Root>
        <Tooltip.Trigger
          class="flex size-8 items-center justify-center border border-gray-200 bg-gray-50 text-sm font-normal text-gray-900 select-none not-first:border-l-0 first:rounded-l-md last:rounded-r-md hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100 data-popup-open:bg-gray-100"
          aria-label={action.label}
        >
          {@render action.icon()}
        </Tooltip.Trigger>
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
              {action.tip}
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    {/each}
  </div>
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

{#snippet captionsIcon()}
  <svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M10.2997 10.5993C9.61468 10.084 8.63619 10.1389 8.01256 10.7625C7.32915 11.4459 7.32915 12.554 8.01256 13.2374C8.63619 13.861 9.61468 13.9159 10.2997 13.4006C10.6307 13.1516 11.1009 13.2181 11.3499 13.5491C11.5989 13.8801 11.5324 14.3503 11.2014 14.5993C9.92761 15.5575 8.11135 15.4575 6.9519 14.2981C5.6827 13.0289 5.6827 10.9711 6.9519 9.70186C8.11135 8.54241 9.92761 8.44244 11.2014 9.4006C11.5324 9.6496 11.5989 10.1198 11.3499 10.4508C11.1009 10.7818 10.6307 10.8483 10.2997 10.5993ZM16.7997 10.5993C16.1147 10.084 15.1362 10.1389 14.5126 10.7625C13.8291 11.4459 13.8291 12.554 14.5126 13.2374C15.1362 13.861 16.1147 13.9159 16.7997 13.4006C17.1307 13.1516 17.6009 13.2181 17.8499 13.5491C18.0989 13.8801 18.0324 14.3503 17.7014 14.5993C16.4276 15.5575 14.6114 15.4575 13.4519 14.2981C12.1827 13.0289 12.1827 10.9711 13.4519 9.70186C14.6114 8.54241 16.4276 8.44244 17.7014 9.4006C18.0324 9.6496 18.0989 10.1198 17.8499 10.4508C17.6009 10.7818 17.1307 10.8483 16.7997 10.5993Z"
      fill="currentColor"
    />
    <path
      d="M17.25 3.75H6.75C5.09315 3.75 3.75 5.09315 3.75 6.75V17.25C3.75 18.9069 5.09315 20.25 6.75 20.25H17.25C18.9069 20.25 20.25 18.9069 20.25 17.25V6.75C20.25 5.09315 18.9069 3.75 17.25 3.75Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="square"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}

{#snippet gaugeIcon()}
  <svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true">
    <path
      d="M10 10L5.5 5.5M12 5.25V2.75C17.1086 2.75 21.25 6.89137 21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12C2.75 10.5672 3.07575 9.21057 3.65722 8M14.75 12C14.75 13.5188 13.5188 14.75 12 14.75C10.4812 14.75 9.25 13.5188 9.25 12C9.25 10.4812 10.4812 9.25 12 9.25C13.5188 9.25 14.75 10.4812 14.75 12Z"
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
