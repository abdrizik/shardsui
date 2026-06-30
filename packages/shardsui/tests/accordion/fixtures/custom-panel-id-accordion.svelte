<script lang="ts">
  import { Accordion } from '$lib/components/accordion'
</script>

<Accordion.Root value={[0]}>
  <Accordion.Item value={0}>
    <Accordion.Header>
      <Accordion.Trigger>Trigger 1</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel id="custom-panel-id">Panel contents 1</Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
