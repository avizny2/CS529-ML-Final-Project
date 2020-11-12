const drawer = mdc.drawer.MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));

const topAppBar = mdc.topAppBar.MDCTopAppBar.attachTo(document.getElementById('app-bar'));
topAppBar.setScrollTarget(document.getElementById('main-content'));
topAppBar.listen('MDCTopAppBar:nav', () => {
  drawer.open = !drawer.open;
});

const modelSelector = new mdc.select.MDCSelect(document.querySelector('#model-selector'));
const datasetSelector = new mdc.select.MDCSelect(document.querySelector('#dataset-selector'));
const dRedSelector = new mdc.select.MDCSelect(document.querySelector('#d-red-selector'));
const classesSelector = new mdc.select.MDCSelect(document.querySelector('#classes-selector'));
const classesCheckboxes = [];
for (let i = 1; i <=10; i++) {
  let checkbox = new mdc.checkbox.MDCCheckbox(document.querySelector('#menu-selector-checkbox-' + i));
  classesCheckboxes.push(checkbox);
}

let customClassesList = [];
classesSelector.listen('MDCSelect:change', () => {
    if (classesSelector.selectedIndex === 0) {
      return;
    }
    customClassesList = [];
    console.log("val: " + classesSelector.selectedIndex);
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



const visualizeButton = document.querySelector('#menu-button');
visualizeButton.addEventListener('click', (event) => {
  drawer.open = false;
});
  