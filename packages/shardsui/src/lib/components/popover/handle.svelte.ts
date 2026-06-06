import { TriggerMapHandle } from '$lib/internal/detached-handle'
import { PopoverRoot } from './popover.svelte'

/** A handle to control a Popover imperatively and to associate detached triggers with it. */
export class PopoverHandle<Payload = unknown> extends TriggerMapHandle<PopoverRoot<Payload>> {
  constructor() {
    super(new PopoverRoot<Payload>(), 'Popover')
  }
}
