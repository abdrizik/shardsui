<script lang="ts">
  import { Toast } from '@shardsui/svelte/toast'

  const anchoredManager = new Toast.Manager()

  let copyButtonEl = $state<HTMLElement | null>(null)
  let copied = $state(false)

  function copyLink() {
    if (copied) return
    copied = true
    anchoredManager.add({
      description: 'Link copied',
      timeout: 1500,
      positionerProps: {
        anchor: copyButtonEl,
        sideOffset: 10
      },
      onClose() {
        copied = false
      }
    })
  }
</script>

<Toast.Provider toastManager={anchoredManager}>
  <Toast.Portal>
    <Toast.Viewport class="outline-0">
      {#each Toast.getToastManager().toasts as toast (toast.id)}
        <Toast.Positioner {toast} class="z-[calc(1000-var(--toast-index))]">
          <Toast.Root
            {toast}
            class="group flex w-max origin-(--transform-origin) flex-col rounded-md bg-gray-50 px-2 py-1 text-sm shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] duration-100 ease-out focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
          >
            <Toast.Arrow
              class="data-[side=bottom]:-top-2 data-[side=left]:-right-3.25 data-[side=left]:rotate-90 data-[side=right]:-left-3.25 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180"
            >
              {@render arrow()}
            </Toast.Arrow>
            <Toast.Content>
              <Toast.Description />
            </Toast.Content>
          </Toast.Root>
        </Toast.Positioner>
      {/each}
    </Toast.Viewport>
  </Toast.Portal>
</Toast.Provider>

<button
  type="button"
  bind:this={copyButtonEl}
  class="box-border flex h-8 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-0 text-sm font-normal text-gray-900 outline-0 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
  onclick={copyLink}
>
  {#if copied}
    {@render checkIcon()}
  {:else}
    {@render clipboardIcon()}
  {/if}
  Copy link
</button>

{#snippet clipboardIcon()}
  <svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M16.25 4.75H17.25C18.9069 4.75 20.25 6.09315 20.25 7.75V18.25C20.25 19.9069 18.9069 21.25 17.25 21.25H6.75C5.09315 21.25 3.75 19.9069 3.75 18.25V7.75C3.75 6.09315 5.09315 4.75 6.75 4.75H7.75M8.75 7.25H15.25C15.8023 7.25 16.25 6.80228 16.25 6.25V5.75C16.25 4.09315 14.9069 2.75 13.25 2.75H10.75C9.09315 2.75 7.75 4.09315 7.75 5.75V6.25C7.75 6.80228 8.19772 7.25 8.75 7.25Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="square"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}

{#snippet checkIcon()}
  <svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M6 14.15L10.0321 18L18 7"
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
