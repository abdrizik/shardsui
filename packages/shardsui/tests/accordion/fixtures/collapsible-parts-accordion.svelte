<script lang="ts">
  import { Accordion } from '$lib/components/accordion'
  import { Collapsible } from '$lib/components/collapsible'
</script>

<Accordion.Root>
  <Accordion.Item value="one">
    <Accordion.Header>
      <Collapsible.Trigger>Trigger</Collapsible.Trigger>
    </Accordion.Header>
    <Collapsible.Panel data-testid="panel">Panel contents</Collapsible.Panel>
  </Accordion.Item>
</Accordion.Root>
