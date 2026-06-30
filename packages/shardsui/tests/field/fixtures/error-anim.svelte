<script lang="ts">
  import { Field } from '$lib/components/field'

  let showError = $state(true)
</script>

<svelte:head>
  <style>
    @keyframes test-anim {
      to {
        opacity: 0;
      }
    }
    .animation-test-error[data-ending-style] {
      animation: test-anim 100ms;
    }
  </style>
</svelte:head>

<button type="button" onclick={() => (showError = false)}>Hide</button>
<Field.Root>
  <Field.Control required />
  <Field.Error class="animation-test-error" data-testid="error" match={showError}>
    Message
  </Field.Error>
</Field.Root>
