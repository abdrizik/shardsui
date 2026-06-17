import { stringifyAsLabel } from './resolve-value-label'
import { stringifyLocale } from './stringify-locale'

const filterCache = new Map<string, Filter>()

export type FilterOptions = Intl.CollatorOptions & {
  locale?: Intl.LocalesArgument | undefined
  multiple?: boolean | undefined
  value?: unknown
}

/** `multiple` and `value` drive single-select echo suppression, which only Combobox has. */
export type CoreFilterOptions = Omit<FilterOptions, 'multiple' | 'value'>

export type Filter = {
  contains: <Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean
  startsWith: <Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean
  endsWith: <Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean
}

function getCoreFilter(
  locale: Intl.LocalesArgument | undefined,
  collatorOptions: Intl.CollatorOptions
): Filter {
  const mergedOptions: Intl.CollatorOptions = {
    usage: 'search',
    sensitivity: 'base',
    ignorePunctuation: true,
    ...collatorOptions
  }

  const cacheKey = `${stringifyLocale(locale)}|${JSON.stringify(mergedOptions)}`
  const cachedFilter = filterCache.get(cacheKey)

  if (cachedFilter) {
    return cachedFilter
  }

  const collator = new Intl.Collator(locale, mergedOptions)

  const filter: Filter = {
    contains<Item>(item: Item, query: string, itemToString?: (item: Item) => string) {
      if (!query) {
        return true
      }

      const itemString = stringifyAsLabel(item, itemToString)

      for (let i = 0; i <= itemString.length - query.length; i += 1) {
        if (collator.compare(itemString.slice(i, i + query.length), query) === 0) {
          return true
        }
      }

      return false
    },
    startsWith<Item>(item: Item, query: string, itemToString?: (item: Item) => string) {
      if (!query) {
        return true
      }

      const itemString = stringifyAsLabel(item, itemToString)

      return collator.compare(itemString.slice(0, query.length), query) === 0
    },
    endsWith<Item>(item: Item, query: string, itemToString?: (item: Item) => string) {
      if (!query) {
        return true
      }

      const itemString = stringifyAsLabel(item, itemToString)
      const queryLength = query.length

      return (
        itemString.length >= queryLength &&
        collator.compare(itemString.slice(itemString.length - queryLength), query) === 0
      )
    }
  }

  filterCache.set(cacheKey, filter)
  return filter
}

export function createCoreFilter(options: CoreFilterOptions = {}): Filter {
  const { locale, ...collatorOptions } = options
  return getCoreFilter(locale, collatorOptions)
}

export function createFilter(options: FilterOptions = {}): Filter {
  const { multiple = false, value, locale, ...collatorOptions } = options

  const coreFilter = getCoreFilter(locale, collatorOptions)

  return {
    contains<Item>(item: Item, query: string, itemToString?: (item: Item) => string) {
      if (item == null) {
        return false
      }

      if (multiple) {
        return coreFilter.contains(item, query, itemToString)
      }

      if (!query) {
        return true
      }

      const selectedString =
        value != null ? stringifyAsLabel(value, itemToString as (item: unknown) => string) : ''

      if (
        selectedString &&
        coreFilter.contains(selectedString, query) &&
        selectedString.length === query.length
      ) {
        return true
      }

      return coreFilter.contains(item, query, itemToString)
    },
    startsWith: coreFilter.startsWith,
    endsWith: coreFilter.endsWith
  }
}
