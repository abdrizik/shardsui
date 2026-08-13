<script lang="ts">
  import { Drawer } from '@shardsui/svelte/drawer'

  let portalContainer = $state<HTMLDivElement | null>(null)
</script>

<Drawer.Provider>
  <div bind:this={portalContainer} class="relative w-full overflow-hidden [--bleed:3rem]">
    <Drawer.IndentBackground class="absolute inset-0 bg-black" />
    <Drawer.Indent
      class="relative min-h-80 origin-[center_top] transform-[scale(1)_translateY(0)] border border-gray-200 bg-gray-50 p-4 text-gray-900 duration-[calc(400ms*var(--indent-transition)),calc(250ms*var(--indent-transition))] will-change-transform [--indent-progress:var(--drawer-swipe-progress)] [--indent-radius:calc(1rem*(1-var(--indent-progress)))] [--indent-transition:calc(1-clamp(0,calc(var(--drawer-swipe-progress)*100000),1))] [transition:transform_0.4s_cubic-bezier(0.32,0.72,0,1),border-radius_0.25s_cubic-bezier(0.32,0.72,0,1)] data-active:transform-[scale(calc(0.98+(0.02*var(--indent-progress))))_translateY(calc(0.5rem*(1-var(--indent-progress))))] data-active:rounded-t-(--indent-radius)"
    >
      <div class="flex min-h-80 items-center justify-center">
        <Drawer.Root modal={false}>
          <Drawer.Trigger
            class="box-border flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
          >
            Filter
          </Drawer.Trigger>
          <Drawer.Portal container={portalContainer}>
            <Drawer.Backdrop
              class="absolute inset-0 bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] [--backdrop-opacity:0.2] data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-starting-style:opacity-0 data-swiping:duration-0"
            />
            <Drawer.Viewport class="absolute inset-0 flex items-end justify-center">
              <Drawer.Popup
                class="-mb-(--bleed) box-border max-h-[calc(80vh+var(--bleed))] w-full transform-[translateY(var(--drawer-swipe-movement-y))] overflow-y-auto overscroll-contain rounded-t-2xl bg-gray-50 px-4 py-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,0)+var(--bleed))] text-gray-900 outline-1 outline-gray-200 transition-transform duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:transform-[translateY(calc(100%-var(--bleed)+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-starting-style:transform-[translateY(calc(100%-var(--bleed)+2px))] data-swiping:select-none"
              >
                <div class="mx-auto mb-4 h-1 w-12 rounded-full bg-gray-300"></div>
                <Drawer.Content class="mx-auto w-full max-w-lg">
                  <Drawer.Title
                    class="mt-0 mb-1 text-center text-base/7 font-semibold tracking-normal"
                  >
                    Filters
                  </Drawer.Title>
                  <Drawer.Description class="mb-4 text-center text-sm/6 text-gray-600">
                    The page behind scales back while this drawer is open.
                  </Drawer.Description>
                  <div class="flex justify-center gap-4">
                    <Drawer.Close
                      class="box-border flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
                    >
                      Apply
                    </Drawer.Close>
                  </div>
                </Drawer.Content>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </Drawer.Indent>
  </div>
</Drawer.Provider>
