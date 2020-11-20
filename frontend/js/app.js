"use strict";
/* Get or create the application global variable */
var App = App || {};

(function () {

  // setup the pointer to the scope 'this' variable
  let self = this;
  let drawer, topAppBar;
  let modelSelector, datasetSelector, dRedSelector, classesSelector, visualizeButton;
  let classesCheckboxes = [];
  let customClassesList = [];

  App.init = function () {
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
    for (let i = 1; i <= 10; i++) {
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
      $('#visualization-section').text('');
      App.start();
    });
  };

  /* Entry point of the application */
  App.start = function () {
    d3.json("https://balvar30.people.uic.edu/finalproj/data/sample_json5.json").then(function (data) {

      console.log('n_layers', data.n_layers)

      var n_layers = data.n_layers;
      var n_classes = 10; //data.classes.length;

      var plotdata = [];
      for (let i = 0; i < n_classes; i++) {
        plotdata.push([]);
      }

      for (let layer_i = 0; layer_i < n_layers; layer_i++) {
        if (data['dataset_' + layer_i]) {
          let layer_data = data['dataset_' + layer_i];
          for (let class_i = 0; class_i < n_classes; class_i++) {
            var temp_arr = []
            if (layer_data[class_i]) {
              layer_data[class_i].forEach(datapoint => {
                temp_arr.push(datapoint)
              });
              plotdata[class_i].push(temp_arr)
            }
          }
        }
      }
      //console.log(plotdata);
      var margin = { top: 1, right: 1, bottom: 1, left: 1 };

      function gridData() {
        var data = new Array();
        var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
        var ypos = 1;
        var width = ($(window).height() - 150) / n_classes - 1;
        var height = ($(window).height() - 150) / n_classes - 1;

        // iterate for rows 
        for (var row = 0; row < n_classes; row++) {
          data.push(new Array());

          // iterate for cells/columns inside rows
          for (var column = 0; column < n_layers; column++) {
            data[row].push({
              x: xpos,
              y: ypos,
              width: width,
              height: height
            })
            // increment the x position. I.e. move it over by 50 (width variable)
            xpos += width;
          }
          // reset the x position after a row is complete
          xpos = 1;
          // increment the y position for the next row. Move it down 50 (height variable)
          ypos += height;
        }
        return data;
      }

      var gridData = gridData();

      function PlotGrid(id, width, height, square) {
        //Xaxis
        var x = d3.scaleLinear()
          .domain([-0.1, 0.1])
          .range([0, 52]);

        //Yaxis
        var y = d3.scaleLinear()
          .domain([-0.1, 0.1])
          .range([52, 0]);

        var grid = d3.select(id).append("svg")
          .attr("width", "90vw")
          .attr("height", $(window).height() - 150)
          .attr("class", "chart")
          .style("margin-top", "50px")
          .style("margin-left", "75px");

        var row = grid.selectAll(".row")
          .data(gridData)
          .enter().append("g")
          .attr("class", "row")
          .style("margin", "15px");

        var col = row.selectAll(".column")
          .data(function (d, i) {
            let r = [];
            for (let j = 0; j < n_layers; j++) {
              let x = {
                'dim': d[j],
                'data': plotdata[i][j]
              };
              r.push(x);
            }
            return r;
          })
          .enter()
          .append("g")
          .attr("class", "column")
          .style("margin", "15px")
          .style("padding", "15px");

        col.append("rect")
          .attr("class", "square")
          .attr("x", function (d) { return d.dim.x; })
          .attr("y", function (d) { return d.dim.y; })
          .attr("width", function (d) { return d.dim.width; })
          .attr("height", function (d) { return d.dim.height; })
          .style("fill", "#fff")
          .style("stroke", "#222");

        col.selectAll('.column')
          .data(function (d) {
            for (let i = 0; i < d.data.length; i++) {

              d.data[i].comp1 = d.dim.x + x(parseFloat(d.data[i].comp1));
              d.data[i].comp2 = d.dim.y + y(parseFloat(d.data[i].comp2));
            }
            return d.data;
          })
          .enter()
          .append("circle")
          .attr("cx", function (d) { return d.comp1; })
          .attr("cy", function (d) { return d.comp2; })
          .attr("r", 1.5)
          .style("fill", "#69b3a2");
      }

      PlotGrid("#visualization-section", $(document).height(), $(document).width(), true)

    });
  };

  App.init();
  //App.start();

})();


