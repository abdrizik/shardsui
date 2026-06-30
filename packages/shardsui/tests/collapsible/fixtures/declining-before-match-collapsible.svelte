<script lang="ts">
  import { Collapsible } from '$lib/components/collapsible'

  let {
    onOpenChange = undefined,
    css = ''
  }: {
    onOpenChange?: (open: boolean) => void
    css?: string
  } = $props()

  let open = $state(false)
  let declining = $state(true)
</script>

{@html `<style>${css}</style>`}

<button type="button" data-testid="allow" onclick={() => (declining = false)}>Allow</button>

<Collapsible.Root
  bind:open={() => open, (next) => !declining && (open = next)}
  onOpenChange={(next) => onOpenChange?.(next)}
>
  <Collapsible.Trigger>Trigger</Collapsible.Trigger>
  <Collapsible.Panel
    class="transition-test-panel"
    style="transition-duration: 123ms;"
    hiddenUntilFound
    keepMounted
    data-testid="panel"
  >
    This is panel content
  </Collapsible.Panel>
</Collapsible.Root>
