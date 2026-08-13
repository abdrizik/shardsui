<script lang="ts">
  import { ScrollArea } from '@shardsui/svelte/scroll-area'

  const items = [
    'Semantic HTML',
    'The type scale',
    'Leading and tracking',
    'Flexbox',
    'Grid',
    'Focus states',
    'Contrast ratio',
    'Design tokens',
    'Easing and duration',
    'Final review'
  ]
</script>

<ScrollArea.Root
  class="h-48 w-80 max-w-[calc(100vw-8rem)] rounded-lg bg-gray-50 has-[>_:first-child:focus-visible]:outline-2 has-[>_:first-child:focus-visible]:outline-offset-0 has-[>_:first-child:focus-visible]:outline-gray-950"
>
  <ScrollArea.Viewport
    class="h-full rounded-md bg-gray-50 mask-linear-[to_bottom,transparent_0,black_min(40px,var(--scroll-area-overflow-y-start)),black_calc(100%-min(40px,var(--scroll-area-overflow-y-end,40px))),transparent_100%] mask-no-repeat outline-none"
  >
    <ScrollArea.Content class="py-3 pr-6 pl-4 text-sm/5.5 text-gray-900">
      <ol class="m-0 list-none p-0">
        {#each items as item, i (item)}
          <li class="flex items-center gap-3 py-1.5">
            <span class="w-6 text-right text-gray-400 tabular-nums">{i + 1}</span>
            <span>{item}</span>
          </li>
        {/each}
      </ol>
    </ScrollArea.Content>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar
    class="pointer-events-none m-2 flex w-1 justify-center rounded-sm bg-gray-200 opacity-0 transition-opacity duration-150 before:absolute before:left-1/2 before:h-full before:w-5 before:-translate-x-1/2 before:content-[''] data-hovering:pointer-events-auto data-hovering:opacity-100 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0"
  >
    <ScrollArea.Thumb class="w-full rounded-sm bg-gray-500" />
  </ScrollArea.Scrollbar>
</ScrollArea.Root>
