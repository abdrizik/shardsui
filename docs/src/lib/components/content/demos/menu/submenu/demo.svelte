<script lang="ts">
  import { Menu } from '@shardsui/svelte/menu'

  const accessLevels = ['Viewer', 'Editor', 'Admin']

  function submenuOffset({ side }: { side: string }) {
    return side === 'top' || side === 'bottom' ? 4 : -4
  }
</script>

<Menu.Root>
  <Menu.Trigger
    class="flex h-8 items-center justify-center gap-1.5 rounded-md pr-2 pl-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100 data-popup-open:bg-gray-100"
  >
    Share
    {@render chevronDownIcon()}
  </Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner class="outline-hidden" sideOffset={8}>
      <Menu.Popup
        class="origin-(--transform-origin) rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] duration-100 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
      >
        <Menu.Item
          class="flex py-2 pr-6 pl-4 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
          >Copy link</Menu.Item
        >

        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger
            class="flex items-center justify-between gap-4 py-2 pr-2 pl-4 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900 data-popup-open:relative data-popup-open:z-0 data-popup-open:before:absolute data-popup-open:before:inset-x-1 data-popup-open:before:inset-y-0 data-popup-open:before:z-[-1] data-popup-open:before:rounded-xs data-popup-open:before:bg-gray-100 data-highlighted:data-popup-open:before:bg-gray-900"
          >
            Invite as
            {@render chevronRightIcon()}
          </Menu.SubmenuTrigger>
          <Menu.Portal>
            <Menu.Positioner
              class="outline-hidden"
              sideOffset={submenuOffset}
              alignOffset={submenuOffset}
            >
              <Menu.Popup
                class="origin-(--transform-origin) rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] duration-100 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
              >
                {#each accessLevels as level (level)}
                  <Menu.Item
                    class="flex py-2 pr-6 pl-4 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
                    >{level}</Menu.Item
                  >
                {/each}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.SubmenuRoot>

        <Menu.Separator class="m-1 h-px bg-gray-200" />

        <Menu.Item
          class="flex py-2 pr-6 pl-4 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
          >Manage access</Menu.Item
        >
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>

{#snippet chevronDownIcon()}
  <svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5.75 9.5L12 15.75L18.25 9.5"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}

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
