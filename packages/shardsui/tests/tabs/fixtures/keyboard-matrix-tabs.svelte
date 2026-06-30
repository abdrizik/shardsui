<script lang="ts">
  import { DirectionProvider, type TextDirection } from '$lib/components/direction-provider'
  import { Tabs } from '$lib/components/tabs'
  import type { TabsOrientation, TabsValue } from '$lib/components/tabs'

  let {
    direction = 'ltr',
    orientation = 'horizontal',
    value = 0,
    activateOnFocus = undefined,
    disabledIndex = -1,
    onValueChange = undefined,
    onkeydown = undefined
  }: {
    direction?: TextDirection
    orientation?: TabsOrientation
    value?: TabsValue
    activateOnFocus?: boolean
    disabledIndex?: number
    onValueChange?: (value: TabsValue) => void
    onkeydown?: (event: KeyboardEvent) => void
  } = $props()
</script>

<DirectionProvider {direction}>
  <Tabs.Root {value} {onValueChange} {orientation}>
    <Tabs.List {activateOnFocus} {onkeydown}>
      <Tabs.Tab value={0} disabled={disabledIndex === 0} />
      <Tabs.Tab value={1} disabled={disabledIndex === 1} />
      <Tabs.Tab value={2} disabled={disabledIndex === 2} />
    </Tabs.List>
  </Tabs.Root>
</DirectionProvider>
