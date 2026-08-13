<script lang="ts">
  import { page } from '$app/state'
  import { links } from '$lib/data/docs'
  import { ScrollArea } from '@shardsui/svelte/scroll-area'

  let activeY = $state<number | null>(null)

  function trackActive(node: HTMLElement) {
    function measure() {
      activeY = node.offsetTop + node.offsetHeight / 2
    }

    measure()

    const container = node.offsetParent ?? node.parentElement
    if (!container) return

    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }
</script>

<nav class="side-nav-root" aria-label="Main navigation">
  <ScrollArea.Root>
    <ScrollArea.Viewport data-side-nav-viewport class="side-nav-viewport">
      <div class="side-nav-content">
        {#if activeY !== null}
          <span class="side-nav-indicator" style:--indicator-y="{activeY}px" aria-hidden="true"
          ></span>
        {/if}
        {#each links as section (section.heading)}
          <div class="side-nav-section">
            <div class="side-nav-heading">{section.heading}</div>
            <ul class="side-nav-list">
              {#each section.links as link (link.href)}
                {@const isActive = page.url.pathname === link.href}
                <li class="side-nav-item">
                  <a
                    href={link.href}
                    class="side-nav-link"
                    data-active={isActive ? '' : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    {@attach isActive ? trackActive : undefined}
                  >
                    {link.title}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar class="side-nav-scrollbar" orientation="vertical">
      <ScrollArea.Thumb class="side-nav-scrollbar-thumb" />
    </ScrollArea.Scrollbar>
  </ScrollArea.Root>
</nav>

<style>
  .side-nav-root {
    --side-nav-item-height: calc(var(--spacing) * 7);
    --side-nav-item-line-height: calc(var(--spacing) * 5.5);
    --side-nav-item-padding-y: calc(
      var(--side-nav-item-height) / 2 - var(--side-nav-item-line-height) / 2
    );
    --side-nav-link-padding-x: calc(var(--spacing) * 5);
    --side-nav-dot-size: calc(var(--spacing) * 2);
    --side-nav-dot-gap: calc(var(--spacing) * 2);
    --side-nav-scrollbar-thumb-width: calc(var(--spacing) * 1);
    --side-nav-scrollbar-width: calc(var(--spacing) * 6);
    --side-nav-scrollbar-gap-left: calc(var(--spacing) * 4);
    --side-nav-scrollbar-gap-right: calc(var(--spacing) * 10);

    font-size: var(--text-sm);
    line-height: calc(var(--spacing) * 5.5);
  }

  @media (width < 64rem) {
    .side-nav-root {
      display: none;
    }
  }

  @media (width >= 64rem) {
    .side-nav-root {
      position: sticky;
      inset-block-start: calc(var(--spacing) * 6);
      align-self: start;
      margin-inline-start: calc(-1 * var(--side-nav-link-padding-x));
    }

    .side-nav-root :global {
      .side-nav-viewport {
        max-block-size: calc(100dvh - calc(var(--spacing) * 12));
        padding-block: 0 calc(var(--spacing) * 10);
        padding-inline-start: var(--side-nav-link-padding-x);
        padding-inline-end: calc(
          var(--side-nav-scrollbar-gap-left) + var(--side-nav-scrollbar-width) / 2 +
            var(--side-nav-scrollbar-thumb-width) / 2
        );
        outline: 0;
      }

      .side-nav-scrollbar {
        display: flex;
        padding-block: calc(var(--spacing) * 6) calc(var(--spacing) * 18);
        inline-size: var(--side-nav-scrollbar-width);
        opacity: 0;
        transition: opacity 200ms 500ms;
      }

      .side-nav-scrollbar:active,
      .side-nav-scrollbar[data-scrolling] {
        transition-duration: 0ms;
        transition-delay: 0ms;
        opacity: 1;
      }

      .side-nav-scrollbar-thumb {
        display: flex;
        justify-content: center;
        inline-size: 100%;
      }

      .side-nav-scrollbar-thumb::before {
        content: '';
        display: block;
        block-size: 100%;
        inline-size: var(--side-nav-scrollbar-thumb-width);
        border-radius: var(--radius-sm);
        background-color: var(--color-gray-600);
      }
    }
  }

  .side-nav-content {
    position: relative;
  }

  /* Active indicator, centered in the left gutter — slides to the active link.
     It mounts already at position (transitions never fire on first render),
     so only later moves animate; @starting-style handles the initial fade-in. */
  .side-nav-indicator {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: calc(-1 * var(--side-nav-dot-gap) - var(--side-nav-dot-size));
    inline-size: var(--side-nav-dot-size);
    block-size: var(--side-nav-dot-size);
    border-radius: var(--radius-full);
    background-color: var(--color-foreground);
    opacity: 1;
    transform: translateY(calc(var(--indicator-y) - 50%));
    transition:
      transform 250ms var(--ease-in-out),
      opacity 200ms ease;
    pointer-events: none;

    @starting-style {
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .side-nav-indicator {
      transition: none;
    }
  }

  .side-nav-section:not(:last-child) {
    margin-block-end: calc(var(--spacing) * 4);
  }

  .side-nav-heading {
    display: inline-flex;
    padding-block: var(--side-nav-item-padding-y);
    font-weight: var(--font-weight-normal);
    color: var(--color-gray-500);
  }

  .side-nav-item {
    display: flex;
  }

  .side-nav-link {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing) * 1);
    flex-grow: 1;
    padding-block: calc(var(--side-nav-item-padding-y) - 1px);
    padding-inline: var(--side-nav-link-padding-x);
    margin-inline-start: calc(-1 * var(--side-nav-link-padding-x));
    border-block: 1px solid transparent;
    background-clip: padding-box;
    border-radius: var(--radius-md);
    color: var(--color-gray-700);
    user-select: none;
    transition: color 150ms var(--ease-out);
  }

  .side-nav-link:hover {
    color: var(--color-foreground);
  }

  .side-nav-link[data-active] {
    border: none;
    padding-block: var(--side-nav-item-padding-y);
    font-weight: var(--font-weight-medium);
    color: var(--color-foreground);
    word-spacing: -0.005em;
  }

  .side-nav-link:focus-visible {
    z-index: 1;
    outline: 2px solid var(--color-gray-900);
    outline-offset: -1px;
  }
</style>
