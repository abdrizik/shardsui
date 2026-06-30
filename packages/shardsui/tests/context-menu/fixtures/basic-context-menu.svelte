<script lang="ts">
  import { ContextMenu } from '$lib/components/context-menu'

  let {
    disabled = false,
    onOpenChange = undefined,
    as = undefined,
    class: classProp = undefined,
    onRef = undefined,
    showTrigger = true,
    ...rest
  }: {
    disabled?: boolean
    onOpenChange?: (open: boolean) => void
    as?: keyof HTMLElementTagNameMap
    class?: string
    onRef?: (element: HTMLElement | null) => void
    showTrigger?: boolean
    [key: string]: unknown
  } = $props()

  let ref = $state<HTMLElement | null>(null)

  $effect(() => {
    if (ref) onRef?.(ref)
  })
</script>

<ContextMenu.Root {disabled} {onOpenChange}>
  {#if showTrigger}
    <ContextMenu.Trigger data-testid="trigger" {as} class={classProp} bind:ref {...rest}>
      Right-click me
    </ContextMenu.Trigger>
  {/if}
  <ContextMenu.Portal>
    <ContextMenu.Positioner data-testid="positioner">
      <ContextMenu.Popup data-testid="popup" />
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>
