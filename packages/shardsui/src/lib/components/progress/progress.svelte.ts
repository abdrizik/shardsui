import { clamp } from '$lib/internal/clamp'
import { dataAttrs } from '$lib/internal/data-attrs'
import { formatNumber } from '$lib/internal/format-number'
import { valueToPercent } from '$lib/internal/value-to-percent'

export type ProgressStatus = 'indeterminate' | 'progressing' | 'complete'

export type ProgressState = {
  status: ProgressStatus
}

type ProgressRootOptions = {
  value: number | null
  min: number
  max: number
  format: Intl.NumberFormatOptions | undefined
  locale: Intl.LocalesArgument
}

export class ProgressRoot {
  #options: () => ProgressRootOptions

  labelId = $state<string | undefined>(undefined)

  value = $derived.by(() => this.#options().value)

  #determinateValue = $derived.by(() => {
    const value = this.value
    return value != null && Number.isFinite(value) ? value : null
  })

  clampedValue = $derived.by(() => {
    const value = this.#determinateValue
    if (value == null) return null
    return clamp(value, this.#options().min, this.#options().max)
  })

  percentageValue = $derived.by(() => {
    const value = this.#determinateValue
    if (value == null) return null
    const percentage = valueToPercent(value, this.#options().min, this.#options().max)
    return clamp(Number.isNaN(percentage) ? 0 : percentage, 0, 100)
  })

  formattedValue = $derived.by(() => {
    const clampedValue = this.clampedValue
    const percentageValue = this.percentageValue
    if (clampedValue == null || percentageValue == null) return ''
    return this.#options().format
      ? formatNumber(clampedValue, this.#options().locale, this.#options().format)
      : formatNumber(percentageValue / 100, this.#options().locale, { style: 'percent' })
  })

  status: ProgressStatus = $derived.by(() => {
    if (this.#determinateValue == null) return 'indeterminate'
    return this.clampedValue === this.#options().max ? 'complete' : 'progressing'
  })

  state: ProgressState = $derived({ status: this.status })

  stateAttrs = $derived(
    dataAttrs({
      indeterminate: this.status === 'indeterminate',
      progressing: this.status === 'progressing',
      complete: this.status === 'complete'
    })
  )

  constructor(options: () => ProgressRootOptions) {
    this.#options = options
  }
}
