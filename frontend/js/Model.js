"use strict";

const Model = function (controllerClass) {

    const self = this;
    const controller = controllerClass;
    let classes = []
    let imagePath = '';

    self.initialize = function () {

    };

    self.loadJSON = function (fileName) {
        $.getJSON('data/' + fileName, function (data) {
            imagePath = data.images;
            $.each(data.classes, function (key, val) {
                classes.push(val);
            });
            controller.updateFilters();
        });

    };

    self.createClassNameList = function () {
        let classNames = [];
        for (let i = 0; i < classes.length; i++) {
            classNames.push(classes[i].meta.name)
        }
        return classNames;
    };

    self.getDataFilteredByClasses = function (classFilterList) {
        if (classFilterList.length === 0) {
            return classes;
        } else {
            let retClassesList = [];
            for (let i = 0; i < classFilterList.length; i++) {
                retClassesList.push(classes[classFilterList[i]])
            }
            return retClassesList;
        }
    }

    self.getImagePath = function() {
        return imagePath;
    }

    self.public = {

        initialize: function () {

        },

        load: function (fileName) {
            self.loadJSON(fileName);
        },

        getClassNames: function () {
            return self.createClassNameList();
        },

        getImagePath: function() {
            return self.getImagePath();
        },

        getVisualizationData: function (selectedClasseList) {
            return self.getDataFilteredByClasses(selectedClasseList);
        }
    }

    return self.public;
};

export { Model };