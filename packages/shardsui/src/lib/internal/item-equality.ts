export type ItemEqualityComparer<Item = unknown, Value = Item> = (
  itemValue: Item,
  selectedValue: Value
) => boolean

export const defaultItemEquality: ItemEqualityComparer = (itemValue, selectedValue) =>
  Object.is(itemValue, selectedValue)

export function compareItemEquality<Item, Value>(
  itemValue: Item,
  selectedValue: Value,
  comparer: ItemEqualityComparer<Item, Value>
): boolean {
  if (itemValue == null || selectedValue == null) {
    return Object.is(itemValue, selectedValue)
  }
  return comparer(itemValue, selectedValue)
}

export function findItemIndex<Item, Value>(
  itemValues: readonly Item[] | undefined | null,
  selectedValue: Value,
  comparer: ItemEqualityComparer<Item, Value>
): number {
  if (!itemValues) {
    return -1
  }
  return itemValues.findIndex((itemValue) => {
    if (itemValue === undefined) {
      return false
    }
    return compareItemEquality(itemValue, selectedValue, comparer)
  })
}

export function removeItem<Item, Value>(
  selectedValues: readonly Item[],
  itemValue: Value,
  comparer: ItemEqualityComparer<Value, Item>
): Item[] {
  return selectedValues.filter(
    (selectedValue) => !compareItemEquality(itemValue, selectedValue, comparer)
  )
}
