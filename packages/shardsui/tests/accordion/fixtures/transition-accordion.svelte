<script lang="ts">
  import { Accordion } from '$lib/components/accordion'
</script>

<Accordion.Root value={[0]} multiple={false}>
  <Accordion.Item value={0}>
    <Accordion.Header>
      <Accordion.Trigger>Trigger 1</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel class="transition-test-panel" data-testid="panel-1" keepMounted>
      First panel
    </Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item value={1}>
    <Accordion.Header>
      <Accordion.Trigger>Trigger 2</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel class="transition-test-panel" data-testid="panel-2" keepMounted>
      Second panel
    </Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>

<style>
  :global(.transition-test-panel) {
    overflow: hidden;
    height: var(--accordion-panel-height);
    transition: height 300ms linear;
  }

  :global(.transition-test-panel[data-starting-style]),
  :global(.transition-test-panel[data-ending-style]) {
    height: 0;
  }
</style>
