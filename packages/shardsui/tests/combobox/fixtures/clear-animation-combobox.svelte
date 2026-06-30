<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    value = $bindable(),
    open = $bindable(),
    keepMounted = false,
    ontransitionend = undefined
  } = $props()

  const style = `
    .animation-test-indicator {
      transition: opacity 1ms;
    }

    .animation-test-indicator[data-starting-style],
    .animation-test-indicator[data-ending-style] {
      opacity: 0;
    }
  `
</script>

<svelte:head>
  {@html `<style>${style}</style>`}
</svelte:head>

<div>
  <Combobox.Root {value} {open}>
    <Combobox.Input data-testid="input" />
    <Combobox.Clear
      class="animation-test-indicator"
      data-testid="clear"
      {keepMounted}
      {ontransitionend}
    />
    <Combobox.Portal>
      <Combobox.Positioner>
        <Combobox.Popup data-testid="popup">
          <Combobox.List data-testid="list">
            <Combobox.Item value="a">a</Combobox.Item>
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
</div>
