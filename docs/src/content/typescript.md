# TypeScript

Inferring props, refs, and value types.

ShardsUI is written in TypeScript, so types flow through `bind:`, callback parameters, and snippets with no annotations. This page covers the cases where you do name a type.

## Inferring a component's props

Each part declares its props inline, so there's no props interface to import. When you build a wrapper that should accept exactly what the underlying part accepts, infer the shape with `ComponentProps` from `svelte`:

```svelte title="Wrapping a part"
<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import { Tooltip } from '@shardsui/svelte/tooltip'

  let props: ComponentProps<typeof Tooltip.Root> = $props()
</script>

<Tooltip.Root {...props} />
```

`ComponentProps<typeof X>` resolves to the full prop surface of `X` — `class`, `style`, `as`, `ref`, the `children` snippet, and every part-specific prop. Index into it to reuse or narrow one of them:

```ts title="Reusing one prop's type"
import type { ComponentProps } from 'svelte'
import { Tooltip } from '@shardsui/svelte/tooltip'

type TooltipDelay = ComponentProps<typeof Tooltip.Trigger>['delay']
```

## Typing controlled state

A stateful prop does double duty: pass a value without `bind:` and the part owns the state; add `bind:` and you own it:

```svelte title="Controlled value"
<script lang="ts">
  import { Switch } from '@shardsui/svelte/switch'

  let checked = $state(false)
</script>

<Switch.Root bind:checked />
```

The rune's inferred type is usually enough — `$state(false)` is already `boolean`. Annotate it when the value is a union, so an invalid value is caught at the binding site instead of at runtime:

```svelte title="Controlled select value"
<script lang="ts">
  import { Select } from '@shardsui/svelte/select'

  let value: 'sans' | 'serif' | 'mono' = $state('sans')
</script>

<Select.Root bind:value>
  <!-- … -->
</Select.Root>
```

## Value types for generic parts

`Select.Root` and `Combobox.Root` are generic over the item they hold and over whether selection is single or multiple, but `items` never infers it: Combobox types it `readonly NoInfer<Value>[]` and Select's entries are `unknown`. Annotate the bound `value` instead — the item type flows from there into `onValueChange`, `itemToStringLabel`, the item snippets, and Combobox's `onItemHighlighted`, with no casts. Without an annotated `value`, the type has to come from a typed wrapper (see below).

In single mode (the default) the value is the item, or `null` when nothing is chosen:

```svelte title="Single-select value"
<script lang="ts">
  import { Combobox } from '@shardsui/svelte/combobox'

  type Fruit = {
    id: string
    label: string
  }

  const fruits: Fruit[] = [
    { id: 'apple', label: 'Apple' },
    { id: 'cherry', label: 'Cherry' }
  ]

  let value: Fruit | null = $state(null)
</script>

<Combobox.Root items={fruits} bind:value>
  <!-- … -->
</Combobox.Root>
```

Add `multiple` and the value type flips to an array of items:

```svelte title="Multi-select value"
<script lang="ts">
  import { Combobox } from '@shardsui/svelte/combobox'

  type Fruit = {
    id: string
    label: string
  }

  const fruits: Fruit[] = [
    { id: 'apple', label: 'Apple' },
    { id: 'cherry', label: 'Cherry' }
  ]

  let value: Fruit[] | null = $state([])
</script>

<Combobox.Root items={fruits} multiple bind:value>
  <!-- … -->
</Combobox.Root>
```

`Autocomplete.Root` is generic over its item too, but only for `items`, `filter` and the item snippets — its `value` is the input's text, so it is always a `string`.

To wrap a generic part, forward its type parameter with `<script generics="…">` so the item type keeps flowing from your call site through the wrapper into the part:

```svelte title="Wrapping a generic part"
<script lang="ts" generics="Item">
  import type { ComponentProps } from 'svelte'
  import { Combobox } from '@shardsui/svelte/combobox'

  let props: ComponentProps<typeof Combobox.Root<Item>> = $props()
</script>

<Combobox.Root {...props} />
```

`Form` is generic over the values object it collects, defaulting to `Record<string, unknown>` keyed by each field's `name`. It can't infer what your fields hold, so annotate the `onFormSubmit` parameter and the type flows back into the component — or skip the annotation and parse the values instead (see the [Zod example](/svelte/forms#schema-validation-with-zod), where the schema is what produces the typed object):

```svelte title="Typing the submitted values"
<script lang="ts">
  import { Form } from '@shardsui/svelte/form'
  import { Field } from '@shardsui/svelte/field'

  type SignUpValues = {
    email: string
    password: string
  }
</script>

<Form
  onFormSubmit={({ email, password }: SignUpValues) => {
    console.log(email, password)
  }}
>
  <Field.Root name="email">
    <Field.Control type="email" />
  </Field.Root>
  <Field.Root name="password">
    <Field.Control type="password" />
  </Field.Root>
</Form>
```

The `errors` prop is typed as `FormErrors` — `Record<string, string | string[]>`, keyed by the same field `name` — exported from `@shardsui/svelte/form` alongside `FormValidationMode`:

```svelte title="Holding server errors"
<script lang="ts">
  import { Form } from '@shardsui/svelte/form'
  import type { FormErrors } from '@shardsui/svelte/form'

  let errors: FormErrors = $state({})
</script>

<Form {errors}>
  <!-- … -->
</Form>
```

## Change callbacks and events

A change callback takes one argument, the new value. Let it infer from the prop, or annotate it when the handler lives away from the markup:

```ts title="Change handlers"
function onCheckedChange(checked: boolean) {
  console.log(checked)
}

function onValueChange(value: string) {
  console.log(value)
}
```

The component reports the new value and commits it, so there is nothing to cancel in the callback. To veto a change, use a [function binding](https://svelte.dev/docs/svelte/bind#Function-bindings) and decline to commit in the setter (see [State](/svelte/state#vetoing-a-change)).

Native DOM events reach you through the ordinary handler props and keep their standard DOM types:

```ts title="Native event handler"
function onsubmit(event: SubmitEvent) {
  event.preventDefault()
}
```

On the handlers a part runs its own logic after, the event also carries `preventShardsUIHandler()`. Annotate those with `MouseEvent & PreventableEvent` (or whichever DOM event applies) when the handler lives away from the markup — see [Composition](/svelte/composition#merging-your-own-attributes).

## Imperative handles

When a trigger and its content can't sit together in the markup, detach them with a handle. `new Dialog.Handle()` constructs one; the type argument makes the handle's own methods generic over the payload you carry:

```svelte title="Typed dialog handle"
<script lang="ts">
  import { Dialog } from '@shardsui/svelte/dialog'

  const dialog = new Dialog.Handle<{ text: string }>()
</script>

<Dialog.Trigger handle={dialog} payload={{ text: 'From the toolbar' }}>Open</Dialog.Trigger>

<Dialog.Root handle={dialog}>
  {#snippet children({ payload })}
    <Dialog.Portal>
      <Dialog.Popup>
        {#if payload}
          <Dialog.Description>Opened by {payload.text}</Dialog.Description>
        {/if}
      </Dialog.Popup>
    </Dialog.Portal>
  {/snippet}
</Dialog.Root>
```

The handle drives the dialog from your own code — `dialog.open(triggerId)`, `dialog.close()`, `dialog.openWithPayload(payload)`, and the readonly `dialog.isOpen` — with `openWithPayload` typed against the `{ text: string }` you declared. `open` takes the `id` of a registered detached trigger, or `null` to open with no trigger at all; `Dialog`, `AlertDialog` and `Drawer` accept `null` and carry `openWithPayload`, while the `Popover`, `Menu`, `Tooltip` and `PreviewCard` handles require an id.

The same type argument flows through `<Dialog.Trigger>`'s `payload` prop and into the `children` snippet, where `payload` arrives as `{ text: string } | undefined` — guard the `undefined`, which means no trigger has opened the dialog yet. To pass a handle across module boundaries, annotate it with the `Dialog.Handle` type:

```ts title="Annotating a handle"
import { Dialog } from '@shardsui/svelte/dialog'

let dialog: Dialog.Handle<{ text: string }>
```

## Refs and `bind:this`

Parts that render an element expose a bindable `ref`, typed `HTMLElement | null` — `as` makes the tag a runtime value, so the type can't narrow to a concrete element. Type the backing rune the same way; narrow with an `instanceof` check where you need a tag-specific API. Keep `| null` — the ref is empty until the element mounts, so a prop that wants a non-null element, like `initialFocus`, takes a getter instead:

```svelte title="Typing bind:ref"
<script lang="ts">
  import { Dialog } from '@shardsui/svelte/dialog'

  let popupEl: HTMLElement | null = $state(null)
</script>

<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Popup bind:ref={popupEl} initialFocus={() => popupEl}>
      <!-- … -->
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

`bind:this` follows the same rule — typed to the component on a component instance, to the element on a plain element:

```svelte title="Typing bind:this on an element"
<script lang="ts">
  let buttonEl: HTMLButtonElement | null = $state(null)
</script>

<button bind:this={buttonEl}>Click</button>
```

## Snippets

Snippets are fully typed. When a part hands its `children` snippet its state, destructure it — the parameter type comes from the part, so there is nothing to annotate:

```svelte title="Snippet payload"
<script lang="ts">
  import { Switch } from '@shardsui/svelte/switch'
</script>

<Switch.Root>
  <Switch.Thumb>
    {#snippet children({ checked })}
      {checked ? 'On' : 'Off'}
    {/snippet}
  </Switch.Thumb>
</Switch.Root>
```

To accept a snippet as your own prop, import the `Snippet` type from `svelte` and parameterize it with the argument tuple your snippet receives:

```svelte title="Accepting a snippet prop"
<script lang="ts">
  import type { Snippet } from 'svelte'

  let { children }: { children: Snippet<[count: number]> } = $props()
</script>

{@render children(1)}
```

A snippet that takes nothing is just `Snippet`; one that receives a payload object is `Snippet<[{ payload: SomeType }]>`.

## Other exported types

A few parts hand you richer objects and export the types to match.

The toast object your toast content receives carries its `id`, `title`, `description`, `priority`, transition status and your own `data`; it is `ToastObject<Data>`, exported from `@shardsui/svelte/toast` along with `ToastManagerAddOptions`, `ToastManagerUpdateOptions` and `ToastManagerPromiseOptions` for the `Toast.Manager` queue — see [Toast](/svelte/toast).

`Combobox.createFilter` returns a `ComboboxFilter` and takes `ComboboxFilterOptions`, both exported from `@shardsui/svelte/combobox` — see [Combobox](/svelte/combobox).

`PreventableEvent` is exported from `@shardsui/svelte`. Intersect it with a DOM event to type a handler that calls `preventShardsUIHandler()` — see [Composition](/svelte/composition#merging-your-own-attributes).
