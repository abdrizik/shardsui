<script lang="ts">
  import { Field } from '$lib/components/field'

  let { onTransitionFinished }: { onTransitionFinished: () => void } = $props()
  let showError = $state(false)
</script>

<svelte:head>
  <style>
    .animation-test-error-enter {
      transition: opacity 1ms;
    }
    .animation-test-error-enter[data-starting-style],
    .animation-test-error-enter[data-ending-style] {
      opacity: 0;
    }
  </style>
</svelte:head>

<button type="button" onclick={() => (showError = true)}>Show</button>
<Field.Root>
  <Field.Control required />
  <Field.Error
    class="animation-test-error-enter"
    data-testid="error"
    match={showError}
    ontransitionend={onTransitionFinished}
  >
    Message
  </Field.Error>
</Field.Root>
