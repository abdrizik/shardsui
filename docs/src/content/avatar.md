# Avatar

A user image with a fallback.

:demo{name="avatar/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Avatar } from '@shardsui/svelte/avatar'
</script>

<Avatar.Root>
  <Avatar.Image />
  <Avatar.Fallback />
</Avatar.Root>
```

## API reference

### Root

Groups the image and its fallback. Renders a `<span>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                | Default  | Description                                 |
| :--------- | :---------------------------------- | :------- | :------------------------------------------ |
| `as`       | `keyof HTMLElementTagNameMap`       | `'span'` | HTML element to render.                     |
| `class`    | `string`                            | —        | CSS class applied to the element.           |
| `style`    | `string`                            | —        | Inline style applied to the element.        |
| `children` | `Snippet<[{ imageLoadingStatus }]>` | —        | Content; receives the image loading status. |

::

### Image

Renders an `<img>` element.

The component preloads the image — applying the same `src`, `srcset`, `sizes`, `crossorigin` and `referrerpolicy` — so the loading status is known from the first render. The `<img>` mounts only once the image has loaded, which is why it can be animated in with `data-starting-style`; see [Animation](/svelte/animation).

::table{columns="Prop,Type,Default"}

| Prop                    | Type                                   | Default | Description                                                                     |
| :---------------------- | :------------------------------------- | :------ | :------------------------------------------------------------------------------ |
| `as`                    | `keyof HTMLElementTagNameMap`          | `'img'` | HTML element to render.                                                         |
| `class`                 | `string`                               | —       | CSS class applied to the element.                                               |
| `style`                 | `string`                               | —       | Inline style applied to the element.                                            |
| `src`                   | `string`                               | —       | Image URL.                                                                      |
| `srcset`                | `string`                               | —       | Responsive image source set. Enough on its own — `src` may be omitted.          |
| `alt`                   | `string`                               | —       | Alternative text. Use `alt=""` when the user's name already appears next to it. |
| `onLoadingStatusChange` | `(status: ImageLoadingStatus) => void` | —       | Fires when the loading status changes. Never fires with `'idle'`.               |

::

| Attribute             | Description                              |
| :-------------------- | :--------------------------------------- |
| `data-starting-style` | Present when the image is animating in.  |
| `data-ending-style`   | Present when the image is animating out. |

### Fallback

Rendered while the image is missing, still loading, or failed. Renders a `<span>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                | Default  | Description                                                              |
| :--------- | :---------------------------------- | :------- | :----------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`       | `'span'` | HTML element to render.                                                  |
| `class`    | `string`                            | —        | CSS class applied to the element.                                        |
| `style`    | `string`                            | —        | Inline style applied to the element.                                     |
| `delay`    | `number`                            | `0`      | How long to wait before showing the fallback. Specified in milliseconds. |
| `children` | `Snippet<[{ imageLoadingStatus }]>` | —        | Content; receives the image loading status.                              |

::

## Additional types

### ImageLoadingStatus

The status passed to `onLoadingStatusChange`, and to the `children` snippet of `Root` and `Fallback` as `imageLoadingStatus`.

```ts
type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error'
```
