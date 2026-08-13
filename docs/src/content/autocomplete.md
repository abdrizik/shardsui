# Autocomplete

An input with type-ahead suggestions.

:demo{name="autocomplete/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Autocomplete } from '@shardsui/svelte/autocomplete'
</script>

<Autocomplete.Root>
  <Autocomplete.InputGroup>
    <Autocomplete.Input />
    <Autocomplete.Trigger />
    <Autocomplete.Icon />
    <Autocomplete.Clear />
    <Autocomplete.Value />
  </Autocomplete.InputGroup>

  <Autocomplete.Portal>
    <Autocomplete.Backdrop />
    <Autocomplete.Positioner>
      <Autocomplete.Popup>
        <Autocomplete.Arrow />
        <Autocomplete.Status />
        <Autocomplete.Empty />
        <Autocomplete.List>
          <Autocomplete.Row>
            <Autocomplete.Item />
          </Autocomplete.Row>
          <Autocomplete.Separator />
          <Autocomplete.Group>
            <Autocomplete.GroupLabel />
          </Autocomplete.Group>
          <Autocomplete.Collection />
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>
```

## Usage guidelines

- **Autocomplete vs Combobox**: use Autocomplete for free-form text input with suggestions. Use [Combobox](/svelte/combobox) when the input is restricted to a predefined set of items.
- **The value is a string**: unlike Combobox, the autocomplete's value is the input string itself.
- **Can be used for filterable command pickers**: the input can filter a list of command items that perform an action when clicked, rendered inside the popup.
- **Pass `items` for built-in filtering**: the autocomplete filters as the user types; render matches with `<Autocomplete.Collection>` inside `<Autocomplete.List>`. See [Filtering](#filtering) for async or custom filtering.
- **Give the input an accessible name**: associate a native `<label>` with `<Autocomplete.Input>`, or wrap the autocomplete in the `Field` parts and label it there. See the [forms guide](/svelte/forms).

## TypeScript

`<Autocomplete.Root>` is generic over its item type, but nothing infers it: `items` is typed `NoInfer<Value>[]`, so the type has to come from a typed wrapper. `<Autocomplete.Item>` is not generic — its `value` is `unknown`. The autocomplete's own `value` is always a string — the input's text.

See the [TypeScript guide](/svelte/typescript#value-types-for-generic-parts) for generic roots, typed wrappers, and `bind:ref` patterns.

## Filtering

Pass your data with the `items` prop and render matches with `<Autocomplete.Collection>`:

```svelte title="Filtering items"
<script lang="ts">
  import { Autocomplete } from '@shardsui/svelte/autocomplete'

  const tags = ['Svelte', 'TypeScript', 'CSS', 'Accessibility']

  let value = $state('')
</script>

<Autocomplete.Root items={tags} bind:value>
  <Autocomplete.InputGroup>
    <Autocomplete.Input />
  </Autocomplete.InputGroup>

  <Autocomplete.Portal>
    <Autocomplete.Positioner>
      <Autocomplete.Popup>
        <Autocomplete.List>
          <Autocomplete.Collection>
            {#snippet children(item)}
              <Autocomplete.Item value={item}>{item}</Autocomplete.Item>
            {/snippet}
          </Autocomplete.Collection>
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>
```

For async search or custom filtering, update the `items` array from your fetch handler, or pass pre-filtered data with the `filteredItems` prop and an optional custom `filter` function. See `createFilter` below. Or filter in the parent with `$derived` and render with `{#each}`.

## Examples

### Async search

When suggestions come from a server, fetch them as the user types and surface loading or error text through custom status content.

:demo{name="autocomplete/async"}

### Inline autocomplete

Set `mode` to `both` or `inline` to have the input fill itself in with the highlighted item as you arrow through the list.

:demo{name="autocomplete/inline"}

### Grouped

Sort related suggestions into labeled sections with `<Autocomplete.Group>` and `<Autocomplete.GroupLabel>`.

Model grouped data as an array of group objects, each carrying its own `items` array plus an extra field, such as `value`, that you read when rendering the heading.

:demo{name="autocomplete/grouped"}

### Fuzzy matching

Any matching strategy works: filter externally and pass the result via `items` or `filteredItems` (see [Filtering](#filtering)).

:demo{name="autocomplete/fuzzy-matching"}

### Limit results

Cap how many suggestions render at once, and use `<Autocomplete.Status>` to report the matches the list is holding back.

:demo{name="autocomplete/limit"}

### Auto highlight

Set `autoHighlight` so the first match is highlighted as soon as the query matches something, ready to accept with a single Enter. Pass `'always'` to keep a highlight even while the input is empty, such as when the list renders inline inside a dialog. `keepHighlight` and `highlightItemOnHover` control what the pointer does to the highlight.

:demo{name="autocomplete/auto-highlight"}

### Command palette

Turn the input into a command filter: typing narrows the list, and each item runs an action when clicked instead of selecting a value.

:demo{name="autocomplete/command-palette"}

### Grid layout

Compact items like icons or swatches read better in a grid — set the `grid` prop and wrap each row in an `<Autocomplete.Row>`.

:demo{name="autocomplete/grid"}

Pressing an item fills the input with that item's label, which would blank the grid down to the pressed emoji while the popup animates away. The demo avoids it by binding `value` to a setter that refuses every write — `bind:value={() => searchValue, () => {}}` — and re-supplying the query from the input's own `oninput`, which runs before the component's handler. Value changes that arrive without a typing event never reach the query in this shape (the clear button, Escape restoring the pre-open query, inline completion, browser autofill), which is why the reset lives in `onOpenChangeComplete` rather than in the setter.

### Virtualized

Efficiently handle large datasets by rendering only visible rows.

:demo{name="autocomplete/virtualized"}

## API reference

### Root

Groups all parts of the autocomplete.
Doesn't render its own HTML element, but renders a hidden `<input>` beside.

::table{columns="Prop,Type,Default"}

| Prop                   | Type                                                                                              | Default  | Description                                                                                                                                                                                                                                                                                                                                                                                                   |
| :--------------------- | :------------------------------------------------------------------------------------------------ | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `value`                | `string`                                                                                          | `''`     | The input value of the autocomplete. Use when controlled.                                                                                                                                                                                                                                                                                                                                                     |
| `onValueChange`        | `(value: string) => void`                                                                         | —        | Event handler called when the input value of the autocomplete changes.                                                                                                                                                                                                                                                                                                                                        |
| `open`                 | `boolean`                                                                                         | `false`  | Whether the popup is currently open. Use when controlled.                                                                                                                                                                                                                                                                                                                                                     |
| `onOpenChange`         | `(open: boolean) => void`                                                                         | —        | Event handler called when the popup is opened or closed.                                                                                                                                                                                                                                                                                                                                                      |
| `onOpenChangeComplete` | `(open: boolean) => void`                                                                         | —        | Event handler called after any animations complete when the popup is opened or closed.                                                                                                                                                                                                                                                                                                                        |
| `disabled`             | `boolean`                                                                                         | `false`  | Whether the component should ignore user interaction.                                                                                                                                                                                                                                                                                                                                                         |
| `readOnly`             | `boolean`                                                                                         | `false`  | Whether the user should be unable to choose a different option from the popup.                                                                                                                                                                                                                                                                                                                                |
| `required`             | `boolean`                                                                                         | `false`  | Whether the input must hold a value before submitting a form.                                                                                                                                                                                                                                                                                                                                                 |
| `modal`                | `boolean`                                                                                         | `false`  | Determines if the popup enters a modal state when open.                                                                                                                                                                                                                                                                                                                                                       |
| `loopFocus`            | `boolean`                                                                                         | `true`   | Whether to loop keyboard focus back to the input when the end of the list is reached while using the arrow keys.                                                                                                                                                                                                                                                                                              |
| `openOnInputClick`     | `boolean`                                                                                         | `false`  | Whether the popup opens when clicking the input.                                                                                                                                                                                                                                                                                                                                                              |
| `mode`                 | `'list' \| 'both' \| 'inline' \| 'none'`                                                          | `'list'` | How the input completes: `list` filters the list, `both` filters and completes inline, `inline` completes inline without filtering, `none` does neither. Also sets the input's `aria-autocomplete`.                                                                                                                                                                                                           |
| `inline`               | `boolean`                                                                                         | `false`  | Whether the list is rendered inline without using the component's own popup. Specify `open` unconditionally alongside this prop so the list is considered visible.                                                                                                                                                                                                                                            |
| `autoHighlight`        | `boolean \| 'always'`                                                                             | `false`  | Whether the first matching item is highlighted automatically while filtering. `'always'` also highlights it while the input is empty.                                                                                                                                                                                                                                                                         |
| `keepHighlight`        | `boolean`                                                                                         | `false`  | Whether the highlighted item should be preserved when the pointer leaves the list.                                                                                                                                                                                                                                                                                                                            |
| `highlightItemOnHover` | `boolean`                                                                                         | `true`   | Whether moving the pointer over items should highlight them. Disabling this prop allows CSS `:hover` to be differentiated from the `:focus` (`data-highlighted`) state.                                                                                                                                                                                                                                       |
| `onItemHighlighted`    | `(value: unknown \| undefined, reason: 'keyboard' \| 'pointer' \| 'none', index: number) => void` | —        | Callback fired when an item is highlighted or unhighlighted. Receives the highlighted item value, or `undefined` if no item is highlighted. `reason` reports whether the highlight came from the keyboard, the pointer, or neither. `index` is the highlighted position, or `-1` when nothing is highlighted. Closing the popup fires a clearing call with `undefined`, including when Enter selects an item. |
| `submitOnItemClick`    | `boolean`                                                                                         | `false`  | Submit the form when an item is clicked.                                                                                                                                                                                                                                                                                                                                                                      |
| `itemToStringValue`    | `(item) => string`                                                                                | —        | When the item values are objects, this function converts the object value to the string written into the input when an item is highlighted or chosen. If the shape of the object is `{ value, label }`, the label will be used automatically without needing to specify this prop.                                                                                                                            |
| `name`                 | `string`                                                                                          | —        | Identifies the field when a form is submitted. The submitted value is the input's text.                                                                                                                                                                                                                                                                                                                       |
| `form`                 | `string`                                                                                          | —        | The id of the form the autocomplete belongs to.                                                                                                                                                                                                                                                                                                                                                               |
| `grid`                 | `boolean`                                                                                         | `false`  | Whether the list is arranged as a grid, enabling 2D arrow-key navigation.                                                                                                                                                                                                                                                                                                                                     |
| `items`                | `readonly Value[] \| readonly { items: Value[] }[]`                                               | —        | The items to be displayed in the list. Can be either a flat array of items or an array of groups with items. Render them with `<Autocomplete.Collection>` to use the built-in filtering.                                                                                                                                                                                                                      |
| `filter`               | `((item, query, itemToString?) => boolean) \| null`                                               | —        | Custom matcher used to filter items as the query changes. Pass `null` to disable filtering.                                                                                                                                                                                                                                                                                                                   |
| `filteredItems`        | `readonly Value[] \| readonly { items: Value[] }[]`                                               | —        | Pre-filtered items to render, for when filtering is performed externally.                                                                                                                                                                                                                                                                                                                                     |
| `limit`                | `number`                                                                                          | `-1`     | Maximum number of items rendered after filtering. `-1` disables the limit.                                                                                                                                                                                                                                                                                                                                    |
| `locale`               | `Intl.LocalesArgument`                                                                            | —        | Locale used for the default filtering/collation. Defaults to the runtime locale.                                                                                                                                                                                                                                                                                                                              |
| `virtualized`          | `boolean`                                                                                         | `false`  | Whether the items are being externally virtualized.                                                                                                                                                                                                                                                                                                                                                           |
| `id`                   | `string`                                                                                          | —        | Custom element ID.                                                                                                                                                                                                                                                                                                                                                                                            |
| `children`             | `Snippet`                                                                                         | —        | Content.                                                                                                                                                                                                                                                                                                                                                                                                      |

::

### Other parts

`Input`, `InputGroup`, `Trigger`, `Icon`, `Clear`, `Portal`, `Backdrop`, `Positioner`, `Popup`, `Arrow`, `List`, `Collection`, `Group`, `GroupLabel`, `Empty`, `Status` and `Row` are the [Combobox](/svelte/combobox) parts — see that page for their props and data attributes. `InputGroup` and `Trigger` are the exception: autocomplete never holds a selection, so their `placeholder` state and `data-placeholder` attribute never apply. `Separator` is a visual divider rendered as `role="presentation"`, because `role="separator"` is not valid inside a `listbox`.

### Item

An individual item in the list.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                   | Default | Description                                                                                                                                               |
| :--------- | :------------------------------------- | :------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`          | `'div'` | HTML element to render.                                                                                                                                   |
| `class`    | `string`                               | —       | CSS class applied to the element.                                                                                                                         |
| `style`    | `string`                               | —       | Inline style applied to the element.                                                                                                                      |
| `value`    | `unknown`                              | `null`  | The item's value.                                                                                                                                         |
| `disabled` | `boolean`                              | `false` | Disables interaction for this item.                                                                                                                       |
| `index`    | `number`                               | —       | Explicit index when items are virtualized.                                                                                                                |
| `onclick`  | `(event: MouseEvent) => void`          | —       | Click handler for the item. Fires when clicking the item, as well as when pressing `Enter` while the item is highlighted and the input or list has focus. |
| `children` | `Snippet<[{ highlighted, disabled }]>` | —       | Content; receives the item state.                                                                                                                         |

::

| Attribute          | Description                           |
| :----------------- | :------------------------------------ |
| `data-highlighted` | Present when the item is highlighted. |
| `data-disabled`    | Present when the item is disabled.    |

### Value

The current value of the autocomplete.
Doesn't render its own HTML element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                       | Default | Description                                                                            |
| :--------- | :------------------------- | :------ | :------------------------------------------------------------------------------------- |
| `children` | `Snippet<[value: string]>` | —       | Receives the current input value. When omitted, the value string is rendered directly. |

::

## createFilter

A locale-aware filter helper returning `contains` / `startsWith` / `endsWith` predicates built around `Intl.Collator`. See the [Combobox createFilter docs](/svelte/combobox#createfilter). It takes `AutocompleteFilterOptions` — `Intl.CollatorOptions` plus `locale` — and returns an `AutocompleteFilter`. The `multiple` and `value` options are Combobox-only, since an autocomplete has no selected item.

```svelte title="Using createFilter"
<script>
  import { Autocomplete } from '@shardsui/svelte/autocomplete'

  const filter = Autocomplete.createFilter({ sensitivity: 'base' })
  const filtered = $derived(items.filter((it) => filter.contains(it, query)))
</script>
```
