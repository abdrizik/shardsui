import { Context } from '$lib/internal/context'
import { DEFAULT_LABELABLE, type LabelableContextValue } from '$lib/internal/labelable.svelte'

export const LabelableContext = new Context<LabelableContextValue>('Field.Root', DEFAULT_LABELABLE)
