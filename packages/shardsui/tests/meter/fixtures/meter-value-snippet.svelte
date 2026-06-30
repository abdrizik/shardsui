<script lang="ts">
  import { Meter } from '$lib/components/meter'

  let {
    value = 30,
    format,
    onRender
  }: {
    value?: number
    format?: Intl.NumberFormatOptions
    onRender?: (formattedValue: string, rawValue: number) => void
  } = $props()
</script>

<Meter.Root {value} {format}>
  <Meter.Value data-testid="value">
    {#snippet children(formattedValue, rawValue)}
      {onRender?.(formattedValue, rawValue)}
      {formattedValue}
    {/snippet}
  </Meter.Value>
</Meter.Root>
