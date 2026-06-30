<script lang="ts">
  import { Accordion } from '$lib/components/accordion'
</script>

<Accordion.Root hiddenUntilFound keepMounted>
  <Accordion.Item value={0}>
    <Accordion.Header>
      <Accordion.Trigger>Trigger 1</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Panel contents 1</Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item value={1}>
    <Accordion.Header>
      <Accordion.Trigger>Trigger 2</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel hiddenUntilFound={false} keepMounted={false}>Overridden panel</Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
