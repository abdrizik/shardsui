import { TriggerMapHandle } from '$lib/internal/detached-handle'
import { PreviewCardRoot } from './preview-card.svelte'

/** A handle to control a Preview Card imperatively and to associate detached triggers with it. */
export class PreviewCardHandle<Payload = unknown> extends TriggerMapHandle<
  PreviewCardRoot<Payload>
> {
  constructor() {
    super(new PreviewCardRoot<Payload>(), 'PreviewCard')
  }
}
