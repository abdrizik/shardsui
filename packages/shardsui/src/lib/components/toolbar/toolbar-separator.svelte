<script lang="ts">
  import { Separator } from '$lib/components/separator'
  import type { ComponentProps } from 'svelte'
  import { ToolbarContext } from './context'

  type Props = ComponentProps<typeof Separator>

  let { ref = $bindable(null), orientation: orientationProp, ...rest }: Props = $props()

  const toolbar = ToolbarContext.get()
</script>

<Separator
  bind:ref
  orientation={orientationProp ??
    (toolbar.orientation === 'horizontal' ? 'vertical' : 'horizontal')}
  {...rest}
/>
