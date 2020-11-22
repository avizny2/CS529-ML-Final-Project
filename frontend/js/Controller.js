"use strict";
import { Model } from './Model.js';
import { View } from './View.js';

const Controller = function () {

    const self = this;

    let model = new Model(self.public);
    let view = new View(self.public);

    self.initialize = function () {
        model.initialize();
        view.initialize();
        model.load('synth_json1.json');
    }

    self.public = {
        initialize: function () {
            self.initialize();
        },

        updateFilters: function () {
            let classNames = model.getClassNames();
            view.updateClassFilters(classNames);
        },

        visualizaButtonClicked: function (selectedClassesList) {
            let visualizationData = model.getVisualizationData(selectedClassesList);
            view.visualizeData(visualizationData);
        }
    }

    model = new Model(self.public);
    view = new View(self.public);
    return self.public;
};

export { Controller };