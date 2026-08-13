<script lang="ts">
  import { Drawer } from '@shardsui/svelte/drawer'
</script>

<Drawer.Root swipeDirection="right">
  <Drawer.Trigger
    class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
  >
    Notes
  </Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Backdrop
      class="fixed inset-0 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] [--backdrop-opacity:0.2] data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-starting-style:opacity-0 data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute"
    />
    <Drawer.Viewport
      class="fixed inset-0 flex items-stretch justify-end p-(--viewport-padding) [--viewport-padding:0px] supports-[-webkit-touch-callout:none]:[--viewport-padding:0.625rem]"
    >
      <Drawer.Popup
        class="relative -mr-12 h-full w-92 max-w-[calc(100vw-3rem+3rem)] transform-[translateX(var(--drawer-swipe-movement-x))] touch-auto overflow-y-auto overscroll-contain bg-gray-50 p-4 pr-18 text-gray-900 outline-1 outline-gray-200 transition-transform duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] [--bleed:3rem] data-ending-style:transform-[translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-starting-style:transform-[translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))] data-swiping:select-none supports-[-webkit-touch-callout:none]:mr-0 supports-[-webkit-touch-callout:none]:w-80 supports-[-webkit-touch-callout:none]:max-w-[calc(100vw-20px)] supports-[-webkit-touch-callout:none]:rounded-lg supports-[-webkit-touch-callout:none]:pr-6 supports-[-webkit-touch-callout:none]:[--bleed:0px]"
      >
        <Drawer.Content class="mx-auto w-full max-w-lg">
          <Drawer.Title class="-mt-1.5 mb-1 text-base font-semibold">Notes</Drawer.Title>
          <Drawer.Description class="mb-4 text-sm text-gray-600">
            The panel slides in from the edge. Swipe it aside to dismiss.
          </Drawer.Description>
          <ul class="mb-4 grid gap-2 text-sm text-gray-700">
            <li>
              Kerning adjusts the space between two specific letters; tracking spaces a whole run
              evenly
            </li>
            <li>Ease-out for elements entering the screen; ease-in for ones leaving it</li>
            <li>A semantic token names a color's purpose — --color-border-subtle, not #e0e0e0</li>
          </ul>
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
