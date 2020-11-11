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

modelSelector.listen('MDCSelect:change', () => {
  alert(`Selected option at index ${modelSelector.selectedIndex} with value "${modelSelector.value}"`);
});

datasetSelector.listen('MDCSelect:change', () => {
    alert(`Selected option at index ${datasetSelector.selectedIndex} with value "${datasetSelector.value}"`);
});

dRedSelector.listen('MDCSelect:change', () => {
    alert(`Selected option at index ${dRedSelector.selectedIndex} with value "${dRedSelector.value}"`);
});

classesSelector.listen('MDCSelect:change', () => {
    alert(`Selected option at index ${dRedSelector.selectedIndex} with value "${dRedSelector.value}"`);
});
  
const visualizeButton = document.querySelector('#menu-button');
visualizeButton.addEventListener('click', (event) => {
  drawer.open = false;
});
  