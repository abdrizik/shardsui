<script lang="ts">
  import { Drawer } from '$lib/components/drawer'

  let { keepMounted = false }: { keepMounted?: boolean } = $props()

  let inputElement = $state<HTMLElement | null>(null)

  function elementFor(type: string) {
    if (type === 'keyboard') {
      return inputElement
    }
    return true
  }
</script>

<div>
  <Drawer.Root>
    <Drawer.Trigger>Open</Drawer.Trigger>
    <Drawer.Portal {keepMounted}>
      <Drawer.Backdrop />
      <Drawer.Viewport>
        <Drawer.Popup finalFocus={elementFor}>
          <Drawer.Close>Close</Drawer.Close>
        </Drawer.Popup>
      </Drawer.Viewport>
    </Drawer.Portal>
  </Drawer.Root>
  <input data-testid="final-input" bind:this={inputElement} />
</div>
