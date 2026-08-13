<script lang="ts">
  import { Drawer } from '@shardsui/svelte/drawer'
</script>

<Drawer.Root swipeDirection="right" modal={false} disablePointerDismissal>
  <Drawer.Trigger
    class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
  >
    Open transcript
  </Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Viewport
      class="pointer-events-none fixed inset-0 flex items-stretch justify-end p-(--viewport-padding) [--viewport-padding:0px] supports-[-webkit-touch-callout:none]:[--viewport-padding:0.625rem]"
    >
      <Drawer.Popup
        class="pointer-events-auto -mr-12 h-full w-92 max-w-[calc(100vw-3rem+3rem)] transform-[translateX(var(--drawer-swipe-movement-x))] touch-auto overflow-y-auto overscroll-contain bg-gray-50 p-4 pr-18 text-gray-900 shadow-xl outline-1 outline-gray-200 transition-[transform,box-shadow] duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] [--bleed:3rem] data-ending-style:transform-[translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))] data-ending-style:shadow-none data-ending-style:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-starting-style:transform-[translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))] data-starting-style:shadow-none data-swiping:select-none supports-[-webkit-touch-callout:none]:mr-0 supports-[-webkit-touch-callout:none]:w-80 supports-[-webkit-touch-callout:none]:max-w-[calc(100vw-20px)] supports-[-webkit-touch-callout:none]:rounded-lg supports-[-webkit-touch-callout:none]:pr-6 supports-[-webkit-touch-callout:none]:[--bleed:0px]"
      >
        <Drawer.Content class="mx-auto w-full max-w-lg">
          <Drawer.Title class="-mt-1.5 mb-1 text-base font-semibold">Transcript</Drawer.Title>
          <Drawer.Description class="mb-4 text-sm text-gray-600">
            Focus is not trapped and outside clicks are ignored. Use the close button or swipe to
            dismiss.
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
