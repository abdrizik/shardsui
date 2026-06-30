<script lang="ts">
  import { Accordion } from '$lib/components/accordion'

  let {
    value = []
  }: {
    value?: unknown[]
  } = $props()
</script>

<Accordion.Root {value}>
  <Accordion.Item value={0}>
    <Accordion.Header>
      <Accordion.Trigger>Trigger 1</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Panel 1</Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
