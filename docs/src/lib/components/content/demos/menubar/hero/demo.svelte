<script lang="ts">
  import { Menubar } from '@shardsui/svelte/menubar'
  import { Menu } from '@shardsui/svelte/menu'

  const menus = [
    {
      label: 'File',
      groups: [
        ['New file', 'Import', { label: 'Export as', options: ['PDF', 'CSV', 'PNG'] }],
        ['Refresh']
      ]
    },
    {
      label: 'Edit',
      groups: [['Undo', 'Redo']]
    }
  ]

  function submenuOffset({ side }: { side: string }) {
    return side === 'top' || side === 'bottom' ? 4 : -4
  }
</script>

<Menubar class="flex items-center">
  {#each menus as menu (menu.label)}
    <Menu.Root>
      <Menu.Trigger
        class="h-8 rounded-sm px-3 text-sm font-normal text-gray-600 select-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 data-popup-open:bg-gray-100"
        >{menu.label}</Menu.Trigger
      >
      <Menu.Portal>
        <Menu.Positioner class="outline-hidden" sideOffset={6}>
          <Menu.Popup
            class="origin-(--transform-origin) rounded-md bg-gray-50 py-1 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] duration-100 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-instant:transition-none data-starting-style:scale-95 data-starting-style:opacity-0"
          >
            {#each menu.groups as group, groupIndex (group[0])}
              {#if groupIndex > 0}
                <Menu.Separator class="m-1 h-px bg-gray-200" />
              {/if}
              {#each group as entry (typeof entry === 'string' ? entry : entry.label)}
                {#if typeof entry === 'string'}
                  {@render item(entry)}
                {:else}
                  <Menu.SubmenuRoot>
                    <Menu.SubmenuTrigger
                      class="flex items-center justify-between gap-4 py-2 pr-2 pl-4 text-sm/4 font-normal outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900 data-popup-open:relative data-popup-open:z-0 data-popup-open:before:absolute data-popup-open:before:inset-x-1 data-popup-open:before:inset-y-0 data-popup-open:before:z-[-1] data-popup-open:before:rounded-xs data-popup-open:before:bg-gray-100 data-highlighted:data-popup-open:before:bg-gray-900"
                    >
                      {entry.label}
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
                          {#each entry.options as option (option)}
                            {@render item(option)}
                          {/each}
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.SubmenuRoot>
                {/if}
              {/each}
            {/each}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  {/each}

  <Menu.Root disabled>
    <Menu.Trigger
      class="h-8 rounded-sm px-3 text-sm font-normal text-gray-600 select-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 data-disabled:opacity-50 data-popup-open:bg-gray-100"
      >Account</Menu.Trigger
    >
  </Menu.Root>
</Menubar>

{#snippet item(label: string)}
  <Menu.Item
    class="flex px-4 py-2 text-sm/4 font-normal outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
    >{label}</Menu.Item
  >
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
