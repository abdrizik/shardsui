<script lang="ts">
  import { Collapsible } from '$lib/components/collapsible'

  let {
    css = '',
    panelClass = undefined,
    panelStyle = undefined
  }: {
    css?: string
    panelClass?: string
    panelStyle?: string
  } = $props()

  let motionEnabled = $state(false)
</script>

{@html `<style>${css}</style>`}

<button type="button" data-testid="enable-motion" onclick={() => (motionEnabled = true)}>
  Enable motion
</button>

<Collapsible.Root>
  <Collapsible.Trigger>Trigger</Collapsible.Trigger>
  <Collapsible.Panel
    class={motionEnabled ? panelClass : undefined}
    style={motionEnabled ? panelStyle : undefined}
    hiddenUntilFound
    keepMounted
    data-testid="panel"
  >
    This is panel content
  </Collapsible.Panel>
</Collapsible.Root>
