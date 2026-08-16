import type { Snippet } from 'svelte'
import type { SvelteHTMLElements } from 'svelte/elements'
import type { PreventableEvent } from './event-preventable'

export type Orientation = 'horizontal' | 'vertical'

type PreventableHandlers<Attrs, Keys extends keyof Attrs> = {
  [K in Keys]?: NonNullable<Attrs[K]> extends (event: infer E) => infer R
    ? { handle(event: E & PreventableEvent): R }['handle'] | null
    : Attrs[K]
}

/** `Attrs` with `Keys` retyped to hand the handler an event carrying `preventShardsUIHandler()`. */
export type WithPreventable<Attrs, Keys extends keyof Attrs = never> = Omit<Attrs, Keys> &
  PreventableHandlers<Attrs, Keys>

export type PartProps<
  Args extends unknown[] = [],
  Tag extends keyof HTMLElementTagNameMap = 'div',
  Preventable extends keyof SvelteHTMLElements[Tag] = never
> = Omit<SvelteHTMLElements[Tag], 'children' | 'id' | Preventable> &
  PreventableHandlers<SvelteHTMLElements[Tag], Preventable> & {
    as?: keyof HTMLElementTagNameMap
    ref?: HTMLElement | null
    id?: string
    children?: Snippet<Args>
  }
