<script lang="ts">
  import { Toast } from '@shardsui/svelte/toast'

  const manager = new Toast.Manager()

  function deleteItem() {
    const id = manager.add({
      title: 'Item deleted',
      description: 'It was removed from your list.',
      timeout: 10000,
      actionProps: {
        children: 'Undo',
        onclick() {
          manager.close(id)
          manager.add({ title: 'Item restored' })
        }
      }
    })
  }
</script>

<Toast.Provider toastManager={manager}>
  <button
    type="button"
    class="box-border flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 py-0 text-sm font-normal text-gray-900 outline-0 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
    onclick={deleteItem}>Delete item</button
  >

  <Toast.Portal>
    <Toast.Viewport
      class="fixed top-auto right-4 bottom-4 z-10 mx-auto flex w-62.5 sm:right-8 sm:bottom-8 sm:w-75"
    >
      {#each Toast.getToastManager().toasts as toast (toast.id)}
        <Toast.Root
          {toast}
          class="absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] mr-0 h-(--height) w-full origin-bottom transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] rounded-lg bg-gray-50 p-4 shadow-lg outline-1 outline-gray-200 select-none [--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s] after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-ending-style:opacity-0 data-expanded:h-(--toast-height) data-expanded:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))] data-limited:opacity-0 data-starting-style:transform-[translateY(150%)] data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+150%))] data-expanded:data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+150%))] data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-150%))] data-expanded:data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-150%))] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:transform-[translateY(150%)]"
        >
          <Toast.Content
            class="overflow-hidden transition-opacity duration-250 data-behind:pointer-events-none data-behind:opacity-0 data-expanded:pointer-events-auto data-expanded:opacity-100"
          >
            <Toast.Title class="text-sm/5 font-semibold" />
            <Toast.Description class="text-sm/5 text-gray-700" />
            <Toast.Action
              class="mt-2 inline-flex h-8 items-center justify-center rounded border-none bg-gray-900 px-3 text-sm/5 font-normal text-gray-50 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950"
            />
          </Toast.Content>
        </Toast.Root>
      {/each}
    </Toast.Viewport>
  </Toast.Portal>
</Toast.Provider>
