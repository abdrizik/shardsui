<script lang="ts">
  import { Accordion } from '$lib/components/accordion'

  let {
    rootAs = 'div',
    itemAs = 'div',
    headerAs = 'h3',
    triggerAs = 'button',
    panelAs = 'div'
  }: {
    rootAs?: keyof HTMLElementTagNameMap
    itemAs?: keyof HTMLElementTagNameMap
    headerAs?: keyof HTMLElementTagNameMap
    triggerAs?: keyof HTMLElementTagNameMap
    panelAs?: keyof HTMLElementTagNameMap
  } = $props()
</script>

<Accordion.Root as={rootAs} value={['one']} data-testid="root">
  <Accordion.Item as={itemAs} value="one" data-testid="item">
    <Accordion.Header as={headerAs} data-testid="header">
      <Accordion.Trigger as={triggerAs} data-testid="trigger">Trigger</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel as={panelAs} data-testid="panel">Panel</Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
