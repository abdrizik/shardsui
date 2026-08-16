# Combobox

An input with a filterable list.

:demo{name="combobox/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Combobox } from '@shardsui/svelte/combobox'
</script>

<Combobox.Root>
  <Combobox.Label />
  <Combobox.InputGroup>
    <Combobox.Chips>
      <Combobox.Chip>
        <Combobox.ChipRemove />
      </Combobox.Chip>
    </Combobox.Chips>
    <Combobox.Input />
    <Combobox.Trigger>
      <Combobox.Value />
    </Combobox.Trigger>
    <Combobox.Icon />
    <Combobox.Clear />
  </Combobox.InputGroup>

  <Combobox.Portal>
    <Combobox.Backdrop />
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.Arrow />
        <Combobox.Status />
        <Combobox.Empty />
        <Combobox.List>
          <Combobox.Row>
            <Combobox.Item>
              <Combobox.ItemIndicator />
            </Combobox.Item>
          </Combobox.Row>
          <Combobox.Group>
            <Combobox.GroupLabel />
          </Combobox.Group>
          <Combobox.Separator />
          <Combobox.Collection />
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
```

## Usage guidelines

- **Combobox is a filterable Select**: use it when the value is restricted to a predefined set of items (like [Select](/svelte/select)) and you want to narrow that set by typing.
- **Not for free-form text**: typing only filters the list. The value is always one of the items. For a search widget that accepts arbitrary text, use [Autocomplete](/svelte/autocomplete).
- **Not without an input**: if you aren't rendering a text input at all, use [Select](/svelte/select). It carries the accessibility semantics for a listbox that has no input.
- **Provide an accessible name**: when `<Combobox.Input>` is the form control, label it with a native `<label>` or `<Field.Label>`, or an `aria-label` when no visible label is rendered. `<Combobox.Label>` labels the trigger, not the input. It belongs to the [input-inside-popup](#examples-input-inside-popup) pattern. See the [forms guide](/svelte/forms).
- **Pass `items` for built-in filtering**: the combobox filters the `items` prop internally as the user types; render matches with `<Combobox.Collection>` inside `<Combobox.List>`. For async or custom filtering, pass a dynamic `items` array or the `filteredItems` / `filter` props. See [Filtering](#filtering).

## TypeScript

`<Combobox.Root>` infers its item type from the `value` prop, and each entry in the `items` array must share that type. `<Combobox.Item>` is not generic. Its `value` is `unknown`.

See the [TypeScript guide](/svelte/typescript#value-types-for-generic-parts) for generic roots, typed wrappers, and `bind:ref` patterns.

## Filtering

Pass your data with the `items` prop and render matches with `<Combobox.Collection>`:

```svelte title="Filtering items"
<script lang="ts">
  import { Combobox } from '@shardsui/svelte/combobox'

  const courses = [
    { value: 'typography', label: 'Intro to Typography' },
    { value: 'spanish', label: 'Spanish for Beginners' }
    /* ... */
  ]

  let value = $state(null)
</script>

<Combobox.Root items={courses} bind:value>
  <Combobox.InputGroup>
    <Combobox.Input />
  </Combobox.InputGroup>

  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.List>
          <Combobox.Collection>
            {#snippet children(item)}
              <Combobox.Item value={item}>
                {item.label}
              </Combobox.Item>
            {/snippet}
          </Combobox.Collection>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
```

For async search or custom filtering, update the `items` array from your fetch handler, or pass pre-filtered data with the `filteredItems` prop and an optional custom `filter` function. See `createFilter` below. Or filter in the parent with `$derived` and render with `{#each}`.

## Examples

### Multiple select

Add the `multiple` prop to let people pick more than one item. `<Combobox.Chips>`, `<Combobox.Chip>`, and `<Combobox.ChipRemove>` render the selected values as removable chips inside the input group, and Backspace on an empty input drops the most recent one.

:demo{name="combobox/multiple"}

To keep a long selection from overflowing, slice the values you render inside `<Combobox.Chips>` and show the rest as a count:

```svelte title="Limiting visible chips"
<script>
  const CHIP_LIMIT = 3
  // [!code highlight]
  const visibleValue = $derived(value.slice(0, CHIP_LIMIT))
  // [!code highlight]
  const hiddenCount = $derived(value.length - visibleValue.length)
</script>

<Combobox.Chips>
  {#each visibleValue as item (item)}
    <Combobox.Chip>
      {item}
      <Combobox.ChipRemove aria-label={`Remove ${item}`} />
    </Combobox.Chip>
  {/each}
  <!-- [!code highlight:5] -->
  {#if hiddenCount > 0}
    <span>
      {`+${hiddenCount} more`}
    </span>
  {/if}
  <Combobox.Input />
</Combobox.Chips>
```

### Grouped

Wrap related items in a `<Combobox.Group>` with a `<Combobox.GroupLabel>` heading. Filtering runs within each group, and a group whose items all filter out disappears on its own.

Model each group as one object: an `items` array of its entries, plus any extra field (`value` here) that you read when rendering the label.

```svelte title="Example"
<script lang="ts">
  type TopicGroup = {
    value: string
    // [!code highlight]
    items: string[]
  }

  const groups: TopicGroup[] = [
    // [!code highlight]
    { value: 'Design', items: ['Typography', 'Color theory', 'Layout'] },
    // [!code highlight]
    { value: 'Programming', items: ['JavaScript', 'Python', 'Databases'] }
  ]
</script>
```

:demo{name="combobox/grouped"}

### Input inside popup

Render the `<Combobox.Input>` inside the popup itself. Useful when the trigger is a button-like control and the search field appears only when opened.

:demo{name="combobox/input-inside-popup"}

Here the trigger is the form control, so label it with `<Combobox.Label>`. It renders a `<div>`, so a click lands focus on the trigger without opening the popup:

```svelte title="Using Combobox.Label to label a combobox"
<Combobox.Root>
  <!-- [!code highlight] -->
  <Combobox.Label>Instructor</Combobox.Label>
  ...
</Combobox.Root>
```

### Async search (single)

Fetch items as the user types, so nothing loads upfront. Keep the currently selected item in the `items` array while new results stream in, otherwise the selection drops out of the list mid-fetch. Use `<Combobox.Status>` to announce loading and `<Combobox.Empty>` for the no-results state.

:demo{name="combobox/async-single"}

### Async search (multiple)

Fetch on input changes while allowing several selections. Merge the already-selected items into the `items` array so their chips stay valid as new matches stream in, and clear the query after each pick so the next search starts fresh.

:demo{name="combobox/async-multiple"}

### Creatable

Surface a "Create …" affordance when the typed value doesn't match any existing item. Selecting it opens a dialog to name and confirm the new item before it's added.

:demo{name="combobox/creatable"}

### Virtualized

For large datasets, renders only the visible items.

:demo{name="combobox/virtualized"}

## API reference

### Root

Groups all parts of the combobox.
Doesn't render its own HTML element, but renders a hidden `<input>` beside — one per selected value in multiple mode.

::table{columns="Prop,Type,Default"}

| Prop                   | Type                                                                                              | Default     | Description                                                                                                                                                                                                                                                                                                                                                                                                   |
| :--------------------- | :------------------------------------------------------------------------------------------------ | :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`                 | `string`                                                                                          | —           | Identifies the field when a form is submitted.                                                                                                                                                                                                                                                                                                                                                                |
| `value`                | `unknown`                                                                                         | `null`      | The selected value of the combobox, `[]` in `multiple` mode. Use when controlled.                                                                                                                                                                                                                                                                                                                             |
| `onValueChange`        | `(value: unknown) => void`                                                                        | —           | Event handler called when the selected value of the combobox changes.                                                                                                                                                                                                                                                                                                                                         |
| `inputValue`           | `string`                                                                                          | `''`        | The input value of the combobox. Use when controlled.                                                                                                                                                                                                                                                                                                                                                         |
| `onInputValueChange`   | `(value: string) => void`                                                                         | —           | Event handler called when the input value changes.                                                                                                                                                                                                                                                                                                                                                            |
| `open`                 | `boolean`                                                                                         | `false`     | Whether the popup is currently open. Use when controlled.                                                                                                                                                                                                                                                                                                                                                     |
| `onOpenChange`         | `(open: boolean) => void`                                                                         | —           | Event handler called when the popup is opened or closed.                                                                                                                                                                                                                                                                                                                                                      |
| `autoHighlight`        | `boolean`                                                                                         | `false`     | Whether the first matching item is highlighted automatically while filtering.                                                                                                                                                                                                                                                                                                                                 |
| `highlightItemOnHover` | `boolean`                                                                                         | `true`      | Whether moving the pointer over items should highlight them. Disabling this prop allows CSS `:hover` to be differentiated from the `:focus` (`data-highlighted`) state.                                                                                                                                                                                                                                       |
| `keepHighlight`        | `boolean`                                                                                         | `false`     | Whether the highlighted item should be preserved when the pointer leaves the list.                                                                                                                                                                                                                                                                                                                            |
| `submitOnItemClick`    | `boolean`                                                                                         | `false`     | Submit the form when an item is clicked.                                                                                                                                                                                                                                                                                                                                                                      |
| `autoComplete`         | `string`                                                                                          | —           | The browser autofill hint applied to the hidden form input (the native `autocomplete` token, e.g. `'country'`). The visible input keeps `autocomplete="off"` and `aria-autocomplete="list"`. For inline-completion mode (`both`, `inline`, `none`), use [`Autocomplete`](/svelte/autocomplete) and its `mode` prop.                                                                                           |
| `filter`               | `((item, query, itemToString?) => boolean) \| null`                                               | —           | Custom filter applied to `items` against the current query. Defaults to a locale-aware contains match. Pass `null` to disable filtering.                                                                                                                                                                                                                                                                      |
| `filteredItems`        | `readonly Value[] \| readonly { items: Value[] }[]`                                               | —           | Pre-filtered items to render, for when filtering is performed externally.                                                                                                                                                                                                                                                                                                                                     |
| `form`                 | `string`                                                                                          | —           | Associates the hidden inputs with a form by its `id` (use when the combobox is rendered outside the form).                                                                                                                                                                                                                                                                                                    |
| `grid`                 | `boolean`                                                                                         | `false`     | Whether the items are arranged in a grid, enabling two-dimensional arrow-key navigation.                                                                                                                                                                                                                                                                                                                      |
| `inline`               | `boolean`                                                                                         | `false`     | Whether the list is rendered inline without using the component's own popup. Specify `open` unconditionally in conjunction with this prop so the list is considered visible: `<Combobox.Root inline open>`.                                                                                                                                                                                                   |
| `isItemEqualToValue`   | `(item: unknown, value: unknown) => boolean`                                                      | `Object.is` | Custom comparison logic used to determine if a combobox item value matches the current selected value.                                                                                                                                                                                                                                                                                                        |
| `itemToStringLabel`    | `(item: unknown) => string`                                                                       | —           | When the item values are objects, this function converts the object value to a string representation for display in the input. If the shape of the object is `{ value, label }`, the label will be used automatically without needing to specify this prop.                                                                                                                                                   |
| `itemToStringValue`    | `(item: unknown) => string`                                                                       | —           | When the item values are objects, this function converts the object value to a string representation for form submission. If the shape of the object is `{ value, label }`, the value will be used automatically without needing to specify this prop.                                                                                                                                                        |
| `items`                | `readonly Value[] \| readonly { items: Value[] }[]`                                               | —           | The items to display. When provided, `Combobox.Value` and `<Combobox.Collection>` resolve labels from this list.                                                                                                                                                                                                                                                                                              |
| `limit`                | `number`                                                                                          | `-1`        | Maximum number of items rendered after filtering. `-1` disables the limit.                                                                                                                                                                                                                                                                                                                                    |
| `locale`               | `Intl.LocalesArgument`                                                                            | —           | Locale used for the default filtering/collation.                                                                                                                                                                                                                                                                                                                                                              |
| `loopFocus`            | `boolean`                                                                                         | `true`      | Whether to loop keyboard focus back to the input when the end of the list is reached while using the arrow keys.                                                                                                                                                                                                                                                                                              |
| `modal`                | `boolean`                                                                                         | `false`     | Determines if the popup enters a modal state when open.                                                                                                                                                                                                                                                                                                                                                       |
| `multiple`             | `boolean`                                                                                         | `false`     | Whether multiple items can be selected.                                                                                                                                                                                                                                                                                                                                                                       |
| `onItemHighlighted`    | `(value: unknown \| undefined, reason: 'keyboard' \| 'pointer' \| 'none', index: number) => void` | —           | Callback fired when an item is highlighted or unhighlighted. Receives the highlighted item value, or `undefined` if no item is highlighted. `reason` reports whether the highlight came from the keyboard, the pointer, or neither. `index` is the highlighted position, or `-1` when nothing is highlighted. Closing the popup fires a clearing call with `undefined`, including when Enter selects an item. |
| `onOpenChangeComplete` | `(open: boolean) => void`                                                                         | —           | Event handler called after any animations complete when the popup is opened or closed.                                                                                                                                                                                                                                                                                                                        |
| `openOnInputClick`     | `boolean`                                                                                         | `true`      | Whether the popup opens when clicking the input.                                                                                                                                                                                                                                                                                                                                                              |
| `virtualized`          | `boolean`                                                                                         | `false`     | Whether the items are being externally virtualized.                                                                                                                                                                                                                                                                                                                                                           |
| `disabled`             | `boolean`                                                                                         | `false`     | Whether the component should ignore user interaction.                                                                                                                                                                                                                                                                                                                                                         |
| `readOnly`             | `boolean`                                                                                         | `false`     | Whether the user should be unable to choose a different option from the popup.                                                                                                                                                                                                                                                                                                                                |
| `required`             | `boolean`                                                                                         | `false`     | Whether the user must choose a value before submitting a form.                                                                                                                                                                                                                                                                                                                                                |
| `id`                   | `string`                                                                                          | —           | Custom element ID. Applied to the visible control and used as the prefix for the label, popup and item IDs.                                                                                                                                                                                                                                                                                                   |
| `children`             | `Snippet`                                                                                         | —           | Content.                                                                                                                                                                                                                                                                                                                                                                                                      |

::

### Label

An accessible label that is automatically associated with the combobox trigger.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                              | Default | Description                          |
| :--------- | :---------------------------------------------------------------- | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                                     | `'div'` | HTML element to render.              |
| `class`    | `string`                                                          | —       | CSS class applied to the element.    |
| `style`    | `string`                                                          | —       | Inline style applied to the element. |
| `children` | `Snippet<[{ touched, dirty, filled, focused, valid, disabled }]>` | —       | Content; receives the field state.   |

::

| Attribute      | Description                                                              |
| :------------- | :----------------------------------------------------------------------- |
| `data-valid`   | Present when the field is valid (when wrapped in Field.Root).            |
| `data-invalid` | Present when the field is invalid (when wrapped in Field.Root).          |
| `data-touched` | Present when the field has been touched (when wrapped in Field.Root).    |
| `data-dirty`   | Present when the field's value has changed (when wrapped in Field.Root). |
| `data-filled`  | Present when the combobox has a value (when wrapped in Field.Root).      |
| `data-focused` | Present when the control is focused (when wrapped in Field.Root).        |

### InputGroup

A wrapper for the input and its associated controls.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                                                                                 | Default | Description                              |
| :--------- | :------------------------------------------------------------------------------------------------------------------- | :------ | :--------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                                                                                        | `'div'` | HTML element to render.                  |
| `class`    | `string`                                                                                                             | —       | CSS class applied to the element.        |
| `style`    | `string`                                                                                                             | —       | Inline style applied to the element.     |
| `children` | `Snippet<[{ touched, dirty, filled, focused, valid, open, disabled, readOnly, popupSide, listEmpty, placeholder }]>` | —       | Content; receives the input group state. |

::

| Attribute          | Description                                                              |
| :----------------- | :----------------------------------------------------------------------- |
| `data-popup-open`  | Present when the popup is open.                                          |
| `data-pressed`     | Present when the input group is pressed.                                 |
| `data-disabled`    | Present when the combobox is disabled.                                   |
| `data-readonly`    | Present when the combobox is read-only.                                  |
| `data-popup-side`  | Indicates which side the popup is positioned relative to its anchor.     |
| `data-valid`       | Present when the field is valid (when wrapped in Field.Root).            |
| `data-invalid`     | Present when the field is invalid (when wrapped in Field.Root).          |
| `data-touched`     | Present when the field has been touched (when wrapped in Field.Root).    |
| `data-dirty`       | Present when the field's value has changed (when wrapped in Field.Root). |
| `data-filled`      | Present when the combobox has a value (when wrapped in Field.Root).      |
| `data-focused`     | Present when the combobox is focused (when wrapped in Field.Root).       |
| `data-list-empty`  | Present when no items are rendered.                                      |
| `data-placeholder` | Present when the combobox has no value.                                  |

### Input

A text input to search for items in the list.
Renders an `<input>` element.

::table{columns="Prop,Type,Default"}

| Prop           | Type                    | Default   | Description                                                                                                                      |
| :------------- | :---------------------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `as`           | `'input' \| 'textarea'` | `'input'` | HTML element to render.                                                                                                          |
| `class`        | `string`                | —         | CSS class applied to the element.                                                                                                |
| `style`        | `string`                | —         | Inline style applied to the element.                                                                                             |
| `id`           | `string`                | Root `id` | Custom element ID. Falls back to a generated ID instead when the input renders inside the positioner or popup, or with `inline`. |
| `placeholder`  | `string`                | —         | Input placeholder text.                                                                                                          |
| `disabled`     | `boolean`               | `false`   | Whether the input is disabled.                                                                                                   |
| `autocomplete` | `string`                | `'off'`   | The `autocomplete` attribute for the input.                                                                                      |

::

Read-only and required behavior come from `<Combobox.Root>`'s `readOnly` and `required` props.

| Attribute         | Description                                                              |
| :---------------- | :----------------------------------------------------------------------- |
| `data-popup-open` | Present when the popup is open.                                          |
| `data-pressed`    | Present when the input is pressed.                                       |
| `data-disabled`   | Present when the input is disabled.                                      |
| `data-readonly`   | Present when the input is read-only.                                     |
| `data-popup-side` | Indicates which side the popup is positioned relative to its anchor.     |
| `data-valid`      | Present when the field is valid (when wrapped in Field.Root).            |
| `data-invalid`    | Present when the field is invalid (when wrapped in Field.Root).          |
| `data-touched`    | Present when the field has been touched (when wrapped in Field.Root).    |
| `data-dirty`      | Present when the field's value has changed (when wrapped in Field.Root). |
| `data-filled`     | Present when the combobox has a value (when wrapped in Field.Root).      |
| `data-focused`    | Present when the input is focused (when wrapped in Field.Root).          |
| `data-list-empty` | Present when no items are rendered.                                      |

### Trigger

A button that opens the popup.
Renders a `<button>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                                                                       | Default    | Description                          |
| :--------- | :--------------------------------------------------------------------------------------------------------- | :--------- | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                                                                              | `'button'` | HTML element to render.              |
| `class`    | `string`                                                                                                   | —          | CSS class applied to the element.    |
| `style`    | `string`                                                                                                   | —          | Inline style applied to the element. |
| `disabled` | `boolean`                                                                                                  | `false`    | Whether the trigger is disabled.     |
| `children` | `Snippet<[{ touched, dirty, filled, focused, valid, open, disabled, popupSide, listEmpty, placeholder }]>` | —          | Content; receives the trigger state. |

::

| Attribute          | Description                                                              |
| :----------------- | :----------------------------------------------------------------------- |
| `data-popup-open`  | Present when the popup is open.                                          |
| `data-pressed`     | Present when the trigger is pressed.                                     |
| `data-disabled`    | Present when the combobox is disabled.                                   |
| `data-popup-side`  | Indicates which side the popup is positioned relative to its anchor.     |
| `data-valid`       | Present when the field is valid (when wrapped in Field.Root).            |
| `data-invalid`     | Present when the field is invalid (when wrapped in Field.Root).          |
| `data-touched`     | Present when the field has been touched (when wrapped in Field.Root).    |
| `data-dirty`       | Present when the field's value has changed (when wrapped in Field.Root). |
| `data-filled`      | Present when the combobox has a value (when wrapped in Field.Root).      |
| `data-focused`     | Present when the trigger is focused (when wrapped in Field.Root).        |
| `data-list-empty`  | Present when no items are rendered.                                      |
| `data-placeholder` | Present when the combobox has no value.                                  |

### Clear

Clears the value when clicked.
Renders a `<button>` element.

::table{columns="Prop,Type,Default"}

| Prop          | Type                                                       | Default    | Description                                                              |
| :------------ | :--------------------------------------------------------- | :--------- | :----------------------------------------------------------------------- |
| `as`          | `keyof HTMLElementTagNameMap`                              | `'button'` | HTML element to render.                                                  |
| `class`       | `string`                                                   | —          | CSS class applied to the element.                                        |
| `style`       | `string`                                                   | —          | Inline style applied to the element.                                     |
| `disabled`    | `boolean`                                                  | `false`    | Whether the component should ignore user interaction.                    |
| `keepMounted` | `boolean`                                                  | `false`    | Whether the component should remain mounted in the DOM when not visible. |
| `children`    | `Snippet<[{ disabled, visible, open, transitionStatus }]>` | —          | Content; receives the clear state.                                       |

::

| Attribute             | Description                                     |
| :-------------------- | :---------------------------------------------- |
| `data-popup-open`     | Present when the popup is open.                 |
| `data-disabled`       | Present when the button is disabled.            |
| `data-visible`        | Present when the clear button is visible.       |
| `data-starting-style` | Present when the clear button is animating in.  |
| `data-ending-style`   | Present when the clear button is animating out. |

### Icon

An icon indicating that the trigger opens the popup.
Renders a `<span>` element.

::table{columns="Prop,Type,Default"}

| Prop    | Type                          | Default  | Description                          |
| :------ | :---------------------------- | :------- | :----------------------------------- |
| `as`    | `keyof HTMLElementTagNameMap` | `'span'` | HTML element to render.              |
| `class` | `string`                      | —        | CSS class applied to the element.    |
| `style` | `string`                      | —        | Inline style applied to the element. |

::

### Chips

A container for the chips in a multiselectable input.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop    | Type                          | Default | Description                          |
| :------ | :---------------------------- | :------ | :----------------------------------- |
| `as`    | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.              |
| `class` | `string`                      | —       | CSS class applied to the element.    |
| `style` | `string`                      | —       | Inline style applied to the element. |

::

### Chip

An individual chip representing a selected value.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                                         |
| :--------- | :---------------------------- | :------ | :-------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.                             |
| `class`    | `string`                      | —       | CSS class applied to the element.                   |
| `style`    | `string`                      | —       | Inline style applied to the element.                |
| `children` | `Snippet<[{ disabled }]>`     | —       | Content; receives whether the combobox is disabled. |

::

| Attribute       | Description                            |
| :-------------- | :------------------------------------- |
| `data-disabled` | Present when the combobox is disabled. |

### ChipRemove

A button to remove a chip.
Renders a `<button>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default    | Description                                           |
| :--------- | :---------------------------- | :--------- | :---------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'button'` | HTML element to render.                               |
| `class`    | `string`                      | —          | CSS class applied to the element.                     |
| `style`    | `string`                      | —          | Inline style applied to the element.                  |
| `disabled` | `boolean`                     | `false`    | Whether the component should ignore user interaction. |
| `children` | `Snippet<[{ disabled }]>`     | —          | Content; receives whether the button is disabled.     |

::

| Attribute       | Description                                      |
| :-------------- | :----------------------------------------------- |
| `data-disabled` | Present when the chip remove button is disabled. |

### Value

The current value of the combobox.
Doesn't render its own HTML element.

::table{columns="Prop,Type,Default"}

| Prop          | Type                        | Default | Description                                                                      |
| :------------ | :-------------------------- | :------ | :------------------------------------------------------------------------------- |
| `placeholder` | `string`                    | —       | Text shown when no value is selected.                                            |
| `children`    | `Snippet<[value: unknown]>` | —       | Receives the current value. When omitted, the value string is rendered directly. |

::

### Backdrop

An overlay displayed beneath the popup.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                    | Default | Description                           |
| :--------- | :-------------------------------------- | :------ | :------------------------------------ |
| `as`       | `keyof HTMLElementTagNameMap`           | `'div'` | HTML element to render.               |
| `class`    | `string`                                | —       | CSS class applied to the element.     |
| `style`    | `string`                                | —       | Inline style applied to the element.  |
| `children` | `Snippet<[{ open, transitionStatus }]>` | —       | Content; receives the backdrop state. |

::

| Attribute             | Description                                 |
| :-------------------- | :------------------------------------------ |
| `data-open`           | Present when the popup is open.             |
| `data-closed`         | Present when the popup is closed.           |
| `data-starting-style` | Present when the backdrop is animating in.  |
| `data-ending-style`   | Present when the backdrop is animating out. |

### Portal

A portal that moves the popup out to `<body>`, clear of ancestor clipping and stacking.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop          | Type                  | Default | Description                                                                                                   |
| :------------ | :-------------------- | :------ | :------------------------------------------------------------------------------------------------------------ |
| `container`   | `HTMLElement \| null` | —       | Parent element to render the portal into. Defaults to the nearest ancestor portal, otherwise `document.body`. |
| `keepMounted` | `boolean`             | `false` | Whether to keep the contents mounted while the popup is closed.                                               |

::

### Positioner

Positions the popup against the trigger.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop                    | Type                                                                       | Default                                                     | Description                                                                          |
| :---------------------- | :------------------------------------------------------------------------- | :---------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| `as`                    | `keyof HTMLElementTagNameMap`                                              | `'div'`                                                     | HTML element to render.                                                              |
| `class`                 | `string`                                                                   | —                                                           | CSS class applied to the element.                                                    |
| `style`                 | `string`                                                                   | —                                                           | Inline style applied to the element.                                                 |
| `side`                  | `'top' \| 'bottom' \| 'left' \| 'right' \| 'inline-start' \| 'inline-end'` | `'bottom'`                                                  | Side to position the popup on.                                                       |
| `align`                 | `'start' \| 'center' \| 'end'`                                             | `'center'`                                                  | Alignment of the popup along the side.                                               |
| `sideOffset`            | `number \| OffsetFunction`                                                 | `0`                                                         | Distance in px from the anchor.                                                      |
| `alignOffset`           | `number \| OffsetFunction`                                                 | `0`                                                         | Offset in px along the alignment axis.                                               |
| `collisionBoundary`     | `'clipping-ancestors' \| Element \| Element[] \| Rect`                     | `'clipping-ancestors'`                                      | Boundary for collision detection.                                                    |
| `collisionPadding`      | `number \| Padding`                                                        | `5`                                                         | Padding around the collision boundary.                                               |
| `collisionAvoidance`    | `CollisionAvoidance`                                                       | `{ side: 'flip', align: 'flip', fallbackAxisSide: 'none' }` | Strategy to avoid collisions.                                                        |
| `sticky`                | `boolean`                                                                  | `false`                                                     | Whether to keep the popup in view when the anchor is scrolled.                       |
| `arrowPadding`          | `number`                                                                   | `5`                                                         | Padding between the arrow and the popup edges.                                       |
| `disableAnchorTracking` | `boolean`                                                                  | `false`                                                     | Whether to disable tracking of the anchor's position as it moves.                    |
| `anchor`                | `Element \| VirtualAnchorElement \| null`                                  | input group, or input                                       | Element to anchor the positioner to. The trigger when the input is inside the popup. |
| `positionMethod`        | `'absolute' \| 'fixed'`                                                    | `'absolute'`                                                | CSS position strategy to use.                                                        |
| `children`              | `Snippet<[{ open, side, align, anchorHidden, empty }]>`                    | —                                                           | Content; receives the positioner state.                                              |

::

| Attribute            | Description                                    |
| :------------------- | :--------------------------------------------- |
| `data-open`          | Present when the popup is open.                |
| `data-closed`        | Present when the popup is closed.              |
| `data-side`          | Which side of the anchor the popup is on.      |
| `data-align`         | How the popup is aligned relative to the side. |
| `data-anchor-hidden` | Present when the anchor is hidden.             |
| `data-empty`         | Present when no items are rendered.            |

| CSS Variable         | Description                                                |
| :------------------- | :--------------------------------------------------------- |
| `--available-width`  | Available width between the anchor and the viewport edge.  |
| `--available-height` | Available height between the anchor and the viewport edge. |
| `--anchor-width`     | Width of the anchor element.                               |
| `--anchor-height`    | Height of the anchor element.                              |
| `--transform-origin` | Transform origin for scale animations.                     |

### Popup

A container for the list.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop           | Type                                                                                              | Default | Description                                                                                                         |
| :------------- | :------------------------------------------------------------------------------------------------ | :------ | :------------------------------------------------------------------------------------------------------------------ |
| `as`           | `keyof HTMLElementTagNameMap`                                                                     | `'div'` | HTML element to render.                                                                                             |
| `class`        | `string`                                                                                          | —       | CSS class applied to the element.                                                                                   |
| `style`        | `string`                                                                                          | —       | Inline style applied to the element.                                                                                |
| `id`           | `string`                                                                                          | —       | Custom element ID. Defaults to `${rootId}-popup` when the input sits inside the popup, otherwise unset.             |
| `initialFocus` | `boolean \| HTMLElement \| ((interactionType: string) => HTMLElement \| boolean \| null \| void)` | —       | Element to focus when the popup opens, or a function receiving the interaction type. `false` to skip move-focus.    |
| `finalFocus`   | `boolean \| HTMLElement \| ((interactionType: string) => HTMLElement \| boolean \| null \| void)` | —       | Element to focus when the popup closes, or a function receiving the interaction type. `false` to skip return-focus. |
| `children`     | `Snippet<[{ open, side, align, anchorHidden, transitionStatus, empty }]>`                         | —       | Content; receives the popup state.                                                                                  |

::

| Attribute             | Description                                    |
| :-------------------- | :--------------------------------------------- |
| `data-open`           | Present when the popup is open.                |
| `data-closed`         | Present when the popup is closed.              |
| `data-starting-style` | Present when the popup is animating in.        |
| `data-ending-style`   | Present when the popup is animating out.       |
| `data-side`           | Which side of the anchor the popup is on.      |
| `data-align`          | How the popup is aligned relative to the side. |
| `data-empty`          | Present when no items are rendered.            |
| `data-anchor-hidden`  | Present when the anchor is hidden.             |

### List

A list container for the items.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                                  |
| :--------- | :---------------------------- | :------ | :------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.                      |
| `class`    | `string`                      | —       | CSS class applied to the element.            |
| `style`    | `string`                      | —       | Inline style applied to the element.         |
| `id`       | `string`                      | auto    | Custom element ID.                           |
| `children` | `Snippet<[{ empty }]>`        | —       | Content; receives whether the list is empty. |

::

| Attribute    | Description                         |
| :----------- | :---------------------------------- |
| `data-empty` | Present when no items are rendered. |

### Collection

Renders filtered list items.
Doesn't render its own HTML element.
Grouped `items` need a nested pass: an outer `<Combobox.Collection>` over the groups, and another one inside each `<Combobox.Group>` for its `items`.

The `children` snippet receives `(item, index)`.

### Item

An individual item in the list.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                             | Default | Description                                                                                                                                     |
| :--------- | :----------------------------------------------- | :------ | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                    | `'div'` | HTML element to render.                                                                                                                         |
| `class`    | `string`                                         | —       | CSS class applied to the element.                                                                                                               |
| `style`    | `string`                                         | —       | Inline style applied to the element.                                                                                                            |
| `value`    | `unknown`                                        | `null`  | The item's value.                                                                                                                               |
| `disabled` | `boolean`                                        | `false` | Whether the item is disabled.                                                                                                                   |
| `onclick`  | `(event: MouseEvent) => void`                    | —       | Fires when the item is clicked with the pointer, and when `Enter` is pressed while the item is highlighted and the `Input` or `List` has focus. |
| `index`    | `number`                                         | —       | Explicit index when items are virtualized.                                                                                                      |
| `children` | `Snippet<[{ selected, highlighted, disabled }]>` | —       | Content; receives the item state.                                                                                                               |

::

| Attribute          | Description                                   |
| :----------------- | :-------------------------------------------- |
| `data-selected`    | Present when this item is the selected value. |
| `data-highlighted` | Present when the item is highlighted.         |
| `data-disabled`    | Present when the item is disabled.            |

### Row

Displays a single row of items in a grid list.
Enable `grid` on the root component to turn the listbox into a grid.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop    | Type                          | Default | Description                          |
| :------ | :---------------------------- | :------ | :----------------------------------- |
| `as`    | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.              |
| `class` | `string`                      | —       | CSS class applied to the element.    |
| `style` | `string`                      | —       | Inline style applied to the element. |

::

### ItemIndicator

Indicates whether the item is selected.
Renders a `<span>` element.

::table{columns="Prop,Type,Default"}

| Prop          | Type                                        | Default  | Description                                                          |
| :------------ | :------------------------------------------ | :------- | :------------------------------------------------------------------- |
| `as`          | `keyof HTMLElementTagNameMap`               | `'span'` | HTML element to render.                                              |
| `class`       | `string`                                    | —        | CSS class applied to the element.                                    |
| `style`       | `string`                                    | —        | Inline style applied to the element.                                 |
| `keepMounted` | `boolean`                                   | `false`  | Whether to keep the indicator mounted when the item is not selected. |
| `children`    | `Snippet<[{ selected, transitionStatus }]>` | —        | Content; receives the item indicator state.                          |

::

| Attribute             | Description                                  |
| :-------------------- | :------------------------------------------- |
| `data-selected`       | Present when the item is selected.           |
| `data-starting-style` | Present when the indicator is animating in.  |
| `data-ending-style`   | Present when the indicator is animating out. |

### Empty

Renders its children only when the list is empty — with or without the `items` prop.
Announces changes politely to screen readers.
Its root element must stay mounted for announcements to work consistently across screen
readers: don't hide or remove it with `display: none`, `hidden`, `aria-hidden`, or
conditional rendering — update or conditionally render its children instead.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop    | Type                          | Default | Description                          |
| :------ | :---------------------------- | :------ | :----------------------------------- |
| `as`    | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.              |
| `class` | `string`                      | —       | CSS class applied to the element.    |
| `style` | `string`                      | —       | Inline style applied to the element. |

::

### Status

Displays a status message whose content changes are announced politely to screen readers.
Useful for conveying the status of an asynchronously loaded list.
Its root element must stay mounted for announcements to work consistently across screen
readers: don't hide or remove it with `display: none`, `hidden`, `aria-hidden`, or
conditional rendering — update or conditionally render its children instead.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop    | Type                          | Default | Description                          |
| :------ | :---------------------------- | :------ | :----------------------------------- |
| `as`    | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.              |
| `class` | `string`                      | —       | CSS class applied to the element.    |
| `style` | `string`                      | —       | Inline style applied to the element. |

::

### Arrow

Displays an element positioned against the anchor.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                           | Default | Description                          |
| :--------- | :--------------------------------------------- | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                  | `'div'` | HTML element to render.              |
| `class`    | `string`                                       | —       | CSS class applied to the element.    |
| `style`    | `string`                                       | —       | Inline style applied to the element. |
| `children` | `Snippet<[{ open, side, align, uncentered }]>` | —       | Content; receives the arrow state.   |

::

| Attribute         | Description                                    |
| :---------------- | :--------------------------------------------- |
| `data-open`       | Present when the popup is open.                |
| `data-closed`     | Present when the popup is closed.              |
| `data-side`       | Which side of the anchor the popup is on.      |
| `data-align`      | How the popup is aligned relative to the side. |
| `data-uncentered` | Present when the arrow cannot be centered.     |

### Group

Groups related items with the corresponding label.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop    | Type                          | Default | Description                                                                                          |
| :------ | :---------------------------- | :------ | :--------------------------------------------------------------------------------------------------- |
| `as`    | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.                                                                              |
| `class` | `string`                      | —       | CSS class applied to the element.                                                                    |
| `style` | `string`                      | —       | Inline style applied to the element.                                                                 |
| `items` | `readonly unknown[]`          | —       | Items belonging to this group. Used with `<Combobox.Collection>` when rendering grouped collections. |

::

### GroupLabel

An accessible label that is automatically associated with its parent group.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop    | Type                          | Default | Description                          |
| :------ | :---------------------------- | :------ | :----------------------------------- |
| `as`    | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.              |
| `class` | `string`                      | —       | CSS class applied to the element.    |
| `style` | `string`                      | —       | Inline style applied to the element. |

::

### Separator

A visual divider between groups of items. Rendered as `role="presentation"`, because
`role="separator"` is not valid inside a `listbox`.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop          | Type                          | Default        | Description                          |
| :------------ | :---------------------------- | :------------- | :----------------------------------- |
| `as`          | `keyof HTMLElementTagNameMap` | `'div'`        | HTML element to render.              |
| `class`       | `string`                      | —              | CSS class applied to the element.    |
| `style`       | `string`                      | —              | Inline style applied to the element. |
| `orientation` | `'horizontal' \| 'vertical'`  | `'horizontal'` | The orientation of the separator.    |

::

| Attribute          | Description                                 |
| :----------------- | :------------------------------------------ |
| `data-orientation` | Indicates the orientation of the separator. |

## createFilter

A locale-aware filter helper. Returns three predicates (`contains` / `startsWith` / `endsWith`) built around `Intl.Collator`, so case- and accent-insensitive matching follows the user's locale. Each predicate also fits the `filter` prop's signature, so you can hand one to `<Combobox.Root>` as the internal filter.

It takes `Intl.CollatorOptions` plus `locale`, and optionally `multiple` and `value` — pass the current selection as `value` in single-select mode so the selected item keeps matching its own label.

```svelte title="Using createFilter"
<script>
  import { Combobox } from '@shardsui/svelte/combobox'

  const filter = Combobox.createFilter({ sensitivity: 'base' })
  const filtered = $derived(items.filter((it) => filter.contains(it.label, query)))
</script>
```

## Additional types

### HighlightReason

The `reason` passed to `onItemHighlighted`, reporting what moved the highlight.

```ts
type HighlightReason = 'keyboard' | 'pointer' | 'none'
```
