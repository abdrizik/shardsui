<script lang="ts">
  import { Collapsible } from '$lib/components/collapsible'

  let {
    open = false,
    onOpenChange = undefined
  }: {
    open?: boolean
    onOpenChange?: (open: boolean) => void
  } = $props()
</script>

<Collapsible.Root bind:open={() => open, () => {}} {onOpenChange}>
  <Collapsible.Trigger>Trigger</Collapsible.Trigger>
  <Collapsible.Panel>This is panel content</Collapsible.Panel>
</Collapsible.Root>
