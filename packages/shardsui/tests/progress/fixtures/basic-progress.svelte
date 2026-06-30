<script lang="ts">
  import { Progress } from '$lib/components/progress'

  let {
    value = 50,
    min,
    max,
    format,
    locale,
    rootStyle,
    labelText,
    labelId
  }: {
    value?: number | null
    min?: number
    max?: number
    format?: Intl.NumberFormatOptions
    locale?: Intl.LocalesArgument
    rootStyle?: string
    labelText?: string
    labelId?: string
  } = $props()
</script>

<Progress.Root {value} {min} {max} {format} {locale} style={rootStyle}>
  {#if labelText}
    <Progress.Label id={labelId} data-testid="label">{labelText}</Progress.Label>
  {/if}
  <Progress.Track data-testid="track">
    <Progress.Indicator data-testid="indicator" />
  </Progress.Track>
  <Progress.Value data-testid="value" />
</Progress.Root>
