<script lang="ts">
  import { Collapsible } from '$lib/components/collapsible'

  let {
    open = $bindable(false),
    css = '',
    panelClass = undefined,
    panelStyle = undefined,
    keepMounted = false,
    hiddenUntilFound = false,
    content = 'This is panel content'
  }: {
    open?: boolean
    css?: string
    panelClass?: string
    panelStyle?: string
    keepMounted?: boolean
    hiddenUntilFound?: boolean
    content?: string
  } = $props()
</script>

{@html `<style>${css}</style>`}

<Collapsible.Root bind:open>
  <Collapsible.Trigger>Trigger</Collapsible.Trigger>
  <Collapsible.Panel
    class={panelClass}
    style={panelStyle}
    {keepMounted}
    {hiddenUntilFound}
    data-testid="panel"
  >
    {content}
  </Collapsible.Panel>
</Collapsible.Root>
