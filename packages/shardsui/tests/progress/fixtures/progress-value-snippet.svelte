<script lang="ts">
  import { Progress } from '$lib/components/progress'

  let {
    value = 30,
    format,
    onRender
  }: {
    value?: number | null
    format?: Intl.NumberFormatOptions
    onRender?: (formattedValue: string, value: number | null) => void
  } = $props()
</script>

<Progress.Root {value} {format}>
  <Progress.Value data-testid="value">
    {#snippet children(formattedValue, value)}
      {onRender?.(formattedValue, value)}
      {formattedValue}
    {/snippet}
  </Progress.Value>
</Progress.Root>
