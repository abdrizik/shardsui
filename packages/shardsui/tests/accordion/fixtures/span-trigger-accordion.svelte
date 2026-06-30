<script lang="ts">
  import { Accordion } from '$lib/components/accordion'
</script>

<Accordion.Root>
  <Accordion.Item>
    <Accordion.Header>
      <Accordion.Trigger as="span">Trigger</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Panel</Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
