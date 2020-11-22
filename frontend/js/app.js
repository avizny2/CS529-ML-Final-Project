"use strict";
import { Controller } from './Controller.js';

const App = function () {

    const self = this;
    const controller = new Controller();
    self.public = {

        initialize: function () {
            controller.initialize();
        }

    }

    return self.public;
};

const visApp = new App();
visApp.initialize();