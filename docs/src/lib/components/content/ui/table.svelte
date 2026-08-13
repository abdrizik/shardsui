<script lang="ts">
  import { MarkdownNode, type Node } from '@comark/svelte'
  import { Collapsible } from '@shardsui/svelte/collapsible'
  import type { Snippet } from 'svelte'

  type Row = { summary: Node[][]; detail: { label: string; nodes: Node[] }[] }

  type Props = {
    children?: Snippet
    class?: string
    columns?: string[]
    rows?: Row[]
  }

  let { children, class: classProp, columns, rows }: Props = $props()
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="table-scroll thin-scrollbar" role="region" aria-label="Scrollable table" tabindex="0">
  <table class="{classProp} reference-table">
    {#if rows && columns}
      <thead>
        <tr>
          {#each columns as column (column)}<th scope="col">{column}</th>{/each}
          <th scope="col" aria-hidden="true"></th>
        </tr>
      </thead>
      {#each rows as row (row)}
        <Collapsible.Root as="tbody" class="reference-group">
          <Collapsible.Trigger as="tr" class="reference-summary">
            {#each row.summary as cell, i (i)}
              <td
                >{#each cell as node, k (k)}<MarkdownNode {node} />{/each}</td
              >
            {/each}
            <td class="reference-chevron-cell"></td>
          </Collapsible.Trigger>
          <tr class="reference-detail">
            <td colspan={columns.length + 1}>
              <Collapsible.Panel class="reference-panel">
                <div class="reference-panel-inner">
                  {#each row.detail as item (item.label)}
                    <div class="reference-item">
                      <span class="reference-term">{item.label}:</span>
                      {#each item.nodes as node, k (k)}<MarkdownNode {node} />{/each}
                    </div>
                  {/each}
                </div>
              </Collapsible.Panel>
            </td>
          </tr>
        </Collapsible.Root>
      {/each}
    {:else if children}
      {@render children()}
    {/if}
  </table>
</div>

<style>
  /* Reference rows render through `Collapsible` child components, so the styles are
     global; nested under `.reference-group` to stay scoped to a row group and to
     beat the specificity of the shared `td` rules in prose.css. */
  .table-scroll :global {
    .reference-group {
      /* Safari ignores max-inline-size on cells in auto table layout; there the
         row falls back to the horizontal scroll of .table-scroll. */
      .reference-summary td {
        max-inline-size: var(--table-cell-max, 40ch);
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .reference-chevron-cell {
        inline-size: calc(var(--spacing) * 10);
        /* The 0.4rem square rotated 45deg is 0.57rem wide, so its tip would
           overflow the last cell's zeroed padding and get clipped by the
           scroll container. */
        padding-inline-end: calc(var(--spacing) * 0.5);
        text-align: end;
      }

      .reference-chevron-cell::after {
        content: '';
        display: inline-block;
        inline-size: calc(var(--spacing) * 1.6);
        block-size: calc(var(--spacing) * 1.6);
        border-inline-end: 1.5px solid var(--color-gray-500);
        border-block-end: 1.5px solid var(--color-gray-500);
        transform: translateY(calc(var(--spacing) * -0.6)) rotate(45deg);
        transition: transform 150ms ease;
      }

      .reference-summary[data-panel-open] .reference-chevron-cell::after {
        transform: translateY(calc(var(--spacing) * 0.2)) rotate(225deg);
      }

      tr.reference-detail td {
        padding: 0;
      }

      .reference-panel {
        height: var(--collapsible-panel-height);
        overflow: hidden;
        transition: height 200ms ease;
      }

      .reference-panel[data-starting-style],
      .reference-panel[data-ending-style] {
        height: 0;
      }

      .reference-panel[hidden]:not([hidden='until-found']) {
        display: none;
      }

      .reference-panel-inner {
        max-inline-size: 68ch;
        padding: calc(var(--spacing) * 3) calc(var(--spacing) * 4) calc(var(--spacing) * 3.5) 0;
        white-space: normal;
        text-wrap: pretty;
      }

      .reference-item + .reference-item {
        margin-block-start: calc(var(--spacing) * 2);
      }

      .reference-term {
        margin-inline-end: calc(var(--spacing) * 1.5);
        font-weight: 500;
        color: var(--color-foreground);
      }

      @media (prefers-reduced-motion: reduce) {
        .reference-panel,
        .reference-chevron-cell::after {
          transition: none;
        }
      }
    }
  }
</style>
