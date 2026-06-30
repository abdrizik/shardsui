<script lang="ts">
  import { Accordion } from '$lib/components/accordion'

  let {
    value = [],
    multiple = false,
    onValueChange = undefined,
    itemValues = ['one', 'two']
  }: {
    value?: unknown[]
    multiple?: boolean
    onValueChange?: (value: unknown[]) => void
    itemValues?: unknown[]
  } = $props()
</script>

<Accordion.Root {value} {multiple} {onValueChange}>
  <Accordion.Item value={itemValues[0]}>
    <Accordion.Header>
      <Accordion.Trigger>Trigger 1</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Panel contents 1</Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item value={itemValues[1]}>
    <Accordion.Header>
      <Accordion.Trigger>Trigger 2</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Panel contents 2</Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
