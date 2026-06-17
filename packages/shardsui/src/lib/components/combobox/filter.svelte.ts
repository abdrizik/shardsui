import { createCoreFilter } from '$lib/internal/create-filter'
import { isGroupedItems, stringifyAsLabel, type Group } from '$lib/internal/resolve-value-label'

type ComboboxFilterOptions = {
  locale: Intl.LocalesArgument
  filteredItems: readonly unknown[] | readonly Group<unknown>[] | undefined
  filter:
    | null
    | ((item: unknown, query: string, itemToString?: (item: unknown) => string) => boolean)
    | undefined
  limit: number
  items: readonly unknown[] | readonly Group<unknown>[] | undefined
  hasItems: boolean
  flatItems: readonly unknown[]
  rawQuery: string
  itemToStringLabel: ((item: unknown) => string) | undefined
  multiple: boolean
  noSelection: boolean
  currentValue: unknown
  queryChangedAfterOpen: boolean
  closeQuery: string | null
}

export class ComboboxFilter {
  #options: () => ComboboxFilterOptions

  #collatorFilter = $derived.by(() => createCoreFilter({ locale: this.#options().locale }))

  #selectedLabelString = $derived.by(() =>
    !this.#options().multiple && !this.#options().noSelection
      ? stringifyAsLabel(this.#options().currentValue, this.#options().itemToStringLabel)
      : ''
  )

  #query = $derived.by(() => this.#options().closeQuery ?? this.#options().rawQuery)

  #shouldBypassFiltering = $derived.by(
    () =>
      !this.#options().multiple &&
      !this.#options().noSelection &&
      !this.#options().queryChangedAfterOpen &&
      this.#query !== '' &&
      this.#selectedLabelString.length === this.#query.length &&
      this.#collatorFilter.contains(this.#selectedLabelString, this.#query)
  )

  #shouldIgnoreExternalFiltering = $derived.by(
    () =>
      this.#options().hasItems &&
      this.#options().filteredItems !== undefined &&
      this.#shouldBypassFiltering
  )

  #filterQuery = $derived(this.#shouldBypassFiltering ? '' : this.#query)

  #activeFilter = $derived.by(
    (): ((item: unknown, query: string, itemToString?: (item: unknown) => string) => boolean) => {
      const { filter, itemToStringLabel } = this.#options()
      if (filter === null) return () => true
      if (filter !== undefined) return filter
      return (item: unknown, query: string) =>
        item != null && this.#collatorFilter.contains(item, query, itemToStringLabel)
    }
  )

  computedFilteredItems = $derived.by((): readonly unknown[] | readonly Group<unknown>[] => {
    const { filteredItems, items, itemToStringLabel, limit, flatItems } = this.#options()
    if (filteredItems && !this.#shouldIgnoreExternalFiltering) {
      return filteredItems
    }

    if (!items) return []

    const query = this.#filterQuery
    const filter = this.#activeFilter

    if (isGroupedItems(items)) {
      const result: Group<unknown>[] = []
      let count = 0
      for (const group of items) {
        if (limit > -1 && count >= limit) break
        const remaining = limit > -1 ? limit - count : Infinity
        let slice: unknown[]
        if (query === '') {
          slice = group.items.slice(0, remaining)
        } else {
          slice = []
          for (const item of group.items) {
            if (slice.length >= remaining) break
            if (filter(item, query, itemToStringLabel)) slice.push(item)
          }
        }
        if (slice.length > 0) {
          result.push({ ...group, items: slice })
          count += slice.length
        }
      }
      return result
    }

    if (query === '') {
      return limit > -1 ? flatItems.slice(0, limit) : flatItems
    }

    const limited: unknown[] = []
    for (const item of flatItems) {
      if (limit > -1 && limited.length >= limit) break
      if (filter(item, query, itemToStringLabel)) limited.push(item)
    }
    return limited
  })

  flatFilteredItems = $derived.by((): readonly unknown[] => {
    const fi = this.computedFilteredItems
    if (isGroupedItems(fi)) {
      return fi.flatMap((g) => g.items)
    }
    return fi
  })

  constructor(options: () => ComboboxFilterOptions) {
    this.#options = options
  }
}
