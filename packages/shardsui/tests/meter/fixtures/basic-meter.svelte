<script lang="ts">
  import { Meter } from '$lib/components/meter'

  let {
    value = 50,
    min,
    max,
    format,
    locale,
    rootStyle,
    label,
    labelId,
    rootAs,
    labelAs,
    trackAs,
    indicatorAs,
    valueAs
  }: {
    value?: number
    min?: number
    max?: number
    format?: Intl.NumberFormatOptions
    locale?: Intl.LocalesArgument
    rootStyle?: string
    label?: string
    labelId?: string
    rootAs?: keyof HTMLElementTagNameMap
    labelAs?: keyof HTMLElementTagNameMap
    trackAs?: keyof HTMLElementTagNameMap
    indicatorAs?: keyof HTMLElementTagNameMap
    valueAs?: keyof HTMLElementTagNameMap
  } = $props()
</script>

<Meter.Root as={rootAs} {value} {min} {max} {format} {locale} style={rootStyle}>
  {#if label}
    <Meter.Label as={labelAs} id={labelId}>{label}</Meter.Label>
  {/if}
  <Meter.Value as={valueAs} data-testid="value" />
  <Meter.Track as={trackAs} data-testid="track">
    <Meter.Indicator as={indicatorAs} data-testid="indicator" />
  </Meter.Track>
</Meter.Root>
