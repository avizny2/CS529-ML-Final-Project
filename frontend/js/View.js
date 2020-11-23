"use strict";

const View = function (controllerClass) {

    const self = this;
    const controller = controllerClass;

    let currentData;
    let classVisualizationState = [];
    let VisualizationState = function() {
        return {
            'classID': -1,
            'classData': {
                'minMaxX': [],
                'minMaxY': []
            },
            'isExpended': false,
            'selectedBlockID': -1,
            'selectedGUID': ''
        }
    };

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
        let searchedClass = $('.vis-class-container.class-id-' + classID);
        if (searchedClass.length) {
            return searchedClass[0]
        } else {
            return undefined;
        }
    }

    self.findBlockByID = function (classID, blockID) {
        let searchedClass = $('.vis-class-block.block-id-' + classID + '-' + blockID);
        if (searchedClass.length) {
            return searchedClass[0]
        } else {
            return undefined;
        }
    }

    self.calculateClassMinMax = function (blockData, axis) {
        let min = 9999999999;
        let max = -999999999;
        
        for (let i = 0; i < blockData.length; i++) {
            let currentBlock = blockData[i].layers;
           
            for (let j = 0; j < currentBlock.length; j++) {
                let currentLayer = currentBlock[j];
                
                for (let k = 0; k < currentLayer.length; k++) {
                    let currentPoint = currentLayer[k];
                    
                    if (axis === 'x') {
                        if (min > currentPoint.x) {
                            min = currentPoint.x;
                        }
                        if (max < currentPoint.x) {
                            max = min = currentPoint.x;
                        }
                    } else {
                        if (min > currentPoint.y) {
                            min = currentPoint.y;
                        }
                        if (max < currentPoint.y) {
                            max = min = currentPoint.y;
                        }
                    }
                    
                }
            }
        }
        return [min, max];
    }

    self.filterPoints = function (classID, guid) {
        if (guid.length === 0) {
            return;
        }
        let prevGUID = classVisualizationState[classID].selectedGUID;
        classVisualizationState[classID].selectedGUID = guid;
        $('.vis-class-container.class-id-' + classID).find('.vis-class-layer').each((k1, v1) => {
            let selectedPoint;
            $(v1).find('g > circle').each((k2, v2) => {
                let point = $(v2);
                
                if (prevGUID === guid) {
                    point.attr('style','fill: ' + currentData[classID].meta.color);
                } else {
                    if (point.attr('id') !== guid) {
                        point.attr('style','fill: #A8A8A8');
                    } else {
                        selectedPoint = point.attr('style','fill: ' + currentData[classID].meta.color);   
                    }
                }
            });

            if (selectedPoint !== undefined) {
                selectedPoint.detach().appendTo($(v1).find('g'));
            }
            if (prevGUID === guid) {
                classVisualizationState[classID].selectedGUID = 'none'
            }
        });
    };

    self.plotLayer = function (element, classID, blockID, layerID) {
        let layerData = currentData[classID].blocks[blockID].layers[layerID];
        let selectedElementJQ = $(element);
        let selectedElementD3 = d3.select(element);
        let visualizationState = classVisualizationState[classID];
        let pointradius = 4;

        let xScaler = d3.scaleLinear()
            .domain(visualizationState.classData.minMaxX)
            .range([0, selectedElementJQ.width() - pointradius * 2]);

        var yScaler = d3.scaleLinear()
            .domain(visualizationState.classData.minMaxY)
            .range([selectedElementJQ.height() - pointradius * 2 , 0]);

        let svg = selectedElementD3
            .append("svg")
              .attr("width", selectedElementJQ.width())
              .attr("height", selectedElementJQ.height())

        svg.append('g')
            .selectAll("dot")
            .data(layerData)
            .enter()
            .append("circle")
              .attr('id', (d) => d.guid)
              .attr("cx", (d) => xScaler(d.x))
              .attr("cy", (d) => yScaler(d.y))
              .attr("r", pointradius)
              .style("fill", currentData[classID].meta.color)
              .on('click', (event, data) => {
                let guid = data.guid;
                let x = $(event.target).parents('.vis-class-layer');
                let parsedData = $(event.target).parents('.vis-class-layer').data('layer-id').split('-')
                console.log(parsedData);
                self.filterPoints(parsedData[0], guid);
              });
    }

    self.expendClassToggle = function (classID) {
        let clikedClass = $(self.findClassById(classID));
        if (clikedClass === undefined) {
            return;
        }
        let isClassExpanded = (clikedClass.data('class-expanded') === 'true')
        if (isClassExpanded) {
            classVisualizationState[classID].isExpended = false;
            classVisualizationState[classID].selectedBlockID = -1;
            clikedClass.animate({
                height: '102px',
            });
            clikedClass.data('class-expanded', 'false');
            $(self.findClassById(classID)).find('.vis-class-block').removeClass('vis-selected-block');
        } else {
            classVisualizationState[classID].isExpended = true;
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
        let blockElement = $(event.target);
        let blockDataAttr = blockElement.data('block-id').split("-");
        let classID = blockDataAttr[0];
        let blockID = blockDataAttr[1];
        let classContainer = blockElement.parents('.vis-class-container');
        let layersContainer = classContainer.find('.vis-class-layer-container');
        let alreadyExpended = classVisualizationState[classID].isExpended;
        let prevClickedBlockID = classVisualizationState[classID].selectedBlockID;

        if (prevClickedBlockID === -1) {
            blockElement.addClass('vis-selected-block');
        } else {
            $(self.findBlockByID(classID, prevClickedBlockID)).removeClass('vis-selected-block');
            blockElement.addClass('vis-selected-block');
        }
        

        if (layersContainer.length) {
            layersContainer.empty();
            alreadyExpended = true;
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
            self.plotLayer(blockLayer[0], classID, blockID, i);
        }
        let currGUID = classVisualizationState[classID].selectedGUID;
        classVisualizationState[classID].selectedGUID = '';
        self.filterPoints(classID, currGUID);

        classVisualizationState[classID].selectedBlockID = blockID;

        if (prevClickedBlockID === -1 || prevClickedBlockID === blockID) {
            self.expendClassToggle(classID);
        }
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
        classVisualizationState = [];
        let mainVisContainer = $('.vis-main-container');
        mainVisContainer.empty();

        for (let i = 0; i < visualizationData.length; i++) {
            let classData = visualizationData[i];
            let classVisState = new VisualizationState();
            classVisState.classId = classData.meta.name;
            classVisState.classData.minMaxX = self.calculateClassMinMax(classData.blocks, 'x');
            classVisState.classData.minMaxY = self.calculateClassMinMax(classData.blocks, 'y');
            classVisualizationState.push(classVisState)
            let classContainer = self.createClassContainerElement();
            classContainer.addClass('class-id-' + i);
            let classBlockContainer = self.createClassBlockContainerElement();
            let classInfoElement = self.createClassInfoElement();

            classInfoElement.text(classData.meta.name);
            classBlockContainer.append(classInfoElement);

            for (let j = 0; j < classData.blocks.length; j++) {
                let blockElement = self.createBlockElement();
                blockElement.addClass('block-id-' + i + '-' + j)
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