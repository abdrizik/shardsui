<script lang="ts">
  import { Accordion } from '$lib/components/accordion'

  let {
    value = [],
    multiple = false,
    disabled = false,
    itemDisabled = false,
    onValueChange = undefined,
    keepMounted = false
  }: {
    value?: unknown[]
    multiple?: boolean
    disabled?: boolean
    itemDisabled?: boolean
    onValueChange?: (value: unknown[]) => void
    keepMounted?: boolean
  } = $props()
</script>

<Accordion.Root {value} {multiple} {disabled} {onValueChange} {keepMounted}>
  <Accordion.Item data-testid="item1" disabled={itemDisabled}>
    <Accordion.Header>
      <Accordion.Trigger>Trigger 1</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Panel 1</Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item data-testid="item2">
    <Accordion.Header>
      <Accordion.Trigger>Trigger 2</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Panel 2</Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
