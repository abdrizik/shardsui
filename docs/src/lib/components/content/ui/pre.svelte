<script lang="ts">
  import type { Snippet } from 'svelte'
  import CopyButton from '$lib/components/copy-button.svelte'

  type Props = {
    children?: Snippet
    language?: string
    class?: string
  }

  let { children, language, class: shikiClass }: Props = $props()

  let preEl = $state<HTMLPreElement>()
  const code = $derived(preEl?.textContent ?? '')
</script>

<div class="code-block-root not-prose">
  <div class="code-block-card">
    <CopyButton text={code} />

    <pre
      bind:this={preEl}
      class="thin-scrollbar {shikiClass}"
      data-language={language}>{#if children}{@render children()}{/if}</pre>
  </div>
</div>

<style>
  .code-block-root {
    --code-inner-radius: var(--radius-md);
    align-self: stretch;
    margin-block: var(--prose-flow, calc(var(--spacing) * 4));
    padding: var(--spacing);
    background-color: var(--color-gray-100);
    border-radius: calc(var(--code-inner-radius) + var(--spacing));
  }

  .code-block-card {
    position: relative;
    background-color: var(--color-content);
    border-radius: var(--code-inner-radius);

    @media (hover: hover) {
      --copy-opacity: 0;

      &:hover,
      &:focus-within {
        --copy-opacity: 1;
      }
    }
  }

  .code-block-root :global(pre) {
    background: none !important;
    font-size: var(--text-code);
    line-height: var(--text-code--line-height);
    color: var(--color-foreground);
    outline: 0;
    display: flex;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    padding-block: calc(var(--spacing) * 2);
  }

  .code-block-root :global(pre code) {
    display: grid;
    flex-grow: 1;
    font-family: var(--font-mono);
    white-space: normal;
  }

  .code-block-root :global(pre code .line) {
    display: block;
    white-space: pre;
    padding-inline: calc(var(--spacing) * 3);
  }

  .code-block-root :global(pre code .line:empty) {
    block-size: 1lh;
  }
</style>
