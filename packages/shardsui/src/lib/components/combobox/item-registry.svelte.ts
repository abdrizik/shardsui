import { isElementVisible } from '$lib/internal/floating/list-navigation'
import { ItemList } from '$lib/internal/item-list.svelte'
import { SvelteMap } from 'svelte/reactivity'

// Assumed width of a grid whose rows carry no `[role="row"]` element to measure.
const GRID_COLUMNS = 2

type RegisteredItem = { element: HTMLElement; value: unknown; id?: () => string | undefined }

export type HighlightReason = 'keyboard' | 'pointer' | 'none'

export type ComboboxItemRegistryOptions = {
  loopFocus: boolean
  autoHighlight: boolean | 'always'
  virtualized: boolean
  grid: boolean
  itemCount: number
  container: HTMLElement | null
}

export class ComboboxItemRegistry extends ItemList<Omit<RegisteredItem, 'element'>> {
  #options: () => ComboboxItemRegistryOptions
  #virtualItems = new SvelteMap<number, HTMLElement>()

  highlightedIndex = $state(-1)
  lastHighlightReason = $state<HighlightReason>('none')

  #grid = $derived.by(() => {
    const count = this.count
    const rows: number[][] = []
    const rowOf: number[] = []
    let currentRowElement: Element | null | undefined
    let hasRowElements = false
    let renderedCount = 0

    for (let i = 0; i < count; i += 1) {
      const element = this.getItemElement(i)
      if (!element) continue
      renderedCount += 1
      const rowElement = element.closest('[role="row"]')
      if (rowElement) hasRowElements = true
      if (rows.length === 0 || rowElement !== currentRowElement) {
        rows.push([])
        currentRowElement = rowElement
      }
      rows[rows.length - 1].push(i)
      rowOf[i] = rows.length - 1
    }

    let hasDomRows = false
    let widestRow = 0
    if (hasRowElements) {
      for (const row of rows) {
        if (row.length > widestRow) widestRow = row.length
        if (row.length !== GRID_COLUMNS) hasDomRows = true
      }
    }

    return {
      rows,
      rowOf,
      hasDomRows,
      hasGaps: hasDomRows && renderedCount < count,
      columns: widestRow || GRID_COLUMNS
    }
  })

  #allowEscape = $derived.by(() => this.#options().loopFocus && !this.#options().autoHighlight)

  count = $derived.by(() =>
    this.#options().virtualized ? this.#options().itemCount : this.items.length
  )

  constructor(options: () => ComboboxItemRegistryOptions) {
    super(() => ({ container: options().container }))
    this.#options = options

    $effect(() => {
      if (this.highlightedIndex < this.count) return
      this.lastHighlightReason = 'none'
      this.highlightedIndex = -1
    })
  }

  registerVirtualItem = (index: number, element: HTMLElement): (() => void) => {
    this.#virtualItems.set(index, element)

    return () => {
      if (this.#virtualItems.get(index) === element) {
        this.#virtualItems.delete(index)
      }
    }
  }

  #isSkipped(i: number): boolean {
    const element = this.getItemElement(i)
    return !!element && !isElementVisible(element)
  }

  #step(start: number, dir: 1 | -1, amount = 1): number {
    const count = this.count
    let i = start
    do {
      i += dir * amount
    } while (i >= 0 && i <= count - 1 && this.#isSkipped(i))
    return i
  }

  #minIndex(): number {
    return this.#step(-1, 1)
  }

  #maxIndex(): number {
    return this.#step(this.count, -1)
  }

  stepIndex = (start: number, dir: 1 | -1): number => {
    const count = this.count
    if (count === 0) return start
    const allowEscape = this.#allowEscape
    let i = this.#step(start, dir)
    if (i < 0) {
      if (!this.#options().loopFocus) return start
      if (allowEscape && start !== -1) return -1
      i = this.#maxIndex()
    } else if (i >= count) {
      if (!this.#options().loopFocus) return start
      if (allowEscape && start !== count) return -1
      i = this.#minIndex()
    }
    return i < 0 || i >= count ? start : i
  }

  #moveThroughDomRows(start: number, dir: 1 | -1): number | undefined {
    const { rows, rowOf, hasDomRows, hasGaps } = this.#grid
    if (!hasDomRows) return undefined
    const currentRow = rowOf[start]
    if (currentRow == null) return undefined

    const column = rows[currentRow].indexOf(start)

    for (let nextRow = currentRow + dir, i = 0; i < rows.length; i += 1, nextRow += dir) {
      if (nextRow < 0 || nextRow >= rows.length) {
        if (!this.#options().loopFocus || hasGaps) return undefined
        nextRow = nextRow < 0 ? rows.length - 1 : 0
      }
      const row = rows[nextRow]
      for (let c = Math.min(column, row.length - 1); c >= 0; c -= 1) {
        if (!this.#isSkipped(row[c])) return row[c]
      }
    }

    return undefined
  }

  #moveThroughInferredRows(start: number, dir: 1 | -1): number | undefined {
    const { hasGaps, columns } = this.#grid
    if (!hasGaps) return undefined

    const maxIndex = this.#maxIndex()
    const column = start % columns
    const rowStep = dir * columns
    const lastRowStart = maxIndex - (maxIndex % columns)
    const rowCount = Math.floor(maxIndex / columns) + 1

    for (
      let rowStart = start - column + rowStep, visited = 0;
      visited < rowCount;
      visited += 1, rowStart += rowStep
    ) {
      if (rowStart < 0 || rowStart > maxIndex) {
        if (!this.#options().loopFocus) return undefined
        rowStart = rowStart < 0 ? lastRowStart : 0
      }
      const rowEnd = Math.min(rowStart + column, maxIndex, rowStart + columns - 1)
      for (let candidate = rowEnd; candidate >= rowStart; candidate -= 1) {
        if (!this.#isSkipped(candidate)) return candidate
      }
    }

    return undefined
  }

  #gridMove(start: number, dir: 1 | -1): number {
    const count = this.count
    if (count === 0 || start < 0 || start >= count) return start

    let next = this.#moveThroughDomRows(start, dir) ?? this.#moveThroughInferredRows(start, dir)

    if (next === undefined) {
      const { columns } = this.#grid
      const maxIndex = this.#maxIndex()
      next = this.#step(start, dir, columns)

      if (this.#options().loopFocus) {
        if (dir === -1 && (start - columns < this.#minIndex() || next < 0)) {
          const column = start % columns
          const lastColumn = maxIndex % columns
          const offset = maxIndex - (lastColumn - column)
          if (lastColumn === column) next = maxIndex
          else next = lastColumn > column ? offset : offset - columns
        }
        if (dir === 1 && start + columns > maxIndex) {
          next = this.#step((start % columns) - columns, 1, columns)
        }
      }
    }

    return next < 0 || next >= count ? start : next
  }

  moveHighlight = (dir: 1 | -1): void => {
    const current = this.highlightedIndex
    if (current >= 0 && this.#options().grid) {
      this.focusItem(this.#gridMove(current, dir))
      return
    }
    const edgeStart = dir === 1 ? -1 : this.count
    const start = current >= 0 ? current : edgeStart
    this.focusItem(this.stepIndex(start, dir))
  }

  lastIndex = (): number => {
    const i = this.#maxIndex()
    return i < 0 ? -1 : i
  }

  firstIndex = (): number => {
    const i = this.#minIndex()
    return i >= this.count ? -1 : i
  }

  setHighlightedIndex = (i: number, reason: HighlightReason = 'none'): void => {
    this.lastHighlightReason = reason
    this.highlightedIndex = i
    if (reason === 'pointer') return
    this.getItemElement(i)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }

  focusItem = (i: number, reason: HighlightReason = 'keyboard'): void => {
    if (i !== -1 && !this.#options().virtualized && !this.items[i]) return
    this.setHighlightedIndex(i, reason)
  }

  getItemElement = (i: number): HTMLElement | null => {
    if (this.#options().virtualized) {
      return this.#virtualItems.get(i) ?? null
    }
    return this.items[i]?.element ?? null
  }

  getItemId = (i: number): string | undefined => {
    if (this.#options().virtualized) {
      return this.#virtualItems.get(i)?.id || undefined
    }
    const item = this.items[i]
    return (item?.id?.() ?? item?.element.id) || undefined
  }
}
