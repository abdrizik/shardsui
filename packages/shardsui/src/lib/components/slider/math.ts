import { clamp } from '$lib/internal/clamp'

export function asc(a: number, b: number): number {
  return a - b
}

export function getDecimalPrecision(num: number): number {
  if (num === 0) return 0

  if (Math.abs(num) < 1) {
    const parts = num.toExponential().split('e-')
    const matissaDecimalPart = parts[0].split('.')[1]
    return (matissaDecimalPart ? matissaDecimalPart.length : 0) + parseInt(parts[1], 10)
  }

  const decimalPart = num.toString().split('.')[1]
  return decimalPart ? decimalPart.length : 0
}

export function roundValueToStep(value: number, step: number, min: number): number {
  const nearest = Math.round((value - min) / step) * step + min
  return Number(nearest.toFixed(Math.max(getDecimalPrecision(step), getDecimalPrecision(min))))
}

export function getSliderValue(
  valueInput: number,
  index: number,
  min: number,
  max: number,
  range: boolean,
  values: readonly number[]
): number | number[] {
  const clamped = clamp(valueInput, min, max)
  if (!range) return clamped

  const output = values.slice()
  output[index] = clamp(clamped, values[index - 1] ?? -Infinity, values[index + 1] ?? Infinity)
  return output.sort(asc)
}

export function validateMinimumDistance(
  values: number | readonly number[],
  step: number,
  minStepsBetweenValues: number
): boolean {
  if (!Array.isArray(values)) return true

  const minDistance = step * minStepsBetweenValues
  for (let i = 0; i < values.length - 1; i += 1) {
    if (!(Math.abs(values[i] - values[i + 1]) >= minDistance)) return false
  }
  return true
}

export function getMidpoint(element: HTMLElement, vertical: boolean): number {
  const rect = element.getBoundingClientRect()
  return vertical ? (rect.top + rect.bottom) / 2 : (rect.left + rect.right) / 2
}

type GetPushedThumbValuesOptions = {
  values: readonly number[]
  index: number
  nextValue: number
  min: number
  max: number
  step: number
  minStepsBetweenValues: number
  initialValues?: readonly number[]
}

export function getPushedThumbValues({
  values,
  index,
  nextValue,
  min,
  max,
  step,
  minStepsBetweenValues,
  initialValues
}: GetPushedThumbValuesOptions): number[] {
  const nextValues = values.slice()
  const minValueDifference = step * minStepsBetweenValues
  const lastIndex = nextValues.length - 1
  const baseInitialValues = initialValues ?? values

  const indexMin = min + index * minValueDifference
  const indexMax = max - (lastIndex - index) * minValueDifference
  nextValues[index] = clamp(nextValue, indexMin, indexMax)

  for (let i = index + 1; i <= lastIndex; i += 1) {
    const minAllowed = nextValues[i - 1] + minValueDifference
    const maxAllowed = max - (lastIndex - i) * minValueDifference
    const initialValue = baseInitialValues[i]
    let candidate = Math.max(nextValues[i], minAllowed)

    if (initialValue < candidate) {
      candidate = Math.max(initialValue, minAllowed)
    }

    nextValues[i] = clamp(candidate, minAllowed, maxAllowed)
  }

  for (let i = index - 1; i >= 0; i -= 1) {
    const maxAllowed = nextValues[i + 1] - minValueDifference
    const minAllowed = min + i * minValueDifference
    const initialValue = baseInitialValues[i]
    let candidate = Math.min(nextValues[i], maxAllowed)

    if (initialValue > candidate) {
      candidate = Math.min(initialValue, maxAllowed)
    }

    nextValues[i] = clamp(candidate, minAllowed, maxAllowed)
  }

  for (let i = 0; i <= lastIndex; i += 1) {
    nextValues[i] = Number(nextValues[i].toFixed(12))
  }

  return nextValues
}

type ResolveThumbCollisionOptions = {
  behavior: 'push' | 'swap' | 'none'
  values: readonly number[]
  currentValues: readonly number[]
  initialValues?: readonly number[] | null
  pressedIndex: number
  nextValue: number
  min: number
  max: number
  step: number
  minStepsBetweenValues: number
}

export type ResolveThumbCollisionResult = {
  value: number | number[]
  thumbIndex: number
  didSwap: boolean
}

function clampThumbBetweenNeighbors(
  values: readonly number[],
  index: number,
  nextValue: number,
  minValueDifference: number,
  min: number,
  max: number
): {
  candidateValues: number[]
  clampedValue: number
  previousNeighbor: number
  nextNeighbor: number
} {
  const candidateValues = values.slice()
  const previousNeighbor = candidateValues[index - 1]
  const nextNeighbor = candidateValues[index + 1]
  const lowerBound = previousNeighbor != null ? previousNeighbor + minValueDifference : min
  const upperBound = nextNeighbor != null ? nextNeighbor - minValueDifference : max
  const clampedValue = Number(clamp(nextValue, lowerBound, upperBound).toFixed(12))
  candidateValues[index] = clampedValue
  return { candidateValues, clampedValue, previousNeighbor, nextNeighbor }
}

// Tolerance for the neighbour comparisons below: stepped values carry float error, so a thumb
// dragged exactly onto its neighbour can land a hair short of it.
const SWAP_EPSILON = 1e-7

type SwapOptions = {
  activeValues: readonly number[]
  baselineValues: readonly number[]
  pressedIndex: number
  nextValue: number
  min: number
  max: number
  step: number
  minStepsBetweenValues: number
  minValueDifference: number
}

function swapThumbs({
  activeValues,
  baselineValues,
  pressedIndex,
  nextValue,
  min,
  max,
  step,
  minStepsBetweenValues,
  minValueDifference
}: SwapOptions): ResolveThumbCollisionResult {
  const pressedInitialValue = activeValues[pressedIndex]
  const {
    candidateValues,
    clampedValue: pressedValueAfterClamp,
    previousNeighbor,
    nextNeighbor
  } = clampThumbBetweenNeighbors(
    activeValues,
    pressedIndex,
    nextValue,
    minValueDifference,
    min,
    max
  )

  const shouldSwapForward =
    nextValue > pressedInitialValue &&
    nextNeighbor != null &&
    nextValue >= nextNeighbor - SWAP_EPSILON
  const shouldSwapBackward =
    nextValue < pressedInitialValue &&
    previousNeighbor != null &&
    nextValue <= previousNeighbor + SWAP_EPSILON

  if (!shouldSwapForward && !shouldSwapBackward) {
    return { value: candidateValues, thumbIndex: pressedIndex, didSwap: false }
  }

  const targetIndex = shouldSwapForward ? pressedIndex + 1 : pressedIndex - 1

  const initialValuesForPush = candidateValues.map((_, index) => {
    if (index === pressedIndex) return pressedValueAfterClamp
    return baselineValues[index] ?? activeValues[index]
  })

  const nextValueForTarget = shouldSwapForward
    ? Math.max(nextValue, candidateValues[targetIndex])
    : Math.min(nextValue, candidateValues[targetIndex])

  const adjustedValues = getPushedThumbValues({
    values: candidateValues,
    index: targetIndex,
    nextValue: nextValueForTarget,
    min,
    max,
    step,
    minStepsBetweenValues,
    initialValues: initialValuesForPush
  })

  const lowerNeighbor = adjustedValues[pressedIndex - 1]
  const upperNeighbor = adjustedValues[pressedIndex + 1]

  const lowerBound = Math.max(
    lowerNeighbor != null ? lowerNeighbor + minValueDifference : min,
    min + pressedIndex * minValueDifference
  )
  const upperBound = Math.min(
    upperNeighbor != null ? upperNeighbor - minValueDifference : max,
    max - (adjustedValues.length - 1 - pressedIndex) * minValueDifference
  )

  adjustedValues[pressedIndex] = Number(
    clamp(pressedValueAfterClamp, lowerBound, upperBound).toFixed(12)
  )

  return { value: adjustedValues, thumbIndex: targetIndex, didSwap: true }
}

export function resolveThumbCollision({
  behavior,
  values,
  currentValues,
  initialValues,
  pressedIndex,
  nextValue,
  min,
  max,
  step,
  minStepsBetweenValues
}: ResolveThumbCollisionOptions): ResolveThumbCollisionResult {
  if (currentValues.length <= 1) {
    return { value: nextValue, thumbIndex: 0, didSwap: false }
  }

  const minValueDifference = step * minStepsBetweenValues

  if (behavior === 'swap') {
    return swapThumbs({
      activeValues: currentValues,
      baselineValues: initialValues ?? values,
      pressedIndex,
      nextValue,
      min,
      max,
      step,
      minStepsBetweenValues,
      minValueDifference
    })
  }

  if (behavior === 'push') {
    return {
      value: getPushedThumbValues({
        values: currentValues,
        index: pressedIndex,
        nextValue,
        min,
        max,
        step,
        minStepsBetweenValues
      }),
      thumbIndex: pressedIndex,
      didSwap: false
    }
  }

  const { candidateValues } = clampThumbBetweenNeighbors(
    currentValues,
    pressedIndex,
    nextValue,
    minValueDifference,
    min,
    max
  )

  return { value: candidateValues, thumbIndex: pressedIndex, didSwap: false }
}

function parseSize(value: string): number {
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function getControlOffset(
  styles: CSSStyleDeclaration | null,
  vertical: boolean
): { start: number; end: number } {
  if (!styles) return { start: 0, end: 0 }

  const sum = (...properties: string[]) =>
    properties.reduce((total, property) => total + parseSize(styles.getPropertyValue(property)), 0)

  return vertical
    ? {
        start: sum('border-top-width', 'padding-top'),
        end: sum('border-bottom-width', 'padding-bottom')
      }
    : {
        start: sum('border-inline-start-width', 'padding-inline-start'),
        end: sum('border-inline-end-width', 'padding-inline-end')
      }
}
