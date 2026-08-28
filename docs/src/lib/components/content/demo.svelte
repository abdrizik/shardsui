<script lang="ts">
  import { getDemoComponent, getDemoSource } from '$lib/components/content/demos'
  import CopyButton from '$lib/components/copy-button.svelte'
  import InspectOverlay from '$lib/components/content/inspect-overlay.svelte'
  import { highlight } from '$lib/utils/highlight'
  import { Collapsible } from '@shardsui/svelte/collapsible'
  import type { Snippet } from 'svelte'

  const COLLAPSIBLE_LINES_THRESHOLD = 8

  type Props = {
    name: string
    lang?: string
    children?: Snippet
  }

  let { name, lang = 'svelte', children }: Props = $props()

  const Component = $derived(getDemoComponent(name))
  const code = $derived(getDemoSource(name))
  const collapsible = $derived(code.trim().split('\n').length >= COLLAPSIBLE_LINES_THRESHOLD)
  const codeHtml = $derived(await highlight(code.trim(), lang))

  let expanded = $state(false)
  let inspecting = $state(false)
  let playgroundInner = $state<HTMLElement | null>(null)

  const playgroundInnerRef = (node: HTMLElement) => {
    playgroundInner = node
    return () => (playgroundInner = null)
  }
</script>

<div class="demo-root not-prose">
  <div class="demo-playground thin-scrollbar">
    <div class="demo-playground-inner" {@attach playgroundInnerRef}>
      {#if Component}
        <Component />
      {:else if children}
        {@render children()}
      {/if}
    </div>

    {#if inspecting && playgroundInner}
      <InspectOverlay content={playgroundInner} onclose={() => (inspecting = false)} />
    {/if}
  </div>

  <button
    type="button"
    class="demo-inspect-button"
    aria-pressed={inspecting}
    onclick={() => (inspecting = !inspecting)}
  >
    {@render inspectIcon()}
    Inspect
  </button>

  <Collapsible.Root bind:open={expanded}>
    <div class="demo-code-card" role="figure" aria-label="Component demo code">
      <div class="demo-code-block-root" data-closed={collapsible && !expanded ? '' : undefined}>
        <CopyButton text={code} />

        {#if collapsible}
          <Collapsible.Panel keepMounted hidden={false}>
            {@render codeBlock(!expanded)}
          </Collapsible.Panel>

          <Collapsible.Trigger
            class="demo-collapse-button"
            aria-label={expanded ? 'Hide code' : 'Show code'}
            data-open={expanded ? '' : undefined}
          >
            {@render collapseArrowIcon()}
          </Collapsible.Trigger>
        {:else}
          {@render codeBlock(false)}
        {/if}
      </div>
    </div>
  </Collapsible.Root>
</div>

{#snippet codeBlock(collapsed: boolean)}
  <div class="demo-code-block thin-scrollbar" data-closed={collapsed ? '' : undefined}>
    <div class="demo-source-browser">
      {@html codeHtml}
    </div>
  </div>
{/snippet}

{#snippet inspectIcon()}
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 1.75V8.25M22.25 12H15.75M12 15.75V22.25M8.25 12H1.75M12 19.25C7.99594 19.25 4.75 16.0041 4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12C19.25 16.0041 16.0041 19.25 12 19.25Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}

{#snippet collapseArrowIcon()}
  <svg
    class="demo-collapse-arrow-icon"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M17.7197 8.96967C18.0126 8.67678 18.4873 8.67678 18.7802 8.96967C19.0731 9.26256 19.0731 9.73732 18.7802 10.0302L12.5302 16.2802C12.2373 16.5731 11.7626 16.5731 11.4697 16.2802L5.21967 10.0302C4.92678 9.73732 4.92678 9.26256 5.21967 8.96967C5.51256 8.67678 5.98732 8.67678 6.28022 8.96967L11.9999 14.6894L17.7197 8.96967Z"
      fill="currentColor"
    />
  </svg>
{/snippet}

<style>
  .demo-root {
    --demo-radius: var(--radius-md);
    --padding: var(--spacing);
    --outer-radius: calc(var(--demo-radius) + var(--padding));
    --demo-min-h: calc(var(--spacing) * 56);
    --demo-shell: var(--color-gray-100);
    margin-block: calc(var(--spacing) * 6);
    padding: var(--padding);
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--padding);
    background-color: var(--demo-shell);
    border-radius: var(--outer-radius);
  }

  .demo-playground {
    position: relative;
    background-color: var(--color-content);
    border-radius: var(--demo-radius);
    overflow: auto hidden;
    overscroll-behavior-x: contain;
  }
  .demo-playground:focus-visible {
    outline: 2px solid var(--color-gray-900);
    outline-offset: -1px;
    z-index: 1;
  }
  .demo-playground-inner {
    padding: calc(var(--spacing) * 8) calc(var(--spacing) * 6);
    min-block-size: var(--demo-min-h);
    min-inline-size: fit-content;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .demo-inspect-button {
    position: absolute;
    z-index: 4;
    inset-block-start: calc(var(--padding) + var(--spacing) * 2);
    inset-inline-end: calc(var(--padding) + var(--spacing) * 2);
    display: inline-flex;
    align-items: center;
    gap: calc(var(--spacing) * 1.5);
    block-size: calc(var(--spacing) * 7);
    padding-inline: calc(var(--spacing) * 2.5) calc(var(--spacing) * 1.5);
    border-radius: var(--radius-md);
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-gray-600);
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    outline: 0;
  }
  .demo-inspect-button svg {
    flex-shrink: 0;
  }
  .demo-inspect-button[aria-pressed='true'] {
    background-color: var(--demo-shell);
    color: var(--color-gray-900);
  }
  .demo-inspect-button:focus-visible {
    outline: 2px solid var(--color-gray-900);
    outline-offset: -1px;
  }

  @media (hover: hover) {
    .demo-inspect-button {
      opacity: 0;
      transition: opacity 150ms ease;
    }
    .demo-root:hover .demo-inspect-button,
    .demo-root:focus-within .demo-inspect-button,
    .demo-inspect-button[aria-pressed='true'] {
      opacity: 1;
    }
    .demo-inspect-button:hover {
      color: var(--color-gray-900);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .demo-inspect-button {
      transition: none;
    }
  }

  .demo-code-card {
    position: relative;
    background-color: var(--color-content);
    border-radius: var(--demo-radius);

    @media (hover: hover) {
      --copy-opacity: 0;

      &:hover,
      &:focus-within {
        --copy-opacity: 1;
      }
    }
  }

  .demo-code-block-root {
    display: flex;
    flex-direction: column;
    position: relative;
    isolation: isolate;
    outline: 0;
  }

  .demo-code-block-root :global {
    .demo-collapse-button {
      position: absolute;
      z-index: 2;
      inset-block-end: calc(var(--spacing) * 3);
      inset-inline-start: 50%;
      transform: translateX(-50%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: calc(var(--spacing) * 7);
      block-size: calc(var(--spacing) * 7);
      border-radius: var(--radius-full);
      background-color: var(--color-content);
      color: var(--color-gray-600);
      box-shadow: var(--elevation-raised);
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      outline: 0;
      transition:
        background-color 150ms ease,
        color 150ms ease,
        box-shadow 150ms ease-out;
    }
    .demo-collapse-button[data-open] {
      position: sticky;
      inset-inline-start: auto;
      transform: none;
      align-self: center;
      margin-block-start: calc(var(--spacing) * -10);
      margin-block-end: calc(var(--spacing) * 3);
    }
    .demo-collapse-button:focus-visible {
      outline: 2px solid var(--color-gray-900);
      outline-offset: calc(var(--spacing) * 0.5);
    }
    .demo-collapse-button[data-open] .demo-collapse-arrow-icon {
      transform: rotate(180deg);
    }

    @media (prefers-reduced-motion: reduce) {
      .demo-collapse-button {
        transition: none;
      }
    }

    @media (hover: hover) {
      .demo-collapse-button:hover {
        background-color: var(--demo-shell);
        color: var(--color-gray-900);
      }
    }
  }

  .demo-code-block {
    --demo-code-block-line-height: var(--text-code--line-height);
    position: relative;
    outline: 0;
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    border-end-start-radius: var(--demo-radius);
    border-end-end-radius: var(--demo-radius);
    line-height: var(--demo-code-block-line-height);
  }
  .demo-code-block[data-closed] {
    overflow-x: hidden;
    max-block-size: var(--demo-min-h);
    mask-image: linear-gradient(to bottom, oklch(0 0 0) 45%, transparent);
  }

  .demo-source-browser {
    font-size: var(--text-code);
    line-height: var(--demo-code-block-line-height);
    display: flex;
  }
  .demo-source-browser :global {
    pre {
      display: flex;
      flex-grow: 1;
      background: none !important;
    }
    code {
      display: block;
      flex-grow: 1;
      padding-block: calc(var(--spacing) * 2);
      font-family: var(--font-mono);
      white-space: normal;
    }
    code .line {
      display: block;
      white-space: pre;
      padding-inline: calc(var(--spacing) * 3);
    }
    code .line:empty {
      block-size: 1lh;
    }
    code:not(:has(.line)) {
      padding-inline: calc(var(--spacing) * 3);
    }
  }
</style>
