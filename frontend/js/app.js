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

//plot grid margin 
var margin = {top: 5, right: 5, bottom: 5, left: 5},
    width = 200 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;


var svg = d3.select("#plotgrid")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
  "translate(" + margin.left + "," + margin.top + ")");

d3.json("/data/sample_data_cifar10.json").then(function(data) {
    
  var n_layers = data.n_layers;
  var n_classes = data.classes.length;

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
              // console.log(datapoint.comp1)
              // console.log(datapoint.comp2)
            })
          
            plotdata[layer_i][class_i].map(temp_arr)
          }
        }
      }
  }

  console.log(plotdata)


  //////TODO: Trying to iterate plot using the 2d array plotdata[layer_i][class_i] 
  for (let i = 0; i < n_layers; i++) {
    if(!!data['dataset_'+i]){
      let layer_data = data['dataset_'+i];
      layer_data.forEach(class_data => {
      //Plot
      //X axis
        var x = d3.scaleLinear()
        .domain([-2, 2])
        .range([ 0, width ]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
      //Yaxis
      var y = d3.scaleLinear()
        .domain([-3, 3])
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

      });
    }
  }


//Plot Template
//X axis
  var x = d3.scaleLinear()
    .domain([-2, 2])
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
//Yaxis
  var y = d3.scaleLinear()
    .domain([-3, 3])
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

// Add dots
  svg.append('g')
  .selectAll("dot")
  .data(plotdata)
  .enter()
  .append("circle")
    .attr("cx", function (d) { return x(d.comp1); } )
    .attr("cy", function (d) { return y(d.comp2); } )
    .attr("r", 1.5)
    .style("fill", "#69b3a2")

  // console.log(data.classes);
  console.log(n_layers);
  console.log(n_classes);


  //Expandable Grid
  grid = d3.select("#main-content")
 .append("div")
 .attr("id", "grid")
 .attr("class", "grid")
  ;

  var plots = grid
  .selectAll("div")
  .data(data.classes)
  .enter()
  .append("div")
  .attr("class", "plot")
  .style({

  })
  ;
  

});
  