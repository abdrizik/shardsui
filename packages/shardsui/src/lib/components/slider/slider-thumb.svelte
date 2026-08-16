<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { FieldContext } from '$lib/components/field/context'
  import { getFieldAriaInvalid } from '$lib/components/field/field.svelte'
  import { LabelableContext } from '$lib/internal/labelable-context'
  import { mergeDescribedBy } from '$lib/internal/labelable.svelte'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { formatNumber } from '$lib/internal/format-number'
  import { DirectionContext } from '$lib/internal/direction-context'
  import { mergeStyle } from '$lib/internal/merge-style'
  import { visuallyHidden } from '$lib/internal/visually-hidden'
  import type { SliderState } from './slider.svelte'
  import { SliderContext } from './context'
  import { SliderThumb } from './thumb.svelte'

  type Props = PartProps<[SliderState], 'div', 'onkeydown'> & {
    index?: number
    disabled?: boolean
  }

  const uid = $props.id()

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    id = uid,
    index: explicitIndex,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledByProp,
    'aria-describedby': ariaDescribedByProp,
    'aria-valuetext': ariaValueTextProp,
    disabled: disabledProp = false,
    tabindex,
    onblur,
    onfocus,
    onkeydown,
    children,
    ...rest
  }: Props = $props()

  const slider = SliderContext.get()
  const field = FieldContext.getOr()
  const labelable = LabelableContext.get()
  const direction = DirectionContext.get()
  const rtl = $derived(direction.direction === 'rtl')

  let input: HTMLInputElement | null = null

  const thumb = new SliderThumb(slider, () => ({
    ref,
    input,
    index: explicitIndex,
    disabled: disabledProp,
    generatedInputId: `${uid}-input`,
    onfocus,
    onblur
  }))

  const defaultAriaValueText = $derived.by(() => {
    if (!thumb.resolved) return undefined
    const formatted = formatNumber(thumb.value, slider.locale, slider.format)
    if (slider.values.length === 2) {
      return `${formatted} ${thumb.index === 0 ? 'start range' : 'end range'}`
    }
    return slider.format ? formatted : undefined
  })

  const ariaLabelledBy = $derived(
    ariaLabelledByProp ?? (ariaLabel == null ? slider.ariaLabelledBy : undefined)
  )
  const ariaDescribedBy = $derived(mergeDescribedBy(ariaDescribedByProp, labelable.messageIds))
  const ariaInvalid = $derived(getFieldAriaInvalid(field, thumb.disabled))
  const ariaValueText = $derived(ariaValueTextProp ?? defaultAriaValueText)

  const thumbStyle = $derived.by(() => {
    if (!slider.inset && !Number.isFinite(thumb.valuePercent)) return visuallyHidden

    const startEdge = thumb.vertical ? 'bottom' : 'inset-inline-start'
    const crossOffset = thumb.vertical ? 'left' : 'top'

    let zIndex = ''
    if (slider.range) {
      if (slider.activeThumbIndex === thumb.index) zIndex = 'z-index: 2;'
      else if (slider.lastUsedThumbIndex === thumb.index) zIndex = 'z-index: 1;'
    } else if (slider.activeThumbIndex === thumb.index) {
      zIndex = 'z-index: 1;'
    }

    const translate = `${(thumb.vertical || !rtl ? -1 : 1) * 50}% ${(thumb.vertical ? 1 : -1) * 50}%`

    if (slider.inset) {
      const hidden = thumb.insetPosition === undefined ? 'visibility: hidden; ' : ''
      return `--position: ${thumb.insetPosition ?? 0}%; position: absolute; ${startEdge}: var(--position); ${crossOffset}: 50%; translate: ${translate}; ${hidden}${zIndex}`
    }

    return `position: absolute; ${startEdge}: ${thumb.valuePercent}%; ${crossOffset}: 50%; translate: ${translate}; ${zIndex}`
  })

  const mergedStyle = $derived(mergeStyle(thumbStyle, style))

  const writingMode = $derived(thumb.vertical ? (rtl ? 'vertical-rl' : 'vertical-lr') : undefined)

  const stateAttrs = $derived(dataAttrs({ index: thumb.index }))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...slider.stateAttrs}
  {...stateAttrs}
  {id}
  style={mergedStyle}
  {@attach thumb.registerThumb}
  {@attach thumb.observeInsetPosition}
  {...rest}
>
  {@render children?.(slider.state)}
  <input
    bind:this={input}
    type="range"
    id={thumb.inputId}
    min={slider.min}
    max={slider.max}
    step={slider.step}
    value={thumb.value}
    disabled={thumb.disabled}
    name={slider.name}
    form={slider.form}
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledBy}
    aria-describedby={ariaDescribedBy}
    aria-invalid={ariaInvalid}
    aria-orientation={slider.orientation}
    aria-valuenow={thumb.resolved ? thumb.value : undefined}
    aria-valuetext={ariaValueText}
    {tabindex}
    style="{visuallyHidden}width: 100%; height: 100%;"
    style:writing-mode={writingMode}
    onkeydown={chain(onkeydown, thumb.onkeydown)}
    oninput={thumb.oninput}
    onfocus={thumb.onfocus}
    onblur={thumb.onblur}
  />
</svelte:element>
