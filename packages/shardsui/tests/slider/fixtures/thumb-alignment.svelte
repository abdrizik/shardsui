<script lang="ts">
  import { DirectionProvider, type TextDirection } from '$lib/components/direction-provider'
  import { Slider } from '$lib/components/slider'

  type Value = number | number[]

  let {
    value = 50,
    min = 0,
    max = 100,
    orientation = 'horizontal',
    thumbAlignment = 'edge',
    direction = 'ltr',
    thumbSize = 16,
    controlSize = 200,
    showLastThumb = true,
    hidden = false
  }: {
    value?: Value
    min?: number
    max?: number
    orientation?: 'horizontal' | 'vertical'
    thumbAlignment?: 'center' | 'edge'
    direction?: TextDirection
    thumbSize?: number
    controlSize?: number
    showLastThumb?: boolean
    hidden?: boolean
  } = $props()

  const vertical = $derived(orientation === 'vertical')
  const controlStyle = $derived(
    `position: relative; box-sizing: border-box; width: ${vertical ? thumbSize : controlSize}px; height: ${vertical ? controlSize : thumbSize}px;`
  )
  const thumbStyle = $derived(
    `box-sizing: border-box; width: ${thumbSize}px; height: ${thumbSize}px;`
  )
  const values = $derived(Array.isArray(value) ? value : [value])
</script>

<div dir={direction} style="display: {hidden ? 'none' : 'block'};">
  <DirectionProvider {direction}>
    <Slider.Root {value} {min} {max} {orientation} {thumbAlignment} data-testid="root">
      <Slider.Control data-testid="control" style={controlStyle}>
        <Slider.Track data-testid="track" style="position: relative; width: 100%; height: 100%;">
          <Slider.Indicator data-testid="indicator" />
          {#each values as _, index (index)}
            {#if showLastThumb || index < values.length - 1}
              <Slider.Thumb
                index={values.length > 1 ? index : undefined}
                data-testid="thumb-{index}"
                style={thumbStyle}
              />
            {/if}
          {/each}
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  </DirectionProvider>
</div>
