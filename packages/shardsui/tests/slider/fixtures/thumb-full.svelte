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
    name = undefined,
    format = undefined,
    locale = undefined,
    ariaLabelledby = undefined,
    thumbAriaLabelledby = undefined,
    thumbAriaValuetext = undefined,
    thumbTabindex = undefined,
    thumbOnfocus = undefined as ((event: FocusEvent) => void) | undefined,
    thumbOnblur = undefined as ((event: FocusEvent) => void) | undefined,
    showChild = false,
    onValueChange = undefined as ((value: Value) => void) | undefined,
    onValueCommitted = undefined as ((value: Value) => void) | undefined
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
