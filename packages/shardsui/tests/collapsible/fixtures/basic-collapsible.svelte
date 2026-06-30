<script lang="ts">
  import { Collapsible } from '$lib/components/collapsible'

  let {
    open = $bindable(false),
    onOpenChange = undefined,
    disabled = false,
    onTriggerClick = undefined
  }: {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    disabled?: boolean
    onTriggerClick?: (event: MouseEvent) => void
  } = $props()
</script>

<Collapsible.Root bind:open {onOpenChange} {disabled}>
  <Collapsible.Trigger onclick={onTriggerClick}>Trigger</Collapsible.Trigger>
  <Collapsible.Panel>This is panel content</Collapsible.Panel>
</Collapsible.Root>
