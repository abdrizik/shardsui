import { Context } from '$lib/internal/context'
import type { FormRoot } from './form.svelte'

export const FormContext = new Context<FormRoot>('Form')
