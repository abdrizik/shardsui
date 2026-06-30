import { createCoreFilter, createFilter } from '$lib/internal/create-filter'
import { expect } from 'vitest'

describe('createCoreFilter', () => {
  const filter = createCoreFilter({ locale: 'en' })

  it('filters primitives and projected objects', () => {
    expect(filter.contains('Apple', 'app')).toBe(true)
    expect(filter.contains({ name: 'Banana' }, 'nan', (item) => item.name)).toBe(true)
    expect(filter.contains('Banana', 'app')).toBe(false)
  })

  it('shows all items for an empty query', () => {
    expect(filter.contains('Apple', '')).toBe(true)
    expect(filter.startsWith('Apple', '')).toBe(true)
    expect(filter.endsWith('Apple', '')).toBe(true)
  })

  it('caches different Intl.Locale objects separately', () => {
    const filter1 = createCoreFilter({ locale: new Intl.Locale('fr-FR') })
    const filter2 = createCoreFilter({ locale: new Intl.Locale('en-US') })

    expect(filter1).not.toBe(filter2)
  })

  it('matches the start and the end of the label', () => {
    expect(filter.startsWith('Apple', 'app')).toBe(true)
    expect(filter.startsWith('Apple', 'ple')).toBe(false)
    expect(filter.endsWith('Apple', 'ple')).toBe(true)
    expect(filter.endsWith('Apple', 'app')).toBe(false)
    expect(filter.endsWith('Apple', 'pineapple')).toBe(false)
  })
})

describe('createFilter', () => {
  it('uses default options when called without arguments', () => {
    expect(createFilter().contains('Apple', 'app')).toBe(true)
  })

  it('rejects nullish items', () => {
    const single = createFilter({ locale: 'en' })
    const multiple = createFilter({ locale: 'en', multiple: true })

    expect(single.contains(null, 'app')).toBe(false)
    expect(single.contains(undefined, 'app')).toBe(false)
    expect(multiple.contains(null, 'app')).toBe(false)
    expect(multiple.contains(undefined, 'app')).toBe(false)
  })

  it('shows all items for an empty query in single mode', () => {
    expect(createFilter({ locale: 'en' }).contains('Apple', '')).toBe(true)
  })

  it('filters selected and unselected items in single and multiple modes', () => {
    const single = createFilter({ locale: 'en', value: 'Apple' })
    const multiple = createFilter({ locale: 'en', multiple: true, value: 'Apple' })

    expect(single.contains('Banana', 'apple')).toBe(true)
    expect(single.contains('Banana', 'nan')).toBe(true)
    expect(single.contains('Banana', 'app')).toBe(false)

    expect(multiple.contains('Banana', 'apple')).toBe(false)
    expect(multiple.contains('Banana', 'nan')).toBe(true)
  })
})
