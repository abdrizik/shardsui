<script lang="ts">
  import { ContextMenu } from '@shardsui/svelte/context-menu'
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
          class="flex py-2 pr-8 pl-4 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
          >Open</ContextMenu.Item
        >
        <ContextMenu.Item
          class="flex py-2 pr-8 pl-4 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
          >Rename</ContextMenu.Item
        >
        <ContextMenu.Separator class="m-1 h-px bg-gray-200" />
        <ContextMenu.Item
          class="flex py-2 pr-8 pl-4 text-sm/4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-gray-900"
          >Delete</ContextMenu.Item
        >
      </ContextMenu.Popup>
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>
