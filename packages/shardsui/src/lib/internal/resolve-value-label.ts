import { serializeValue } from './serialize-value'

type LabeledItem = {
  value: unknown
  label: unknown
}

export type Group<Item = unknown> = {
  items: ReadonlyArray<Item>
}

export function isGroupedItems(
  items: ReadonlyArray<unknown> | undefined
): items is ReadonlyArray<Group<unknown>> {
  return (
    items != null &&
    items.length > 0 &&
    typeof items[0] === 'object' &&
    items[0] != null &&
    'items' in items[0]
  )
}

function flattenItems(items: readonly unknown[]): ReadonlyArray<LabeledItem> {
  return isGroupedItems(items)
    ? items.flatMap((group) => group.items as LabeledItem[])
    : (items as ReadonlyArray<LabeledItem>)
}

function isLabeledNullValue(item: unknown): boolean {
  if (!item || typeof item !== 'object') {
    return false
  }
  const { value, label } = item as LabeledItem
  return value == null && label != null
}

export function hasNullItemLabel(
  items: readonly unknown[] | Record<string, unknown> | undefined
): boolean {
  if (!Array.isArray(items)) {
    return items != null && 'null' in items
  }
  return flattenItems(items).some(isLabeledNullValue)
}

export function stringifyAsLabel<T = unknown>(
  item: unknown,
  itemToStringLabel?: (item: T) => string
): string {
  if (itemToStringLabel && item != null) {
    return itemToStringLabel(item as T) ?? ''
  }
  if (item && typeof item === 'object') {
    const obj = item as Record<string, unknown>
    if ('label' in obj && obj.label != null) return String(obj.label)
    if ('value' in obj) return String(obj.value)
  }
  return serializeValue(item)
}

export function stringifyAsValue<T = unknown>(
  item: unknown,
  itemToStringValue?: (item: T) => string
): string {
  if (itemToStringValue && item != null) {
    return itemToStringValue(item as T) ?? ''
  }
  if (item && typeof item === 'object') {
    const obj = item as Record<string, unknown>
    if ('value' in obj && 'label' in obj) {
      return serializeValue(obj.value)
    }
  }
  return serializeValue(item)
}

export function resolveSelectedLabel(
  value: unknown,
  items: readonly unknown[] | Record<string, unknown> | undefined,
  itemToStringLabel?: ((item: unknown) => string) | undefined
): string {
  if (itemToStringLabel && value != null) {
    return itemToStringLabel(value)
  }

  if (value && typeof value === 'object' && 'label' in value && value.label != null) {
    return String(value.label)
  }

  if (items && !Array.isArray(items)) {
    const record = (items as Record<string, unknown>)[value as string]
    if (record != null) return String(record)
  } else if (Array.isArray(items)) {
    const objectValue =
      value != null && typeof value === 'object' ? (value as Record<string, unknown>) : null

    if (!objectValue || 'value' in objectValue) {
      const target = objectValue ? objectValue.value : value
      const match = flattenItems(items).find((item) => item?.value === target)
      if (match && match.label != null) return String(match.label)
    }
  }

  return stringifyAsLabel(value, itemToStringLabel)
}
