"use strict";
/* Get or create the application global variable */
var App = App || {};

(function() {

  // setup the pointer to the scope 'this' variable
  let self = this;
  let drawer, topAppBar;
  let modelSelector, datasetSelector, dRedSelector, classesSelector, visualizeButton;
  let classesCheckboxes = [];
  let customClassesList = [];
  
  App.init = function() {
    drawer = mdc.drawer.MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
    topAppBar = mdc.topAppBar.MDCTopAppBar.attachTo(document.getElementById('app-bar'));
    topAppBar.setScrollTarget(document.getElementById('main-content'));
    topAppBar.listen('MDCTopAppBar:nav', () => {
      drawer.open = !drawer.open;
    });

    modelSelector = new mdc.select.MDCSelect(document.querySelector('#model-selector'));
    datasetSelector = new mdc.select.MDCSelect(document.querySelector('#dataset-selector'));
    dRedSelector = new mdc.select.MDCSelect(document.querySelector('#d-red-selector'));
    
    classesSelector = new mdc.select.MDCSelect(document.querySelector('#classes-selector'));
    for (let i = 1; i <=10; i++) {
      let checkbox = new mdc.checkbox.MDCCheckbox(document.querySelector('#menu-selector-checkbox-' + i));
      classesCheckboxes.push(checkbox);
    }
    classesSelector.listen('MDCSelect:change', () => {
      if (classesSelector.selectedIndex === 0) {
        return;
      }
      customClassesList = [];
      if (classesSelector.selectedIndex > 1) {
        classesSelector.selectedIndex = 0;
        for (let i = 0; i < 10; i++) {
          let checkbox = classesCheckboxes[i];
          if (checkbox.checked) {
            customClassesList.push(i);
          }
        }
      }
    });

    visualizeButton = document.querySelector('#menu-visualize-button');
    visualizeButton.addEventListener('click', (event) => {
      drawer.open = false;
      $('#visualization-section').html('');
    });
  };

  /* Entry point of the application */
  App.start = function() {
      
  };

  App.init();
  App.start();

}) ();


  