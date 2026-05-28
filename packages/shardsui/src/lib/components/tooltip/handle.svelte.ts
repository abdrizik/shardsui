import { TriggerMapHandle } from '$lib/internal/detached-handle'
import { TooltipRoot } from './tooltip.svelte'

/** A handle to control a Tooltip imperatively and to associate detached triggers with it. */
export class TooltipHandle<Payload = unknown> extends TriggerMapHandle<TooltipRoot<Payload>> {
  constructor() {
    super(new TooltipRoot<Payload>(), 'Tooltip')
  }
}
