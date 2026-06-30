import { findClosestSnapPoint } from '$lib/components/drawer/snap-points.svelte'
import { expect, it } from 'vitest'

describe('findClosestSnapPoint', () => {
  it('returns the closest point and keeps the first one on ties', () => {
    const points = [{ offset: 100 }, { offset: 200 }, { offset: 300 }]

    expect(findClosestSnapPoint(points, 240)).toEqual({ point: points[1], index: 1 })
    expect(findClosestSnapPoint(points.slice(0, 2), 150)).toEqual({ point: points[0], index: 0 })
  })
})
