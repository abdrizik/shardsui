<script lang="ts">
  import { Menu } from '@shardsui/svelte/menu'

  const demoMenu = new Menu.Handle()
</script>

<Menu.Trigger
  handle={demoMenu}
  aria-label="Actions"
  class="flex size-8 items-center justify-center rounded-md text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100 data-popup-open:bg-gray-100"
>
  {@render dotsIcon()}
</Menu.Trigger>

<Menu.Root handle={demoMenu}>
  <Menu.Portal>
    <Menu.Positioner sideOffset={8} class="outline-hidden">
      <Menu.Popup
        class="origin-(--transform-origin) rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] duration-100 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
      >
        <Menu.Item
          class="flex py-2 pr-8 pl-4 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
          >Rename</Menu.Item
        >
        <Menu.Item
          class="flex py-2 pr-8 pl-4 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
          >Duplicate</Menu.Item
        >
        <Menu.Separator class="m-1 h-px bg-gray-200" />
        <Menu.Item
          class="flex py-2 pr-8 pl-4 text-sm/4 text-red-800 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
          >Delete</Menu.Item
        >
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>

{#snippet dotsIcon()}
  <svg class="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="10" y="3" width="4" height="4" rx="2" fill="currentColor" />
    <rect x="10" y="10" width="4" height="4" rx="2" fill="currentColor" />
    <rect x="10" y="17" width="4" height="4" rx="2" fill="currentColor" />
  </svg>
{/snippet}
