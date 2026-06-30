<script lang="ts">
  import { Collapsible } from '$lib/components/collapsible'

  let {
    open = $bindable(false),
    onOpenChange = undefined
  }: { open?: boolean; onOpenChange?: (open: boolean) => void } = $props()
</script>

<Collapsible.Root bind:open {onOpenChange}>
  <Collapsible.Trigger>Trigger</Collapsible.Trigger>
  <Collapsible.Panel hiddenUntilFound data-testid="panel">This is panel content</Collapsible.Panel>
</Collapsible.Root>
