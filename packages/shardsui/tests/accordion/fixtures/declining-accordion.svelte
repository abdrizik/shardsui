<script lang="ts">
  import { Accordion } from '$lib/components/accordion'

  let {
    value = [],
    multiple = false,
    allowChange = false,
    onValueChange = undefined
  }: {
    value?: unknown[]
    multiple?: boolean
    allowChange?: boolean
    onValueChange?: (value: unknown[]) => void
  } = $props()
</script>

<Accordion.Root
  bind:value={() => value, (next) => allowChange && (value = next)}
  {multiple}
  {onValueChange}
>
  <Accordion.Item value="one">
    <Accordion.Header>
      <Accordion.Trigger>Trigger 1</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Panel 1</Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item value="two">
    <Accordion.Header>
      <Accordion.Trigger>Trigger 2</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Panel 2</Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
