"use strict";

const View = function (controllerClass) {

    const self = this;
    const controller = controllerClass;

    let currentData;

    let drawer, topAppBar;
    let modelSelector, datasetSelector, dRedSelector, classesSelector, visualizeButton;
    let classesCheckboxes = [];
    let customClassesList = [];


    let cleanClassesSelector = $('#classes-selector .mdc-list').clone();

    self.initialize = function () {
        drawer = mdc.drawer.MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
        topAppBar = mdc.topAppBar.MDCTopAppBar.attachTo(document.getElementById('app-bar'));
        topAppBar.setScrollTarget(document.getElementById('main-content'));

        topAppBar.listen('MDCTopAppBar:nav', () => {
            drawer.open = !drawer.open;
        });

        modelSelector = new mdc.select.MDCSelect(document.querySelector('#model-selector'));
        datasetSelector = new mdc.select.MDCSelect(document.querySelector('#dataset-selector'));
        dRedSelector = new mdc.select.MDCSelect(document.querySelector('#d-red-selector'));

        visualizeButton = document.querySelector('#menu-visualize-button');
        visualizeButton.addEventListener('click', (event) => {
            drawer.open = false;
            controller.visualizaButtonClicked(customClassesList);
            $(visualizeButton).find('.mdc-button__label').text('REFRESH');
        });
    }

    self.updateClassFilters = function (classNameList) {
        let checkboxTemplate = $('.select-checkbox.template');
        let classFilterSelector = cleanClassesSelector.clone();

        for (let i = 0; i < classNameList.length; i++) {
            let checkboxClone = checkboxTemplate.clone();
            checkboxClone.removeClass('template');
            checkboxClone.find('.mdc-list-item__text').html(classNameList[i]);
            classFilterSelector.append(checkboxClone);
            classesCheckboxes.push(new mdc.checkbox.MDCCheckbox(checkboxClone.find('.mdc-checkbox')[0]));
        }

        let checkboxSelectorList = $('#classes-selector .mdc-list');
        checkboxSelectorList.empty();
        checkboxSelectorList.append(classFilterSelector.children());

        classesSelector = new mdc.select.MDCSelect(document.querySelector('#classes-selector'));

        classesSelector.listen('MDCSelect:change', () => {
            self.classFilterEventListener(this)
        });
    }

    self.findClassById = function (classID) {
        let allClasses = $('.vis-class-container');

        for (let i = 0; i < allClasses.length; i++) {
            let currentClass = $(allClasses[i]);
            if (currentClass.hasClass('class-id-' + classID)) {
                console.log(allClasses[i])
                return currentClass;
            }
        }
        return undefined;
    }

    self.expendClassToggle = function (classID) {
        let clikedClass = self.findClassById(classID);
        if (clikedClass === undefined) {
            return;
        }
        let isClassExpanded = (clikedClass.data('class-expanded') === 'true')
        if (isClassExpanded) {
            clikedClass.animate({
                height: '102px',
            });
            clikedClass.data('class-expanded', 'false')
        } else {
            clikedClass.animate({
                height: '220px',
            });
            clikedClass.data('class-expanded', 'true')
        }
    }

    self.processLayerClickEvent = function (event) {
        let layer = $(event.target);
        let blockDataAttr = layer.data('layer-id').split("-");
        let classID = blockDataAttr[0];
        let blockID = blockDataAttr[1];
        let layerID = blockDataAttr[2];

    }

    self.processBlockClickEvent = function (event) {
        // <div class="vis-class-layer-container">
        // <div class="vis-class-info-spacer"></div>
        // <div class="vis-class-layer">
        //     Layer# 1
        // </div>
        // <div class="vis-class-layer">
        //     Layer# 2
        // </div>
        // <div class="vis-class-layer">
        //     Layer# 3
        // </div>
        // <div class="vis-class-layer">
        //     Layer# 4
        // </div>
        //</div> 
        let blockElement = $(event.target);
        let blockDataAttr = blockElement.data('block-id').split("-");
        let classID = blockDataAttr[0];
        let blockID = blockDataAttr[1];
        let classContainer = blockElement.parents('.vis-class-container');
        let layersContainer = classContainer.find('.vis-class-layer-container');

        if (layersContainer.length) {
            layersContainer.empty();
        } else {
            layersContainer = self.createClassLayerContainerElement();
            classContainer.append(layersContainer);
        }

        layersContainer.append('<div class="vis-class-info-spacer"></div>');

        let blockLayersList = currentData[classID].blocks[blockID].layers;
        for (let i = 0; i < blockLayersList.length; i++) {
            let blockLayer = self.createLayerElement();
            blockLayer.attr('data-layer-id', classID + '-' + blockID + '-' + i);
            layersContainer.append(blockLayer);
        }

        self.expendClassToggle(classID);
    }

    self.createClassContainerElement = function () {
        let classContainer = $(document.createElement('div'));
        classContainer.addClass('vis-class-container');
        classContainer.attr('data-class-expanded', 'false');
        return classContainer;
    }

    self.createClassBlockContainerElement = function () {
        let classContainer = $(document.createElement('div'));
        classContainer.addClass('vis-class-block-container');
        return classContainer;
    }

    self.createClassLayerContainerElement = function () {
        let classContainer = $(document.createElement('div'));
        classContainer.addClass('vis-class-layer-container');
        return classContainer;
    }

    self.createClassInfoElement = function () {
        let classContainer = $(document.createElement('div'));
        classContainer.addClass('vis-class-info');
        return classContainer;
    }

    self.createBlockElement = function () {
        let classContainer = $(document.createElement('div'));
        classContainer.addClass('vis-class-block');
        classContainer.attr('data-block-id', 'none');
        return classContainer;
    }

    self.createLayerElement = function () {
        let classContainer = $(document.createElement('div'));
        classContainer.addClass('vis-class-layer');
        classContainer.attr('data-layer-id', 'none');
        return classContainer;
    }

    self.buildVisualization = function (visualizationData) {
        let mainVisContainer = $('.vis-main-container');
        mainVisContainer.empty();

        for (let i = 0; i < visualizationData.length; i++) {
            let classData = visualizationData[i];
            let classContainer = self.createClassContainerElement();
            classContainer.addClass('class-id-' + i);
            let classBlockContainer = self.createClassBlockContainerElement();
            let classInfoElement = self.createClassInfoElement();

            classInfoElement.text(classData.meta.name);
            classBlockContainer.append(classInfoElement);

            for (let j = 0; j < classData.blocks.length; j++) {
                let blockElement = self.createBlockElement();
                blockElement.attr('data-block-id', i + '-' + j);
                blockElement.text(classData.blocks[j].meta.name);
                blockElement.on('click', (event) => self.processBlockClickEvent(event));
                classBlockContainer.append(blockElement);
            }

            classContainer.append(classBlockContainer);
            mainVisContainer.append(classContainer);

            if (i !== (visualizationData.length - 1)) {
                mainVisContainer.append('<div class="vis-class-spacer"></div>')
            }

        }

        //console.log(visualizationData);
    };

    self.classFilterEventListener = function (element) {
        if (classesSelector.selectedIndex === 0) {
            return;
        }
        customClassesList = [];
        if (classesSelector.selectedIndex > 1) {
            classesSelector.selectedIndex = 0;
            for (let i = 0; i < classesCheckboxes.length; i++) {
                let checkbox = classesCheckboxes[i];
                if (checkbox.checked) {
                    customClassesList.push(i);
                }
            }
        }
    }

    self.public = {

        initialize: function () {
            self.initialize();
        },

        updateClassFilters: function (classNameList) {
            self.updateClassFilters(classNameList);
        },

        visualizeData: function (visualizationData) {
            currentData = visualizationData;
            self.buildVisualization(visualizationData);
        }

    }

    return self.public;
};

export { View };