<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let {
    finalFocus = undefined
  }: {
    finalFocus?:
      | boolean
      | HTMLElement
      | string
      | ((interactionType: string) => HTMLElement | boolean | null | void)
  } = $props()

  let inputToFocus = $state<HTMLInputElement | null>(null)

  const resolvedFinalFocus = $derived(
    finalFocus === 'element-ref'
      ? inputToFocus
      : finalFocus === 'function-ref'
        ? () => inputToFocus
        : finalFocus
  )
</script>

<div>
  <Menu.Root>
    <Menu.Trigger>Open</Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner>
        <Menu.Popup finalFocus={resolvedFinalFocus as never}>
          <Menu.Item data-testid="close-item">Close</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
  <input bind:this={inputToFocus} data-testid="input-to-focus" />
</div>
