import type { Snippet } from 'svelte'
import type { SvelteHTMLElements } from 'svelte/elements'

export type Orientation = 'horizontal' | 'vertical'

export type PartProps<
  Args extends unknown[] = [],
  Tag extends keyof HTMLElementTagNameMap = 'div'
> = Omit<SvelteHTMLElements[Tag], 'children' | 'id'> & {
  as?: keyof HTMLElementTagNameMap
  ref?: HTMLElement | null
  id?: string
  children?: Snippet<Args>
}
