<script lang="ts">
  import { Slider } from '$lib/components/slider'

  type Value = number | number[]

  let {
    value = $bindable(50),
    min = 0,
    max = 100,
    step = 1,
    largeStep = 10,
    disabled = false,
    name,
    format,
    locale,
    ariaLabelledby,
    thumbAriaLabelledby,
    thumbAriaValuetext,
    thumbTabindex,
    thumbOnfocus,
    thumbOnblur,
    showChild = false,
    onValueChange,
    onValueCommitted
  }: {
    value?: Value
    min?: number
    max?: number
    step?: number
    largeStep?: number
    disabled?: boolean
    name?: string
    format?: Intl.NumberFormatOptions
    locale?: string
    ariaLabelledby?: string
    thumbAriaLabelledby?: string
    thumbAriaValuetext?: string
    thumbTabindex?: number
    thumbOnfocus?: (event: FocusEvent) => void
    thumbOnblur?: (event: FocusEvent) => void
    showChild?: boolean
    onValueChange?: (value: Value) => void
    onValueCommitted?: (value: Value) => void
  } = $props()
</script>

<Slider.Root
  {value}
  {min}
  {max}
  {step}
  {largeStep}
  {disabled}
  {name}
  {format}
  {locale}
  aria-labelledby={ariaLabelledby}
  {onValueChange}
  {onValueCommitted}
  data-testid="root"
>
  <Slider.Value data-testid="value" />
  <Slider.Control data-testid="control">
    <Slider.Track data-testid="track">
      <Slider.Indicator data-testid="indicator" />
      <Slider.Thumb
        data-testid="thumb"
        aria-labelledby={thumbAriaLabelledby}
        aria-valuetext={thumbAriaValuetext}
        tabindex={thumbTabindex}
        onfocus={thumbOnfocus}
        onblur={thumbOnblur}
      >
        {#if showChild}
          <span data-testid="child"></span>
        {/if}
      </Slider.Thumb>
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
