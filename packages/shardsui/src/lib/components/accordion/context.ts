import { Context } from '$lib/internal/context'
import type { AccordionItem, AccordionRoot } from './accordion.svelte'

export const AccordionContext = new Context<AccordionRoot<any>>('Accordion.Root')

export const AccordionItemContext = new Context<AccordionItem>('Accordion.Item')
