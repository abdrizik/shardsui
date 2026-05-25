import { clamp } from '$lib/internal/clamp'
import { formatNumber } from '$lib/internal/format-number'
import { valueToPercent } from '$lib/internal/value-to-percent'

type MeterRootOptions = {
  value: number
  min: number
  max: number
  format: Intl.NumberFormatOptions | undefined
  locale: Intl.LocalesArgument
}

export class MeterRoot {
  #options: () => MeterRootOptions

  labelId = $state<string | undefined>(undefined)

  value = $derived.by(() => this.#options().value)

  percentageValue = $derived.by(() => {
    const percentage = valueToPercent(this.value, this.#options().min, this.#options().max)
    return clamp(Number.isNaN(percentage) ? 0 : percentage, 0, 100)
  })

  clampedValue = $derived.by(() =>
    clamp(
      Number.isNaN(this.value) ? this.#options().min : this.value,
      this.#options().min,
      this.#options().max
    )
  )

  formattedValue = $derived.by(() =>
    this.#options().format
      ? formatNumber(this.clampedValue, this.#options().locale, this.#options().format)
      : formatNumber(this.percentageValue / 100, this.#options().locale, { style: 'percent' })
  )

  constructor(options: () => MeterRootOptions) {
    this.#options = options
  }
}
