import type { ElementNode, MarkdownDocument } from 'comark'
import { textContent, visit } from 'comark/utils'

const byTag = (node: ElementNode | undefined, ...tags: string[]): ElementNode[] =>
  node
    ? node
        .slice(2)
        .filter(
          (n): n is ElementNode =>
            Array.isArray(n) && typeof n[0] === 'string' && tags.includes(n[0])
        )
    : []

const first = (node: ElementNode | undefined, tag: string) => byTag(node, tag)[0]

/**
 * A table marked with `::table{columns="Prop,Type,Default"}` keeps the listed
 * columns visible in the summary row; clicking a row expands a panel with every
 * column (Prop, Type, Default, Description, …), not just the collapsed ones.
 */
export function transformReferenceTables(tree: MarkdownDocument): MarkdownDocument {
  visit(
    tree,
    (node) => Array.isArray(node) && node[0] === 'table' && typeof node[1].columns === 'string',
    (node) => {
      if (!Array.isArray(node) || typeof node[0] !== 'string') return
      const columns = node[1].columns
      if (typeof columns !== 'string') return

      const headerRow = first(first(node, 'thead'), 'tr')
      if (!headerRow) return

      const labels = byTag(headerRow, 'th', 'td').map((c) => textContent(c))
      const shown = columns.split(',').map((c) => c.trim())
      const summary = labels.map((_, i) => i).filter((i) => shown.includes(labels[i]))

      const rows = byTag(first(node, 'tbody'), 'tr').map((row) => {
        const cells = byTag(row, 'td', 'th')
        return {
          summary: summary.map((i) => cells[i]?.slice(2) ?? []),
          detail: labels.map((label, i) => ({ label, nodes: cells[i]?.slice(2) ?? [] }))
        }
      })

      return ['table', { columns: summary.map((i) => labels[i]), rows }]
    }
  )

  return tree
}
