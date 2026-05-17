import { Context } from '$lib/internal/context'

/** Presence marker: anchored positioners assert they are inside a `*.Portal`. */
export const AnchoredPortalContext = new Context<true>('*.Portal')
