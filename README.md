## Abstract
When building a CMS, one of the most common tasks is building UI for CRUD operations.
NCInputLibrary aims to solve this by providing easy-to-use CRUD interface.

## Details
NCInputLibrary allows building a CRUD interface using:
* HTML inputs (textbox, textarea, select)
* Buttons
* DataTable (https://datatables.net)

The interface is configured through writing simple JSON header, such as:
```javascript
  const studentEditorHeader = {
    design: {
      title: 'Student Editor',
      panelColor: 'green'
    },
    table: {
      ui: [
        {id: 'id', desc: 'ID', dataTable: true, input: 'text', disabled: true},
        {id: 'lastModified', desc: 'Last Modified', dataTable: true, type: 'date'},
        {id: 'firstName', desc: 'First Name', dataTable: true, input: 'text', disabled: false},
        {id: 'lastName', desc: 'Last Name', dataTable: true, input: 'text', disabled: false},
        {id: 'grade', desc: 'Grade', dataTable: true, input: 'select', disabled: false, selectData: getStudentGrades},
        {id: 'address', desc: 'Address', dataTable: true, input: 'text', disabled: false},
        {id: 'notes', desc: 'Notes', dataTable: true, input: 'textArea'}
      ],
      conf: {
        orderType: 'desc', // If not defined orderType, default is desc
        orderBy: 'lastModified',
        getURL: getDataURL,
        onRowClicked: onRowClicked
      }
    },
    buttons: {
      ui: [
        {id: 'add', desc: 'Add', postTo: addStudentURL},
        {id: 'edit', desc: 'Edit', postTo: editStudentURL},
        {id: 'delete', desc: 'Delete', postTo: deleteStudentURL}
      ]
    }
  }

```


## Architecture
The library is written using Model-View-Presenter (MVP) architecture, where:
* Model: consists only of data-related operations (e.g. talking to backend)
* View: consist only of UI-related code (e.g. no application logic)
* Presenter: glues model and view together by telling view what to do.

In the backend field, this architecture is analogous to MVC pattern. I'd like to think of MVP as MVC adapted for frontend development.

The core idea behind this architecture is to have the view only exposes view-related functionalities, such as: "start progress bar", "finish progress bar", "disable all buttons", "enable all buttons". The model, on the other hand, only expose data-related operations like "do a GET request", "do a POST request". The presenter is the one that connects the model and view together by telling them what to do.

To learn more about this architecture, read this awesome blog by Martin Fowler:
https://martinfowler.com/eaaDev/uiArchs.html#Model-view-presentermvp

## Code Structure:
1. Entry point is main.js
2. Transpilation (using browserify) is done through watch.js
3. dist/bundle.js is the final result included by the browser

## Commands
1. npm start: start a watcher that compile the library if there's any change in the dependencies


## Example
See documentation/basic.html
