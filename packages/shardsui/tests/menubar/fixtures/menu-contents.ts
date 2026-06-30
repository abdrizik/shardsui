export type RadioItem = {
  type: 'radioItem'
  label: string
  value: string
  testId?: string
  disabled?: boolean
}

export type ContentItem =
  | {
      type: 'item'
      label: string
      testId?: string
      disabled?: boolean
      closeOnClick?: boolean
      onclick?: () => void
    }
  | {
      type: 'submenu'
      label: string
      testId?: string
      disabled?: boolean
      menuTestId?: string
      items: ContentItem[]
    }
  | {
      type: 'radioGroup'
      value?: string
      items: RadioItem[]
    }
  | RadioItem

export type MenuDefinition = {
  label: string
  triggerTestId?: string
  menuTestId?: string
  items: ContentItem[]
}

export const menuContents: Record<string, MenuDefinition> = {
  file: {
    label: 'File',
    triggerTestId: 'file-trigger',
    menuTestId: 'file-menu',
    items: [
      { type: 'item', label: 'Open', testId: 'file-item-1' },
      { type: 'item', label: 'Save', testId: 'file-item-2' },
      {
        type: 'submenu',
        label: 'Share',
        testId: 'share-trigger',
        menuTestId: 'share-menu',
        items: [
          { type: 'item', label: 'Email', testId: 'share-item-1' },
          { type: 'item', label: 'Print', testId: 'share-item-2' }
        ]
      }
    ]
  },
  edit: {
    label: 'Edit',
    triggerTestId: 'edit-trigger',
    menuTestId: 'edit-menu',
    items: [
      { type: 'item', label: 'Copy', testId: 'edit-item-1' },
      { type: 'item', label: 'Paste', testId: 'edit-item-2' }
    ]
  },
  view: {
    label: 'View',
    triggerTestId: 'view-trigger',
    menuTestId: 'view-menu',
    items: [
      { type: 'item', label: 'Zoom In', testId: 'view-item-1' },
      { type: 'item', label: 'Zoom Out', testId: 'view-item-2' },
      {
        type: 'submenu',
        label: 'Layout',
        testId: 'layout-trigger',
        menuTestId: 'layout-menu',
        items: [
          {
            type: 'radioGroup',
            value: 'single',
            items: [
              {
                type: 'radioItem',
                value: 'single',
                label: 'Single column',
                testId: 'layout-item-1'
              },
              { type: 'radioItem', value: 'two', label: 'Two columns', testId: 'layout-item-2' }
            ]
          }
        ]
      }
    ]
  }
}
