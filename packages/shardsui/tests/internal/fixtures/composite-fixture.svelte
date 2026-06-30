<script lang="ts">
  import { untrack } from 'svelte'
  import { Composite, type CompositeOrientation } from '$lib/internal/floating/composite.svelte'
  import type { ModifierKey } from '$lib/internal/composite'
  import { DirectionContext } from '$lib/internal/direction-context'
  import CompositeItemFixture from './composite-item-fixture.svelte'

  type ItemDef = { label: string; disabled?: boolean }

  type Props = {
    orientation?: CompositeOrientation
    loopFocus?: boolean
    enableHomeAndEnd?: boolean
    modifierKeys?: ModifierKey[]
    items?: ItemDef[]
    rtl?: boolean
    nativeInput?: boolean
  }

  let {
    orientation = 'vertical',
    loopFocus = true,
    enableHomeAndEnd = false,
    modifierKeys = undefined,
    items = [{ label: '1' }, { label: '2' }, { label: '3' }],
    rtl = false,
    nativeInput = false
  }: Props = $props()

  DirectionContext.set({ direction: untrack(() => rtl) ? 'rtl' : 'ltr' })

  let ref = $state<HTMLElement | null>(null)

  const composite = new Composite(() => ({
    orientation,
    loopFocus,
    enableHomeAndEnd,
    modifierKeys,
    ref
  }))
</script>

<div
  bind:this={ref}
  data-testid="root"
  role="toolbar"
  tabindex="-1"
  onkeydown={(e) => composite.onkeydown(e)}
  onfocusin={(e) => composite.onfocus(e)}
>
  {#each items as item (item.label)}
    <CompositeItemFixture {composite} label={item.label} disabled={item.disabled ?? false} />
    {#if nativeInput && item.label === '1'}
      <input data-testid="native-input" type="text" value="abcd" />
    {/if}
  {/each}
</div>
