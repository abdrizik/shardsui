<script lang="ts">
  import { Menu } from '@shardsui/svelte/menu'

  const MENUS = {
    file: ['Rename', 'Archive'],
    edit: ['Add note', 'Bookmark'],
    view: ['Grid', 'List']
  }

  type MenuKey = keyof typeof MENUS

  const demoMenu = new Menu.Handle<MenuKey>()

  const triggers: { id: string; payload: MenuKey; label: string }[] = [
    { id: 'menu-file', payload: 'file', label: 'File' },
    { id: 'menu-edit', payload: 'edit', label: 'Edit' },
    { id: 'menu-view', payload: 'view', label: 'View' }
  ]

  let open = $state(false)
  let triggerId = $state<string | null>(null)

  function openViewMenu() {
    triggerId = 'menu-view'
    open = true
  }
</script>

<div class="flex flex-wrap items-center gap-2">
  {#each triggers as trigger (trigger.id)}
    <Menu.Trigger
      handle={demoMenu}
      payload={trigger.payload}
      id={trigger.id}
      class="flex h-8 items-center justify-center rounded-md px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100 data-popup-open:bg-gray-100"
    >
      {trigger.label}
    </Menu.Trigger>
  {/each}

  <button
    type="button"
    class="flex h-8 items-center justify-center rounded-md px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
    onclick={openViewMenu}>Open View menu</button
  >
</div>

<Menu.Root handle={demoMenu} bind:open bind:triggerId>
  {#snippet children({ payload })}
    <Menu.Portal>
      <Menu.Positioner sideOffset={8} class="outline-hidden">
        <Menu.Popup
          class="origin-(--transform-origin) rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] duration-100 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
        >
          {#if payload}
            {#each MENUS[payload] as item (item)}
              <Menu.Item
                class="flex py-2 pr-8 pl-4 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
                >{item}</Menu.Item
              >
            {/each}
          {/if}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  {/snippet}
</Menu.Root>
