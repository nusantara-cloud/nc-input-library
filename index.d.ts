// Type definitions for NC-Input-Library 1.2
// Project: https://github.com/nusantara-cloud/nc-input-library
// Definitions by: Denny Harijanto <https://github.com/nusantara-cloud>
// TypeScript Version: 2.9

/// <reference types="jquery" />

declare namespace NCInputLibrary {
  type InputType = 'text' | 'date' | 'password' | 'textArea' | 'select' | 'hidden'

  interface InputOptionalData {
    format?: (colText: string) => string
    dateFormat?: string
  }

  type SelectArrayDataCb = () => Array<string>
  type SelectArrayObjectDataCb = () => {searchVar: string, url: string}
  type SelectPromisedDataCb = () => Promise<Array<string>>

  type GetURLCallback = () => string
  type RowClickedCallback = (data: Object) => void
  type TableDrawnCallback = (data: Array<Object>) => void

  interface InputEntry {
    id: string // POST / GET id
    desc: string
    dataTable: boolean // Whether data table column of this input should be rendered
    input: InputType // What kind of input
    type?: 'date'
    disabled?: boolean // Whether the input should be greyed out
    data?: InputOptionalData
    selectData?: SelectArrayDataCb | SelectArrayObjectDataCb | SelectPromisedDataCb
  }

  interface ButtonEntry {
    id: string // POST / GET id
    desc: string
    postTo: GetURLCallback | string
    confirm?: string // If specified, when clicked, a confirmation prompt with this message is shown.
  }

  // Response: server response or error information
  type postFinishedCallback = (id, successOrFailed, response) => void

  interface TableConf {
    order: Array<[string, 'desc' | 'asc']>
    getURL: string | GetURLCallback
    onRowClicked?: RowClickedCallback
    onTableDrawn?: TableDrawnCallback
    numColumn?: 2 | 3
  }

  interface NCInputConfig {
    design: {
      title: string
    },
    table: {
      ui: Array<InputEntry>,
      conf: TableConf
    },
    buttons: {
      ui: Array<ButtonEntry>
      onPostFinished?: postFinishedCallback
      conf: {
        networkTimeout?: number
      }
    }
  }

  interface NCInput {
    reloadTable (clearNotif?: boolean): void
    clearNotif (): void
    setFirstCustomView(jqueryElement: JQuery.htmlString | JQuery.TypeOrArray<JQuery.Node | JQuery<JQuery.Node>>): void
    setSecondCustomView(jqueryElement: JQuery.htmlString | JQuery.TypeOrArray<JQuery.Node | JQuery<JQuery.Node>>): void
    // Given element nested inside a row, returns the row value
    getRow((jqueryElement: JQuery.htmlString | JQuery.TypeOrArray<JQuery.Node | JQuery<JQuery.Node>>): Object
  }
}

interface JQuery {
  NCInputLibrary: (config: NCInputLibrary.NCInputConfig) => NCInputLibrary.NCInput
}
