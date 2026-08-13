<script lang="ts">
  import TextMorph from '$lib/components/text-morph.svelte'
  import { createClipboard } from '$lib/utils/clipboard.svelte'

  type Props = {
    text: string
  }

  let { text }: Props = $props()

  const clipboard = createClipboard()
</script>

<button
  type="button"
  aria-label="Copy code"
  data-copied={clipboard.copied ? '' : undefined}
  onclick={() => clipboard.copy(text)}
>
  <TextMorph text={clipboard.copied ? 'copied' : 'copy'} aria-hidden="true" />
  <span class="sr-only" role="status">{clipboard.copied ? 'Copied' : ''}</span>
</button>

<style>
  button {
    position: absolute;
    z-index: 2;
    inset-block-start: calc(var(--spacing) * 2);
    inset-inline-end: calc(var(--spacing) * 2);
    block-size: calc(var(--spacing) * 6);
    padding-inline: calc(var(--spacing) * 2);
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-gray-700);
    outline: 0;
    user-select: none;
    border-radius: var(--radius-md);

    &:focus-visible {
      outline: 2px solid var(--color-gray-900);
      outline-offset: -1px;
    }

    @media (hover: hover) {
      opacity: var(--copy-opacity, 1);
      transition:
        opacity 150ms var(--ease-out),
        color 150ms var(--ease-out);
    }
  }
</style>
