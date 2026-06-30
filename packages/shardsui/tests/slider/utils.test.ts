import {
  getPushedThumbValues,
  getSliderValue,
  resolveThumbCollision,
  roundValueToStep
} from '$lib/components/slider/math'
import { expect } from 'vitest'

describe('roundValueToStep', () => {
  it('preserves precision from the step origin', () => {
    expect(roundValueToStep(0.35, 0.1, 0.25)).toBe(0.35)
  })

  it('preserves decimal precision for steps greater than one', () => {
    expect(roundValueToStep(13.2, 1.5, 10.2)).toBe(13.2)
  })
})

describe('getSliderValue', () => {
  it('clamps a single value to the min/max range', () => {
    expect(getSliderValue(150, 0, 0, 100, false, [50])).toBe(100)
    expect(getSliderValue(-10, 0, 0, 100, false, [50])).toBe(0)
  })

  describe('range neighbours', () => {
    it('does not let a thumb cross a neighbour whose value is 0', () => {
      expect(getSliderValue(5, 0, -10, 10, true, [-10, 0])).toEqual([0, 0])
      expect(getSliderValue(-5, 1, -10, 10, true, [0, 10])).toEqual([0, 0])
    })

    it('bounds a thumb between its real neighbours', () => {
      expect(getSliderValue(50, 1, 0, 100, true, [20, 40, 80])).toEqual([20, 50, 80])
      expect(getSliderValue(90, 1, 0, 100, true, [20, 40, 80])).toEqual([20, 80, 80])
      expect(getSliderValue(10, 1, 0, 100, true, [20, 40, 80])).toEqual([20, 20, 80])
    })

    it('leaves the outer edges unbounded by missing neighbours', () => {
      expect(getSliderValue(-30, 0, -50, 50, true, [-20, 0])).toEqual([-30, 0])
      expect(getSliderValue(40, 1, -50, 50, true, [-20, 0])).toEqual([-20, 40])
    })
  })
})

describe('getPushedThumbValues', () => {
  it('pushes the next thumb forward when moving past it', () => {
    const result = getPushedThumbValues({
      values: [20, 40],
      index: 0,
      nextValue: 70,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 0
    })

    expect(result).toEqual([70, 70])
  })

  it('ensures minimum distance between thumbs while pushing forward', () => {
    const result = getPushedThumbValues({
      values: [20, 40],
      index: 0,
      nextValue: 60,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 5
    })

    expect(result).toEqual([60, 65])
  })

  it('pushes previous thumbs backward when moving before them', () => {
    const result = getPushedThumbValues({
      values: [20, 40],
      index: 1,
      nextValue: -10,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 0
    })

    expect(result).toEqual([0, 0])
  })

  it('pushes multiple thumbs in sequence', () => {
    const result = getPushedThumbValues({
      values: [10, 50, 90],
      index: 1,
      nextValue: 95,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 5
    })

    expect(result).toEqual([10, 95, 100])
  })

  it('allows fractional minimum distances', () => {
    const result = getPushedThumbValues({
      values: [0, 1],
      index: 0,
      nextValue: 1.4,
      min: 0,
      max: 10,
      step: 1,
      minStepsBetweenValues: 0.4
    })

    expect(result[0]).toBe(1.4)
    expect(result[1]).toBe(1.8)
  })

  it('restores pushed thumbs towards their initial value when space allows', () => {
    const initialValues = [30, 50]

    const pushed = getPushedThumbValues({
      values: initialValues,
      initialValues,
      index: 1,
      nextValue: 20,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 0
    })

    expect(pushed).toEqual([20, 20])

    const restored = getPushedThumbValues({
      values: pushed,
      initialValues,
      index: 1,
      nextValue: 35,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 0
    })

    expect(restored).toEqual([30, 35])
  })
})

describe('resolveThumbCollision', () => {
  it('prevents thumbs from passing each other when behavior is "none"', () => {
    const result = resolveThumbCollision({
      behavior: 'none',
      values: [20, 40],
      currentValues: [20, 40],
      pressedIndex: 0,
      nextValue: 70,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 0
    })

    expect(result.value).toEqual([40, 40])
    expect(result.thumbIndex).toBe(0)
    expect(result.didSwap).toBe(false)
  })

  it('pushes thumbs forward without cling when behavior is "push"', () => {
    const result = resolveThumbCollision({
      behavior: 'push',
      values: [20, 40],
      currentValues: [20, 40],
      pressedIndex: 0,
      nextValue: 70,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 0
    })

    expect(result.value).toEqual([70, 70])
    expect(result.thumbIndex).toBe(0)
    expect(result.didSwap).toBe(false)
  })

  it('keeps pushed thumbs in place when moving backward in push mode', () => {
    const startValues = [20, 40]

    const pushed = resolveThumbCollision({
      behavior: 'push',
      values: startValues,
      currentValues: startValues,
      initialValues: startValues,
      pressedIndex: 0,
      nextValue: 70,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 0
    })

    const nextValues = pushed.value as number[]
    expect(nextValues).toEqual([70, 70])

    const movedBack = resolveThumbCollision({
      behavior: 'push',
      values: nextValues,
      currentValues: nextValues,
      initialValues: startValues,
      pressedIndex: 0,
      nextValue: 30,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 0
    })

    expect(movedBack.value).toEqual([30, 70])
    expect(movedBack.thumbIndex).toBe(0)
    expect(movedBack.didSwap).toBe(false)
  })

  it('swaps thumbs when behavior is "swap"', () => {
    const result = resolveThumbCollision({
      behavior: 'swap',
      values: [20, 40],
      currentValues: [20, 40],
      pressedIndex: 0,
      nextValue: 65,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 0
    })

    expect(result.value).toEqual([40, 65])
    expect(result.thumbIndex).toBe(1)
    expect(result.didSwap).toBe(true)
  })

  it('maintains swap continuity with minimum steps when provided current and initial values', () => {
    const startValues = [20, 80]

    const first = resolveThumbCollision({
      behavior: 'swap',
      values: startValues,
      currentValues: startValues,
      initialValues: startValues,
      pressedIndex: 0,
      nextValue: 85,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 10
    })

    const firstValues = first.value as number[]
    expect(firstValues).toEqual([70, 85])
    expect(first.thumbIndex).toBe(1)
    expect(first.didSwap).toBe(true)

    const continued = resolveThumbCollision({
      behavior: 'swap',
      values: startValues,
      currentValues: firstValues,
      initialValues: startValues,
      pressedIndex: first.thumbIndex,
      nextValue: 95,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 10
    })

    const continuedValues = continued.value as number[]
    expect(continuedValues).toEqual([70, 95])
    expect(continued.thumbIndex).toBe(1)
    expect(continued.didSwap).toBe(false)
  })

  it('does not swap before reaching neighbour value with minimum steps', () => {
    const result = resolveThumbCollision({
      behavior: 'swap',
      values: [25, 45],
      currentValues: [40, 45],
      initialValues: [25, 45],
      pressedIndex: 0,
      nextValue: 44,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 5
    })

    const resultValues = result.value as number[]
    expect(resultValues).toEqual([40, 45])
    expect(result.thumbIndex).toBe(0)
    expect(result.didSwap).toBe(false)
  })

  it('swaps once reaching the neighbour value with minimum steps', () => {
    const result = resolveThumbCollision({
      behavior: 'swap',
      values: [25, 45],
      currentValues: [40, 45],
      initialValues: [25, 45],
      pressedIndex: 0,
      nextValue: 45,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 5
    })

    const resultValues = result.value as number[]
    expect(resultValues).toEqual([40, 45])
    expect(result.thumbIndex).toBe(1)
    expect(result.didSwap).toBe(true)
  })

  it('does not swap backward before reaching neighbour value with minimum steps', () => {
    const result = resolveThumbCollision({
      behavior: 'swap',
      values: [25, 45],
      currentValues: [25, 40],
      initialValues: [25, 45],
      pressedIndex: 1,
      nextValue: 29,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 5
    })

    const resultValues = result.value as number[]
    expect(resultValues).toEqual([25, 30])
    expect(result.thumbIndex).toBe(1)
    expect(result.didSwap).toBe(false)
  })

  it('swaps backward once reaching the neighbour value with minimum steps', () => {
    const result = resolveThumbCollision({
      behavior: 'swap',
      values: [25, 45],
      currentValues: [25, 40],
      initialValues: [25, 45],
      pressedIndex: 1,
      nextValue: 25,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 5
    })

    const resultValues = result.value as number[]
    expect(resultValues).toEqual([25, 30])
    expect(result.thumbIndex).toBe(0)
    expect(result.didSwap).toBe(true)
  })

  it('does not move the clamped neighbour when swapping across with minimum steps', () => {
    const startValues = [25, 45]
    const currentValues = [40, 45]

    const result = resolveThumbCollision({
      behavior: 'swap',
      values: currentValues,
      currentValues,
      initialValues: startValues,
      pressedIndex: 0,
      nextValue: 46,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 5
    })

    const resultValues = result.value as number[]
    expect(resultValues).toEqual([40, 46])
    expect(result.thumbIndex).toBe(1)
    expect(result.didSwap).toBe(true)
  })

  it('uses current values when a controlled range grows during a swap interaction', () => {
    const result = resolveThumbCollision({
      behavior: 'swap',
      values: [20, 40],
      currentValues: [20, 40, 60],
      initialValues: [20, 40],
      pressedIndex: 1,
      nextValue: 70,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 0
    })

    expect(result).toEqual({ value: [20, 60, 70], thumbIndex: 2, didSwap: true })
  })

  it('returns a scalar when the live values shrink to one item during an interaction', () => {
    const result = resolveThumbCollision({
      behavior: 'push',
      values: [20, 40],
      currentValues: [20],
      initialValues: [20, 40],
      pressedIndex: 0,
      nextValue: 30,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenValues: 0
    })

    expect(result).toEqual({ value: 30, thumbIndex: 0, didSwap: false })
  })
})
