<script lang="ts">
  import { Drawer } from '@shardsui/svelte/drawer'

  const TOP_MARGIN_REM = 1
  const VISIBLE_SNAP_POINTS_REM = [18]

  function toViewportSnapPoint(heightRem: number) {
    return `${heightRem + TOP_MARGIN_REM}rem`
  }

  const snapPoints = [...VISIBLE_SNAP_POINTS_REM.map(toViewportSnapPoint), 1]

  const rows = Array.from({ length: 16 }, (_, i) => i)
</script>

<Drawer.Root {snapPoints}>
  <Drawer.Trigger
    class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
  >
    List
  </Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Backdrop
      class="fixed inset-0 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] [--backdrop-opacity:0.2] data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-starting-style:opacity-0 data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute"
    />
    <Drawer.Viewport class="fixed inset-0 flex touch-none items-end justify-center">
      <Drawer.Popup
        class="relative flex max-h-[calc(100dvh-var(--top-margin))] min-h-0 w-full transform-[translateY(calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))] touch-none flex-col overflow-visible rounded-t-2xl bg-gray-50 pb-[max(0px,calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))] text-gray-900 shadow-xl outline-1 outline-gray-200 transition-[transform,box-shadow] duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] [--bleed:3rem] after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-(--bleed) after:bg-gray-50 after:content-[''] data-ending-style:transform-[translateY(calc(100%+2px))] data-ending-style:pb-0 data-ending-style:shadow-none data-ending-style:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-starting-style:transform-[translateY(calc(100%+2px))] data-starting-style:pb-0 data-starting-style:shadow-none data-swiping:select-none"
        style="--top-margin:{TOP_MARGIN_REM}rem;"
      >
        <div class="shrink-0 touch-none border-b border-gray-200 px-4 pt-3.5 pb-3">
          <div class="mx-auto h-1 w-12 rounded-full bg-gray-300"></div>
          <Drawer.Title class="mt-2.5 text-center text-base font-semibold">List</Drawer.Title>
        </div>
        <Drawer.Content
          class="min-h-0 flex-1 touch-auto overflow-y-auto overscroll-contain px-4 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0))]"
        >
          <div class="mx-auto w-full max-w-87.5">
            <Drawer.Description class="mb-4 text-center text-sm text-gray-600">
              Drag the sheet to snap between a compact peek and a near full-height view.
            </Drawer.Description>
            <ul class="mb-4 grid gap-2">
              {#each rows as row (row)}
                <li class="h-12 rounded-xl bg-gray-100"></li>
              {/each}
            </ul>
            <div class="flex items-center justify-end gap-4">
              <Drawer.Close
                class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
              >
                Close
              </Drawer.Close>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
