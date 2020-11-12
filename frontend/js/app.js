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
    //alert(`Selected option at index ${classesSelector.selectedIndex} with value "${classesSelector.value}"`);
    if (classesSelector.selectedIndex > 1) {
        classesSelector.selectedIndex = 0;
    }
});
  
const visualizeButton = document.querySelector('#menu-button');
visualizeButton.addEventListener('click', (event) => {
  drawer.open = false;
});



 


// var svg = d3.select("#plotgrid")
//   .append("svg")
//   .attr("width", width + margin.left + margin.right)
//   .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//   .attr("transform",
//   "translate(" + margin.left + "," + margin.top + ")");

d3.json("data/sample_json5.json").then(function(data) {
    
  var n_layers = data.n_layers;
  console.log(data.n_layers)
  var n_classes = data.dataset_0.length;
  console.log(n_classes)
  var plotdata = []
  
  /////TODO: Trying to store data point into plotdata[layer_i][class_i]
  for (let layer_i = 0; layer_i < n_layers; layer_i++) {
      if(!!data['dataset_'+layer_i]){
        let layer_data = data['dataset_'+layer_i];
        for (let class_i = 0; class_i < n_classes; class_i++){
          var temp_arr = []
          if(!!layer_data[class_i]){
            layer_data[class_i].forEach(datapoint => {
              temp_arr.push(datapoint)
              // console.log(temp_arr)
              // console.log(datapoint.comp2)
            })
          
            plotdata.push(temp_arr)
            // console.log(plotdata)
          }
        }
      }
  }
  // console.log(plotdata)

//Start plot grid
//plot grid margin 
var margin = {top: 1, right: 1, bottom: 1, left: 1}
width = $(window).height() / 10 - margin.left - margin.right,
height = $(window).height() / 10 - margin.top - margin.bottom;


// console.log($(document).height()/10)
// console.log($(document).width()/10)
// console.log($(window).height()/10)
// console.log($(window).width()/10)

// Expandable Grid
var grid = d3.select("#main-content")
.append("div")
.attr("id", "grid")
.attr("class", "grid")
;

  var svg = grid
 .selectAll("div")
 .data(plotdata)
 .enter()
 .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
  "translate(" + margin.left + "," + margin.top + ")");

  //////TODO: Trying to iterate plot using the 2d array plotdata[layer_i][class_i] 
  for (let i = 0; i < n_classes; i++) {
      for (let j = 0; j < n_layers; j++) {
      //Plot
      svg.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
      //X axis
    //  console.log(plotdata.comp2)

      var x = d3.scaleLinear()
        .domain([-1, 1])
        .range([ 0, width ]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
      //Yaxis
      var y = d3.scaleLinear()
        .domain([-1, 1])
        .range([ height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // Add dots
      svg.append('g')
      .selectAll("dot")
      .data(plotdata[i])
      .enter()
      .append("circle")
        .attr("cx", function (d) { return x(d.comp1); } )
        .attr("cy", function (d) { return y(d.comp2); } )
        .attr("r", 1.5)
        .style("fill", "#69b3a2")

      }
    
  }


// //Plot Template
// //X axis
//   var x = d3.scaleLinear()
//     .domain([-2, 2])
//     .range([ 0, width ]);
//   svg.append("g")
//     .attr("transform", "translate(0," + height + ")")
//     .call(d3.axisBottom(x));
// //Yaxis
//   var y = d3.scaleLinear()
//     .domain([-3, 3])
//     .range([ height, 0]);
//   svg.append("g")
//     .call(d3.axisLeft(y));

// // Add dots
//   svg.append('g')
//   .selectAll("dot")
//   .data(plotdata)
//   .enter()
//   .append("circle")
//     .attr("cx", function (d) { return x(d.comp1); } )
//     .attr("cy", function (d) { return y(d.comp2); } )
//     .attr("r", 1.5)
//     .style("fill", "#69b3a2")

//   // console.log(data.classes);
//   console.log(n_layers);
//   console.log(n_classes);


//   //Expandable Grid
//   grid = d3.select("#main-content")
//  .append("div")
//  .attr("id", "grid")
//  .attr("class", "grid")
//   ;

//   var plots = grid
//   .selectAll("div")
//   .data(data.classes)
//   .enter()
//   .append("div")
//   .attr("class", "plot")
//   .style({

//   })
//   ;
// function gridData() {
//   var data = new Array();
//   var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
//   var ypos = 1;
//   var width = ($(window).height()-150)/n_classes-1;
//   var height = ($(window).height()-150)/n_classes-1;

//   console.log(n_classes)
//   console.log(n_layers)
//   // iterate for rows 
//   for (var row = 0; row < n_classes; row++) {
//       data.push( new Array() );

//       // iterate for cells/columns inside rows
//       for (var column = 0; column < n_layers; column++) {
//           data[row].push({
//               x: xpos,
//               y: ypos,
//               width: width,
//               height: height
//           })
//           // increment the x position. I.e. move it over by 50 (width variable)
//           xpos += width;
//       }
//       // reset the x position after a row is complete
//       xpos = 1;
//       // increment the y position for the next row. Move it down 50 (height variable)
//       ypos += height; 
//   }
//   return data;
// }

// var gridData = gridData();

// function PlotGrid(id, width, height, square) {
  
//   var grid = d3.select(id).append("svg")
//     .attr("width", $(window).height()*n_layers)
//     .attr("height", $(window).height()-150)
//     .attr("class", "chart");

//   var row = grid.selectAll(".row")
//     .data(gridData)
//     .enter().append("g")
//     .attr("class", "row");

//     var col = row.selectAll(".square")
//     .data(function(d) { return d; })
//     .enter().append("rect")
//     .attr("class","square")
//     .attr("x", function(d) { return d.x; })
//     .attr("y", function(d) { return d.y; })
//     .attr("width", function(d) { return d.width; })
//     .attr("height", function(d) { return d.height; })
//     .style("fill", "#fff")
//     .style("stroke", "#222");
//     // .on('mouseover', function() {
//     //   d3.select(this)
//     //     .style('fill', '#0F0');
//     // })
//     // .on('mouseout', function() {
//     //   d3.select(this)
//     //     .style('fill', '#FFF');
//     // })
//     // .on('click', function() {
//     //   console.log(d3.select(this));
//     // })

//       //X axis
//       var x = d3.scaleLinear()
//         .domain([-2, 2])
//         .range([ 0, ($(window).height()-150)/n_classes-1 ]);
//       // col.append("g")
//       //   .attr("transform", "translate(0," + ($(window).height()-150)/n_classes-1 + ")")
//       //   .call(d3.axisBottom(x));
//       //Yaxis
//       var y = d3.scaleLinear()
//         .domain([-3, 3])
//         .range([ ($(window).height()-150)/n_classes-1, 0]);
//       // col.append("g")
//       //   .call(d3.axisLeft(y));

//         // Add dots
//         col.append('g')
//         .selectAll("dot")
//         .data(plotdata)
//         .enter()
//         .append("circle")
//           .attr("cx", function (d) { return x(d.comp1); } )
//           .attr("cy", function (d) { return y(d.comp2); } )
//           .attr("r", 1.5)
//           .style("fill", "#69b3a2");

     

//   // var text = row.selectAll(".label")
//   //   .data(function(d) {
//   //     return d;
//   //   })
//   //   .enter().append("svg:text")
//   //   .attr("x", function(d) {
//   //     return d.x + d.width / 2
//   //   })
//   //   .attr("y", function(d) {
//   //     return d.y + d.height / 2
//   //   })
//   //   .attr("text-anchor", "middle")
//   //   .attr("dy", ".35em")
//   //   .text(function(d) {
//   //     return d.value
//   //   });
// }

// PlotGrid("#plotgrid2", $(document).height(), $(document).width(), true)

  

});
  