<script lang="ts">
  import { Collapsible } from '$lib/components/collapsible'

  let {
    keepMounted = false,
    onOpenChange
  }: {
    keepMounted?: boolean
    onOpenChange?: (open: boolean) => void
  } = $props()

  let open = $state(false)
</script>

<Collapsible.Root
  {open}
  onOpenChange={(next) => {
    open = next
    onOpenChange?.(next)
  }}
>
  <Collapsible.Trigger>Trigger</Collapsible.Trigger>
  <Collapsible.Panel {keepMounted} data-testid="panel">This is panel content</Collapsible.Panel>
</Collapsible.Root>

<button type="button" onclick={() => (open = !open)}>toggle externally</button>
