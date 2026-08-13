import { resolve } from '$app/paths'

export const docs = {
  component: [
    {
      slug: 'accordion',
      title: 'Accordion',
      description: 'Collapsible stacked sections.'
    },
    {
      slug: 'alert-dialog',
      title: 'Alert Dialog',
      description: 'A dialog requiring a response.'
    },
    {
      slug: 'autocomplete',
      title: 'Autocomplete',
      description: 'An input with type-ahead suggestions.'
    },
    { slug: 'avatar', title: 'Avatar', description: 'A user image with a fallback.' },
    {
      slug: 'button',
      title: 'Button',
      description: 'An action trigger.'
    },
    {
      slug: 'checkbox',
      title: 'Checkbox',
      description: 'A tri-state checkable control.'
    },
    {
      slug: 'checkbox-group',
      title: 'Checkbox Group',
      description: 'Checkboxes sharing one value.'
    },
    {
      slug: 'collapsible',
      title: 'Collapsible',
      description: 'An expand-and-collapse panel.'
    },
    {
      slug: 'combobox',
      title: 'Combobox',
      description: 'An input with a filterable list.'
    },
    {
      slug: 'context-menu',
      title: 'Context Menu',
      description: 'A right-click menu.'
    },
    {
      slug: 'dialog',
      title: 'Dialog',
      description: 'A focus-trapping overlay.'
    },
    {
      slug: 'drawer',
      title: 'Drawer',
      description: 'A panel from a screen edge.'
    },
    {
      slug: 'field',
      title: 'Field',
      description: 'A control with label and error.'
    },
    {
      slug: 'fieldset',
      title: 'Fieldset',
      description: 'Related fields under one legend.'
    },
    {
      slug: 'form',
      title: 'Form',
      description: 'Field validation and submission.'
    },
    {
      slug: 'input',
      title: 'Input',
      description: 'A text entry field.'
    },
    {
      slug: 'menu',
      title: 'Menu',
      description: 'A menu of actions.'
    },
    {
      slug: 'menubar',
      title: 'Menubar',
      description: 'A row of application menus.'
    },
    {
      slug: 'meter',
      title: 'Meter',
      description: 'A gauge within a known range.'
    },
    {
      slug: 'navigation-menu',
      title: 'Navigation Menu',
      description: 'A navigation menu with floating panels.'
    },
    { slug: 'popover', title: 'Popover', description: 'A floating anchored panel.' },
    {
      slug: 'preview-card',
      title: 'Preview Card',
      description: 'A link preview opened on hover.'
    },
    {
      slug: 'progress',
      title: 'Progress',
      description: 'A bar showing task progress.'
    },
    {
      slug: 'radio',
      title: 'Radio',
      description: 'One choice from a set of options.'
    },
    {
      slug: 'scroll-area',
      title: 'Scroll Area',
      description: 'A styleable scroll region.'
    },
    {
      slug: 'select',
      title: 'Select',
      description: 'A single-select listbox.'
    },
    {
      slug: 'separator',
      title: 'Separator',
      description: 'A semantic dividing line.'
    },
    {
      slug: 'slider',
      title: 'Slider',
      description: 'A value picked along a range.'
    },
    {
      slug: 'switch',
      title: 'Switch',
      description: 'An on/off form control.'
    },
    {
      slug: 'tabs',
      title: 'Tabs',
      description: 'Switchable content panels.'
    },
    { slug: 'toast', title: 'Toast', description: 'A self-dismissing message.' },
    {
      slug: 'toggle',
      title: 'Toggle',
      description: 'A pressable on/off button.'
    },
    {
      slug: 'toggle-group',
      title: 'Toggle Group',
      description: 'Toggle buttons sharing a selection.'
    },
    {
      slug: 'toolbar',
      title: 'Toolbar',
      description: 'A row of grouped controls.'
    },
    {
      slug: 'tooltip',
      title: 'Tooltip',
      description: 'A hover or focus hint.'
    }
  ],
  overview: [
    {
      slug: 'quick-start',
      title: 'Quick start',
      description: 'Install ShardsUI, set up portals, and compose a first component.'
    },
    {
      slug: 'accessibility',
      title: 'Accessibility',
      description: 'What components handle, and what you still own.'
    }
  ],
  guides: [
    {
      slug: 'styling',
      title: 'Styling',
      description: 'Style parts with CSS or Tailwind.'
    },
    {
      slug: 'props-and-attributes',
      title: 'Props & attributes',
      description: 'Shared props and data attributes.'
    },
    {
      slug: 'animation',
      title: 'Animation',
      description: 'Transitions, keyframes, or JS animation libraries.'
    },
    {
      slug: 'composition',
      title: 'Composition',
      description: 'Snippets, the as prop, and detached handles.'
    },
    {
      slug: 'state',
      title: 'State',
      description: 'Controlled state, direction, disabled, and read-only.'
    },
    {
      slug: 'forms',
      title: 'Forms',
      description: 'Validation, Field, and submission.'
    },
    {
      slug: 'typescript',
      title: 'TypeScript',
      description: 'Inferring props, refs, and value types.'
    }
  ],
  util: [
    {
      slug: 'direction-provider',
      title: 'Direction Provider',
      description: 'Sets LTR or RTL direction.'
    }
  ]
} as const

export type ComponentDoc = (typeof docs.component)[number]

const toNavLinks = (items: readonly { title: string; slug: string }[]) =>
  items.map((c) => ({
    title: c.title,
    href: resolve('/(docs)/svelte/[slug]', { slug: c.slug })
  }))

export const links = [
  { heading: 'overview', links: toNavLinks(docs.overview) },
  { heading: 'guides', links: toNavLinks(docs.guides) },
  { heading: 'components', links: toNavLinks(docs.component) },
  { heading: 'utils', links: toNavLinks(docs.util) }
]
