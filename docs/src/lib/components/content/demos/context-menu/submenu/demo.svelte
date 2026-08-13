<script lang="ts">
  import { ContextMenu } from '@shardsui/svelte/context-menu'

  const folders = ['Design', 'Engineering', 'Marketing']

  function submenuOffset({ side }: { side: string }) {
    return side === 'top' || side === 'bottom' ? 4 : -4
  }
</script>

<ContextMenu.Root>
  <ContextMenu.Trigger
    class="flex h-48 w-60 items-center justify-center rounded-md border border-dashed border-gray-300 text-sm font-normal text-gray-600 select-none"
  >
    Right click here
  </ContextMenu.Trigger>
  <ContextMenu.Portal>
    <ContextMenu.Positioner class="outline-hidden">
      <ContextMenu.Popup
        class="origin-(--transform-origin) rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-opacity duration-100 ease-out data-ending-style:opacity-0"
      >
        <ContextMenu.Item
          class="flex py-2 pr-6 pl-4 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
          >Open</ContextMenu.Item
        >

        <ContextMenu.SubmenuRoot>
          <ContextMenu.SubmenuTrigger
            class="flex items-center justify-between gap-4 py-2 pr-2 pl-4 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900 data-popup-open:relative data-popup-open:z-0 data-popup-open:before:absolute data-popup-open:before:inset-x-1 data-popup-open:before:inset-y-0 data-popup-open:before:z-[-1] data-popup-open:before:rounded-xs data-popup-open:before:bg-gray-100 data-highlighted:data-popup-open:before:bg-gray-900"
          >
            Move to folder
            {@render chevronRightIcon()}
          </ContextMenu.SubmenuTrigger>
          <ContextMenu.Portal>
            <ContextMenu.Positioner
              class="outline-hidden"
              alignOffset={submenuOffset}
              sideOffset={submenuOffset}
            >
              <ContextMenu.Popup
                class="origin-(--transform-origin) rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] duration-100 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
              >
                {#each folders as folder (folder)}
                  <ContextMenu.Item
                    class="flex py-2 pr-6 pl-4 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
                    >{folder}</ContextMenu.Item
                  >
                {/each}
              </ContextMenu.Popup>
            </ContextMenu.Positioner>
          </ContextMenu.Portal>
        </ContextMenu.SubmenuRoot>

        <ContextMenu.Separator class="m-1 h-px bg-gray-200" />

        <ContextMenu.Item
          class="flex py-2 pr-6 pl-4 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
          >Delete</ContextMenu.Item
        >
      </ContextMenu.Popup>
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>

{#snippet chevronRightIcon()}
  <svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M9.5 18.25L15.75 12L9.5 5.75"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}
