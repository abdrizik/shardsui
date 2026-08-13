<script lang="ts">
  import { ScrollArea } from '@shardsui/svelte/scroll-area'
</script>

<ScrollArea.Root class="size-72 max-w-[calc(100vw-8rem)]">
  <ScrollArea.Viewport
    class="h-full rounded-lg border border-gray-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950"
  >
    <ScrollArea.Content class="p-4">
      <div
        class="size-160 rounded-md bg-[repeating-conic-gradient(var(--color-gray-300)_0_25%,var(--color-gray-100)_0_50%)] bg-size-[10rem_10rem]"
      ></div>
    </ScrollArea.Content>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar
    class="pointer-events-none m-2 flex w-1 rounded-sm bg-gray-200 opacity-0 transition-opacity before:absolute before:left-1/2 before:h-full before:w-5 before:-translate-x-1/2 before:content-[''] data-hovering:pointer-events-auto data-hovering:opacity-100 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0"
  >
    <ScrollArea.Thumb class="w-full rounded-sm bg-gray-500" />
  </ScrollArea.Scrollbar>
  <ScrollArea.Scrollbar
    orientation="horizontal"
    class="pointer-events-none m-2 flex h-1 rounded-sm bg-gray-200 opacity-0 transition-opacity before:absolute before:inset-x-0 before:-bottom-2 before:h-5 before:w-full before:content-[''] data-hovering:pointer-events-auto data-hovering:opacity-100 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0"
  >
    <ScrollArea.Thumb class="h-full rounded-sm bg-gray-500" />
  </ScrollArea.Scrollbar>
  <ScrollArea.Corner />
</ScrollArea.Root>
