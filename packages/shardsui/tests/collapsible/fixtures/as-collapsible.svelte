<script lang="ts">
  import { Collapsible } from '$lib/components/collapsible'

  let {
    rootAs = 'div',
    triggerAs = 'button',
    panelAs = 'div'
  }: {
    rootAs?: keyof HTMLElementTagNameMap
    triggerAs?: keyof HTMLElementTagNameMap
    panelAs?: keyof HTMLElementTagNameMap
  } = $props()
</script>

<Collapsible.Root as={rootAs} open data-testid="root">
  <Collapsible.Trigger as={triggerAs} data-testid="trigger">Trigger</Collapsible.Trigger>
  <Collapsible.Panel as={panelAs} data-testid="panel">This is panel content</Collapsible.Panel>
</Collapsible.Root>
