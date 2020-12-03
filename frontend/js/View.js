"use strict";

const View = function (controllerClass) {

    const self = this;
    const controller = controllerClass;

    let div = $(document.createElement('div'));
    let currentData;
    let classVisualizationState = [];
    let VisualizationState = function () {
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
    let modelSelector, datasetSelector, dRedSelector, classesSelector, helpDialog,
    visualizeButton, filterButton, helpButton;
    let classesCheckboxes = [];
    let customClassesList = [];
    let classNameList = [];
    let isDataLoaded = false;
    let tSNE = false;

    self.initialize = function () {
        let leftPane = $('.vis-left-pane');
        leftPane.css('width', ($(window).width() - 290) + 'px');
        $(window).resize(() => {
            leftPane.css('width', ($(window).width() - 290) + 'px');
        });

        drawer = mdc.drawer.MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
        topAppBar = mdc.topAppBar.MDCTopAppBar.attachTo(document.getElementById('app-bar'));
        topAppBar.setScrollTarget(document.getElementById('main-content'));

        topAppBar.listen('MDCTopAppBar:nav', () => {
            drawer.open = !drawer.open;
        });

        modelSelector = new mdc.select.MDCSelect(document.querySelector('#model-selector'));
        datasetSelector = new mdc.select.MDCSelect(document.querySelector('#dataset-selector'));
        dRedSelector = new mdc.select.MDCSelect(document.querySelector('#d-red-selector'));
        dRedSelector.listen('MDCSelect:change', () => {
            if(dRedSelector.selectedIndex === 1) {
                tSNE = true;
            } else {
                tSNE = false;
            }
        });

        visualizeButton = document.querySelector('#menu-visualize-button');
        visualizeButton.addEventListener('click', (event) => {
            drawer.open = false;
            $('.vis-left-pane').empty();
            $('.vis-right-pane').addClass('vis-right-pane-border');
            controller.visualizaButtonClicked([]);
            $('.splash-container').hide();
            $('.vis-classes-filter-container').show();
            $('.vis-image-container').show();
        });

        filterButton = document.querySelector('#vis-classe-filter-button');
        filterButton.addEventListener('click', (event) => {
            if (customClassesList.length === 0) {
                $('.vis-class-container').show();
                return;
            }
            $('.vis-class-container').each((k, v) => {
                let tClass = $(v);
                for (let i = 0; i < customClassesList.length; i++) {
                    if (tClass.hasClass('class-id-' + customClassesList[i])) {
                        tClass.show();
                        break;
                    } else {
                        tClass.hide();
                    }
                }
            });
        });

        helpDialog = new mdc.dialog.MDCDialog(document.querySelector('.help-dialog'));

        helpButton = document.querySelector('#help-button');
        helpButton.addEventListener('click', (event) => {
           helpDialog.open();
        });
    }

    self.updateClassFilters = function (loadedClassNameList) {
        $('.vis-classes-filter-container').hide();
        $('.vis-image-container').hide();
        classNameList = loadedClassNameList;
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
        let min = 9999999999.0;
        let max = -999999999.0;

        for (let i = 0; i < blockData.length; i++) {
            let currentBlock = blockData[i].layers;

            for (let j = 0; j < currentBlock.length; j++) {
                let currentLayer = currentBlock[j].layers;

                for (let k = 0; k < currentLayer.length; k++) {
                    let currentPoint = currentLayer[k];

                    if (axis === 'x' ) {
                        if (tSNE === false) {
                            if (min > parseFloat(currentPoint.x_pca)) {
                                min = parseFloat(currentPoint.x_pca);
                            }
                            if (max < parseFloat(currentPoint.x_pca)) {
                                max = parseFloat(currentPoint.x_pca);
                            }
                        } else {

                            if (min > parseFloat(currentPoint.x_tsne)) {
                                min = parseFloat(currentPoint.x_tsne);
                            }
                            if (max < parseFloat(currentPoint.x_tsne)) {
                                max = parseFloat(currentPoint.x_tsne);
                            }
                        }
                    } else {
                        if (tSNE === false) {
                            if (min > parseFloat(currentPoint.y_pca)) {
                                min = parseFloat(currentPoint.y_pca);
                            }
                            if (max < parseFloat(currentPoint.y_pca)) {
                                max = parseFloat(currentPoint.y_pca);
                            }
                        } else {
                            if (min > parseFloat(currentPoint.y_tsne)) {
                                min = parseFloat(currentPoint.y_tsne);
                            }
                            if (max < parseFloat(currentPoint.y_tsne)) {
                                max = parseFloat(currentPoint.y_tsne);
                            }
                        }
                    }
                }
            }
        }
        return [min, max];
    }

    self.filterPoints = function (classID, guid) {
        if (guid.length === 0 || guid === 'none') {
            return;
        }
        let prevGUID = classVisualizationState[classID].selectedGUID;
        classVisualizationState[classID].selectedGUID = guid;
        $('.vis-class-container.class-id-' + classID).find('.vis-class-layer').each((k1, v1) => {
            let selectedPoint;
            $(v1).find('g > circle').each((k2, v2) => {
                let point = $(v2);

                if (prevGUID === guid) {
                    point.attr('style', 'fill: ' + currentData[classID].meta.color);
                } else {
                    if (point.attr('id') !== guid) {
                        point.attr('style', 'fill: #A8A8A8');
                    } else {
                        selectedPoint = point.attr('style', 'fill: ' + currentData[classID].meta.color);
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

    self.showPointImage = function(classID, guid) {

        let image = $(document.createElement('img'));
        image.css('width', '128px');
        image.css('height', '128px');
        image.attr('src', 'img/' + controller.getImagePath() + '/' + guid + '.png');
        let existingImage = $('.vis-image-container > img');
        if (existingImage.length) {
            existingImage.remove();
            if (classVisualizationState[classID].selectedGUID === 'none') {
                return;
            }
        }
        
        let imageContainer = $('.vis-image-container');
        imageContainer.append(image);
       

    };

    self.plotLayer = function (element, classID, blockID, layerID, addEventListener = false) {
        let layerData = currentData[classID].blocks[blockID].layers[layerID].layers;
        let selectedElementJQ = $(element);
        let selectedElementD3 = d3.select(element);
        let visualizationState = classVisualizationState[classID];
        let pointradius = 4;
        let xScaler = d3.scaleLinear()
            .domain(visualizationState.classData.minMaxX)
            .range([pointradius * 2, selectedElementJQ.width() - pointradius * 2]);

        var yScaler = d3.scaleLinear()
            .domain(visualizationState.classData.minMaxY)
            .range([selectedElementJQ.height() - pointradius * 2, pointradius * 2]);

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
            .attr("cx", (d) => {
                if(tSNE === false) {
                    return xScaler(parseFloat(d.x_pca));
                } else {
                    return xScaler(parseFloat(d.x_tsne));
                }
            })
            .attr("cy", (d) => {
                if(tSNE === false) {
                    return xScaler(parseFloat(d.y_pca));
                } else {
                    return xScaler(parseFloat(d.y_tsne));
                }
            })
            .attr("r", pointradius)
            .style("fill", currentData[classID].meta.color)
            .on('click', (event, data) => {
                if (addEventListener) {
                    let guid = data.guid;
                    let x = $(event.target).parents('.vis-class-layer');
                    let parsedData = $(event.target).parents('.vis-class-layer').data('layer-id').split('-')
                    self.filterPoints(parsedData[0], guid);
                    self.showPointImage(parsedData[0], guid);
                }
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
                height: '152px',
            });
            clikedClass.data('class-expanded', 'false');
            $(self.findClassById(classID)).find('.vis-class-block').removeClass('vis-selected-block');
        } else {
            classVisualizationState[classID].isExpended = true;
            clikedClass.animate({
                height: '345px',
            });
            clikedClass.data('class-expanded', 'true')
        }
    }

    self.calculateMinMaxX = function(layerData) {
        let min = 9999999999.0;
        let max = -999999999.0;
        for (let i = 0; i < layerData.length; i++) {
            let currentPoint = layerData[i];
            if (tSNE === false) {
                if (min > parseFloat(currentPoint.x_pca)) {
                    min = parseFloat(currentPoint.x_pca);
                }
                if (max < parseFloat(currentPoint.x_pca)) {
                    max = parseFloat(currentPoint.x_pca);
                }
            } else {
                if (min > parseFloat(currentPoint.x_tsne)) {
                    min = parseFloat(currentPoint.x_tsne);
                }
                if (max < parseFloat(currentPoint.x_tsne)) {
                    max = parseFloat(currentPoint.x_tsne);
                }
            }
        }
        return [min, max];
    }

    self.calculateMinMaxY = function(layerData) {
        let min = 9999999999.0;
        let max = -999999999.0;
        for (let i = 0; i < layerData.length; i++) {
            let currentPoint = layerData[i];
            if (tSNE === false) {
                if (min > parseFloat(currentPoint.y_pca)) {
                    min = parseFloat(currentPoint.y_pca);
                }
                if (max < parseFloat(currentPoint.y_pca)) {
                    max = parseFloat(currentPoint.y_pca);
                }
            } else {
                if (min > parseFloat(currentPoint.y_tsne)) {
                    min = parseFloat(currentPoint.y_tsne);
                }
                if (max < parseFloat(currentPoint.y_tsne)) {
                    max = parseFloat(currentPoint.y_tsne);
                }
            }
        }
        return [min, max];
    }

    self.zoomLayer = function(zoomedLayerModal, classID, blockID, layerID) {
        let modalBody = zoomedLayerModal.find('.modal-body');
        modalBody.text('');

        let layerData = currentData[classID].blocks[blockID].layers[layerID].layers;
        let selectedElementJQ = modalBody;
        let selectedElementD3 = d3.select(modalBody.get(0));
        let visualizationState = classVisualizationState[classID];
        let pointradius = 4;
        let xScaler = d3.scaleLinear()
            .domain(self.calculateMinMaxX(layerData))
            .range([pointradius * 2, selectedElementJQ.width() - pointradius * 2]);

        var yScaler = d3.scaleLinear()
            .domain(self.calculateMinMaxY(layerData))
            .range([selectedElementJQ.height() - 60 - pointradius * 2, pointradius * 2]);

        var xAxis = d3.axisBottom(xScaler).ticks(15);
        
        var yAxis = d3.axisLeft(yScaler).ticks(15);

        let svg = selectedElementD3
            .append("svg")
            .attr("width", selectedElementJQ.width())
            .attr("height", selectedElementJQ.height())

        svg.append('g')
            .attr("transform", "translate(50,0)") 
            .selectAll("dot")
            .data(layerData)
            .enter()
            .append("circle")
            .attr('id', (d) => d.guid)
            .attr("cx", (d) => {
                if(tSNE === false) {
                    return xScaler(parseFloat(d.x_pca));
                } else {
                    return xScaler(parseFloat(d.x_tsne));
                }
            })
            .attr("cy", (d) => {
                if(tSNE === false) {
                    return yScaler(parseFloat(d.y_pca));
                } else {
                    return yScaler(parseFloat(d.y_tsne));
                }
            })
            .attr("r", pointradius)
            .style("fill", (d) => {
                if(visualizationState.selectedGUID === 'none' || visualizationState.selectedGUID === '') {
                    return currentData[classID].meta.color
                } else {
                    if(d.guid === visualizationState.selectedGUID) {
                        return currentData[classID].meta.color
                    } else {
                        return '#A8A8A8';
                    }
                }
            })
            .on('click', (event, data) => {
                let guid = data.guid;
                self.filterPoints(classID, guid);
                self.showPointImage(classID, guid);
                let modal = $(event.target).parent().find('circle');
                for (let i = 0; i < modal.length; i++) {
                    let circle = $(modal.get(i));
                    if(visualizationState.selectedGUID === 'none' || visualizationState.selectedGUID === '') {
                        circle.attr('style', 'fill: ' + currentData[classID].meta.color);
                    } else {
                        if(circle.attr('id') === visualizationState.selectedGUID) {
                            circle.attr('style', 'fill: ' + currentData[classID].meta.color);
                        } else {
                            circle.attr('style', 'fill: #A8A8A8');
                        }
                    }
                }
            });
        
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(50,510)')
            .call(xAxis);
    
        svg.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(50,0)')
            .call(yAxis);
    }

    self.processBlockClickEvent = function (event) {
        let blockElement = $(event.target);
        blockElement = blockElement.parents('.vis-class-block');

        let blockDataAttr = blockElement.data('block-id').split("-");
        let classID = blockDataAttr[0];
        let blockID = blockDataAttr[1];
        let classContainer = blockElement.parents('.vis-class-container');
        let layersContainer = classContainer.find('.vis-class-layer-container > div');
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
            classContainer.append(layersContainer.parent());
        }

        layersContainer.append('<div class="vis-class-info-spacer"></div>');

        let blockLayersList = currentData[classID].blocks[blockID].layers;

        for (let i = 0; i < blockLayersList.length; i++) {
            let blockLayer = self.createLayerElement();
            blockLayer.attr('data-layer-id', classID + '-' + blockID + '-' + i);
            blockLayer.find('.vis-class-data').attr('data-layer-id', classID + '-' + blockID + '-' + i);
            blockLayer.find('.vis-class-title').text(blockLayersList[i].name);
            layersContainer.append(blockLayer);
            self.plotLayer(blockLayer.find('.vis-class-data')[0], classID, blockID, i, true);
        }
        layersContainer.css('width', (blockLayersList.length + 1) * 170 + 'px');
        let currGUID = classVisualizationState[classID].selectedGUID;
        classVisualizationState[classID].selectedGUID = '';
        self.filterPoints(classID, currGUID);

        classVisualizationState[classID].selectedBlockID = blockID;

        if (prevClickedBlockID === -1 || prevClickedBlockID === blockID) {
            self.expendClassToggle(classID);
        }
    }

    self.processLayerClickEvent = function(event) {
        if (event.target.tagName.toLowerCase() !== 'svg') {
            return;
        }
        let layer = $(event.target).parents('.vis-class-layer');
        let blockDataAttr = layer.data('layer-id').split("-");
        let classID = parseInt(blockDataAttr[0]);
        let blockID = parseInt(blockDataAttr[1]);
        let layerID = parseInt(blockDataAttr[2]);
        let zoomedLayerModal =  $('#zoomed-layer-modal');
        zoomedLayerModal.modal('toggle');
        zoomedLayerModal.find('.modal-title').html(layer.find('.vis-class-title').text());
        self.zoomLayer(zoomedLayerModal, classID, blockID, layerID)
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
        let classContainer = div.clone();
        classContainer.addClass('vis-class-layer-container');
        classContainer.append($(div.clone()));
        return classContainer.find('div');
    }

    self.createClassInfoElement = function () {
        let classContainer = $(document.createElement('div'));
        classContainer.addClass('vis-class-info');
        let className = $(document.createElement('div'));
        className.css('text-align', 'center');
        className.css('margin', '50px 0px');
        classContainer.append(className);
        return classContainer;
    }

    self.createBlockElement = function () {
        let classContainer = div.clone();
        classContainer.addClass('vis-class-block');
        classContainer.attr('data-block-id', 'none');
        let title = div.clone();
        title.addClass('vis-class-title');
        classContainer.append(title);
        let data = div.clone();
        data.addClass('vis-class-data');
        classContainer.append(data);
        return classContainer;
    }

    self.createLayerElement = function () {
        let classContainer = $(document.createElement('div'));
        classContainer.addClass('vis-class-layer');
        classContainer.attr('data-layer-id', 'none');
        let title = div.clone();
        title.addClass('vis-class-title');
        classContainer.append(title);
        let data = div.clone();
        data.addClass('vis-class-data');
        classContainer.append(data);
        classContainer.on('click', (event) => self.processLayerClickEvent(event));
        return classContainer;
    }

    self.buildVisualization = function (visualizationData) {
        classVisualizationState = [];
        let mainVisContainer = $('.vis-main-container .vis-left-pane');
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

            classInfoElement.children('div').text('Class: ' + classData.meta.name);
            classBlockContainer.append(classInfoElement);
            classContainer.append(classBlockContainer);
            mainVisContainer.append(classContainer);

            for (let j = 0; j < classData.blocks.length; j++) {
                let blockElement = self.createBlockElement();
                blockElement.addClass('block-id-' + i + '-' + j);
                blockElement.find('.vis-class-data').addClass('block-id-' + i + '-' + j)
                blockElement.attr('data-block-id', i + '-' + j);
                blockElement.find('.vis-class-data').attr('data-block-id', i + '-' + j);
                blockElement.find('.vis-class-title').text(currentData[i].blocks[j].meta.name);
                blockElement.on('click', (event) => self.processBlockClickEvent(event));
                
                classBlockContainer.append(blockElement);
                self.plotLayer(blockElement.find('.vis-class-data')[0], i, j, (currentData[i].blocks[j].layers.length - 1));
            }

        }
        mainVisContainer.append('<div class="vis-class-spacer"></div>')
    };

    self.classFilterEventListener = function (element) {
        let classFilterSelector = $('.vis-classes-filter-custom');
        if (classesSelector.selectedIndex === 1) {
            classFilterSelector.empty();
            let checkboxTemplate = $('.mdc-checkbox.template');

            for (let i = 0; i < classNameList.length; i++) {
                let checkboxClone = checkboxTemplate.clone();
                checkboxClone.removeClass('template');
                checkboxClone.find('input').attr('id', 'class-' + i);
                checkboxClone.find('.checkbox__text').html(classNameList[i]);
                checkboxClone.on('click', (event) => {
                    let classSelected = parseInt($(event.target).attr('id').split('-')[1]);
                    var index = customClassesList.indexOf(classSelected);
                    if (index > -1) {
                        customClassesList.splice(index, 1);
                    } else {
                        customClassesList.push(classSelected);
                    }
                    customClassesList.sort();
                });
                classFilterSelector.append(checkboxClone);
                classesCheckboxes.push(new mdc.checkbox.MDCCheckbox(checkboxClone[0]));
            }
        } else {
            classFilterSelector.empty();
            customClassesList = [];
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