import { dataAttrs } from '$lib/internal/data-attrs'
import { expect } from 'vitest'

describe('dataAttrs', () => {
  it('converts the state fields to data attributes', () => {
    const state = {
      checked: true,
      orientation: 'vertical',
      count: 42
    }

    const result = dataAttrs(state)
    expect(result).toEqual({
      'data-checked': '',
      'data-orientation': 'vertical',
      'data-count': '42'
    })
  })

  it('changes the fields names to lowercase', () => {
    const state = {
      readOnly: true
    }

    const result = dataAttrs(state)
    expect(result).toEqual({
      'data-readonly': ''
    })
  })

  it('changes true values to a data-attribute without a value', () => {
    const state = {
      required: true,
      disabled: false
    }

    const result = dataAttrs(state)
    expect(result).toEqual({ 'data-required': '' })
  })

  it('does not include false values', () => {
    const state = {
      required: true,
      disabled: false
    }

    const result = dataAttrs(state)
    expect(result['data-disabled']).toBeUndefined()
  })
})
