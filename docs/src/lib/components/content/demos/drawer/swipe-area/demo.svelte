<script lang="ts">
  import { Drawer } from '@shardsui/svelte/drawer'

  let portalContainer = $state<HTMLDivElement | null>(null)
</script>

<div
  bind:this={portalContainer}
  class="relative min-h-80 w-full overflow-hidden border border-gray-200 bg-gray-50 text-gray-900"
>
  <Drawer.Root swipeDirection="right" modal={false}>
    <Drawer.SwipeArea
      class="absolute inset-y-0 right-0 z-10 box-border w-10 border-l-2 border-dashed border-blue-800 bg-blue-800/10"
    >
      <span
        class="pointer-events-none absolute top-1/2 right-0 mr-2 origin-center -translate-y-1/2 -rotate-90 text-xs font-semibold tracking-widest whitespace-nowrap text-blue-800 uppercase"
      >
        Swipe here
      </span>
    </Drawer.SwipeArea>
    <div class="flex min-h-80 items-center justify-center px-4">
      <p class="pr-12 text-center text-sm text-gray-600">
        Swipe from the right edge to open the drawer.
      </p>
    </div>
    <Drawer.Portal container={portalContainer}>
      <Drawer.Backdrop
        class="absolute inset-0 bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] [--backdrop-opacity:0.2] data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-starting-style:opacity-0 data-swiping:duration-0"
      />
      <Drawer.Viewport
        class="absolute inset-0 z-20 flex items-stretch justify-end p-(--viewport-padding) [--viewport-padding:0px] supports-[-webkit-touch-callout:none]:[--viewport-padding:0.625rem]"
      >
        <Drawer.Popup
          class="-mr-12 h-full w-92 max-w-[calc(100vw-3rem+3rem)] transform-[translateX(var(--drawer-swipe-movement-x))] touch-auto overflow-y-auto overscroll-contain bg-gray-50 p-4 pr-18 text-gray-900 outline-1 outline-gray-200 transition-transform duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] [--bleed:3rem] data-ending-style:transform-[translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-starting-style:transform-[translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))] data-swiping:select-none supports-[-webkit-touch-callout:none]:mr-0 supports-[-webkit-touch-callout:none]:w-80 supports-[-webkit-touch-callout:none]:max-w-[calc(100vw-20px)] supports-[-webkit-touch-callout:none]:rounded-lg supports-[-webkit-touch-callout:none]:pr-6 supports-[-webkit-touch-callout:none]:[--bleed:0px]"
        >
          <Drawer.Content class="mx-auto w-full max-w-lg">
            <Drawer.Title class="-mt-1.5 mb-1 text-base font-semibold">Notes</Drawer.Title>
            <Drawer.Description class="mb-4 text-sm text-gray-600">
              Swipe in from the edge to jot something down.
            </Drawer.Description>
            <div class="flex justify-end gap-4">
              <Drawer.Close
                class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
              >
                Close
              </Drawer.Close>
            </div>
          </Drawer.Content>
        </Drawer.Popup>
      </Drawer.Viewport>
    </Drawer.Portal>
  </Drawer.Root>
</div>
