<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let { value = $bindable('apple'), onValueChange = undefined, open = $bindable(true) } = $props()
</script>

<Combobox.Root bind:value {onValueChange} bind:open>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup" class="escape-animation-popup">
        <Combobox.List>
          <Combobox.Item value="apple">apple</Combobox.Item>
          <Combobox.Item value="banana">banana</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>

<style>
  @keyframes combobox-escape-close-test {
    to {
      opacity: 0;
    }
  }

  :global(.escape-animation-popup[data-ending-style]) {
    animation: combobox-escape-close-test 200ms linear;
  }
</style>
