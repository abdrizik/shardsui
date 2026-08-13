<script lang="ts">
  import { Drawer } from '@shardsui/svelte/drawer'

  const ACTIONS = ['Rename', 'Duplicate', 'Open', 'Copy link']

  let open = $state(false)
</script>

<Drawer.Root bind:open>
  <Drawer.Trigger
    class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950"
  >
    Actions
  </Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Backdrop
      class="fixed inset-0 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] [--backdrop-opacity:0.4] data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-starting-style:opacity-0 data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute"
    />
    <Drawer.Viewport class="fixed inset-0 flex items-end justify-center">
      <Drawer.Popup
        class="pointer-events-none box-border flex w-full max-w-80 transform-[translateY(var(--drawer-swipe-movement-y))] flex-col gap-3 px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0))] outline-hidden transition-transform duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-hidden data-ending-style:transform-[translateY(calc(100%+1rem+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-starting-style:transform-[translateY(calc(100%+1rem+2px))] data-swiping:select-none"
      >
        <Drawer.Content
          class="pointer-events-auto overflow-hidden rounded-2xl bg-gray-50 text-gray-900 outline-1 outline-gray-200"
        >
          <Drawer.Title class="sr-only">Actions</Drawer.Title>
          <Drawer.Description class="sr-only">Choose an action.</Drawer.Description>

          <ul class="m-0 list-none divide-y divide-gray-200 p-0" aria-label="Actions">
            {#each ACTIONS as action, index (action)}
              <li>
                {#if index === 0}
                  <Drawer.Close class="sr-only">Close action sheet</Drawer.Close>
                {/if}
                <button
                  type="button"
                  class="block w-full border-0 bg-transparent px-5 py-3 text-center text-sm text-gray-900 select-none hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-hidden"
                  onclick={() => (open = false)}
                >
                  {action}
                </button>
              </li>
            {/each}
          </ul>
        </Drawer.Content>
        <div
          class="pointer-events-auto overflow-hidden rounded-2xl bg-gray-50 outline-1 outline-gray-200"
        >
          <button
            type="button"
            class="block w-full border-0 bg-transparent px-5 py-3 text-center text-sm text-red-800 select-none hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-hidden"
            onclick={() => (open = false)}
          >
            Delete
          </button>
        </div>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
