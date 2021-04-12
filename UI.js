mdc.ripple.MDCRipple.attachTo(document.querySelector('.mdc-top-app-bar'));
//const topAppBar = new MDCTopAppBar(topAppBarElement)


let json; // will hold the parsed JSON
let output = document.getElementById("output"); // for easy access to this element
var layout;
var color = d3.scaleOrdinal(d3.schemeCategory10);

// this function is called when a "change" event happens on the "input" element in the HTML
function loadFile(event) {
  output.innerHTML = ""; // make sure to clear the output when getting a new file
  let file = event.target.files[0]; // the "change" event itself gets passed to this function

  // make sure the file is a CSV
  if (file.type !== "text/csv") {
    printToOutput("This app can only take CSV files!");
    return; // stop trying to do the other stuff in this function
  }

  // read the file with FileReader
  const reader = new FileReader();
  reader.onload = function (e) {
    // this function is called when the reader reads the file
    // use d3-dsv to parse the CSV
    json = d3.csvParse(e.target.result, d3.autoType); // see https://github.com/d3/d3-dsv#autoType
    //printToOutput(JSON.stringify(json, null, 4));
    countRows();

    addButtons();
      wordCloud();
    fillCarousel();
      addReflections();
      
  };
  // reader reads the text of the file, triggering the "onload" function
  reader.readAsText(file);
}

// when a file is added to the page, this function is called
// it adds buttons for transforming the data, which are not
// needed until there is actually data loaded!
function addButtons() {
  // define the column where the buttons will be added
  let operationsCol = document.getElementById("operations");
  // this avoids adding a new set of buttons for every new file chosen
  // only make 'count-rows' if it doesn't exist yet
  if (!document.getElementById("count-rows")) {
    // add the "count rows" button and event listener
    let countRowsButton = document.createElement("button");
    countRowsButton.setAttribute("id", "count-rows");
    countRowsButton.innerHTML = "Count rows";
    operationsCol.appendChild(countRowsButton);
    countRowsButton.addEventListener("click", countRows);
  }
  // only make 'get-fields' if it doesn't exist yet
  if (!document.getElementById("get-fields")) {
    // add the "get fields" button and event listener
    let getFieldsButton = document.createElement("button");
    getFieldsButton.setAttribute("id", "get-fields");
    getFieldsButton.innerHTML = "Get fields";
    operationsCol.appendChild(getFieldsButton);
    getFieldsButton.addEventListener("click", getFields);
  }
  // add the "sort by" drop down
  let sortByDropdown = updateSortBy();
  operationsCol.appendChild(sortByDropdown);
  sortByDropdown.addEventListener("change", sortBy);
}

// make a dropdown element with correct fields
function updateSortBy(operationsCol) {
  let sortByDropdown;
  // remove the dropdown if it's there already
  if (document.getElementById("sort-by")) {
    document
      .getElementById("operations")
      .removeChild(document.getElementById("sort-by"));
  }
  sortByDropdown = document.createElement("select");
  sortByDropdown.setAttribute("id", "sort-by");
  // fancy built-in way to add options to a dropdown
  sortByDropdown.options[sortByDropdown.options.length] = new Option(
    "Sort by...",
    ""
  );
  // add new options for each column
  for (let col in json.columns) {
    let colValue = json.columns[col];
    sortByDropdown.options[sortByDropdown.options.length] = new Option(
      json.columns[col],
      colValue
    );
  }
  return sortByDropdown;
}

// adds the new output to the "output"
function printToOutput(text) {
  output.innerHTML = "<pre>" + text + "<br><br><br></pre>";
}

// counts the rows in the input CSV
// note: actually counts the number of objects in the parsed JSON!
function countRows() {
  if (!json) {
    printToOutput("Select a CSV");
  } else {
    printToOutput("CSV has " + json.length + " rows");
  }
}

// sort the array of objects by a field value
// note: the way this is written only sorts descending
function sortBy(event) {
  let field = event.target.value;
  let sorted = json.sort(function (a, b) {
    if (a[field] > b[field]) return -1;
    if (a[field] < b[field]) return 1;
    return 0;
  });
  printToOutput(JSON.stringify(sorted, null, 4));
}

// return a list of fields in the CSV
function getFields() {
  if (!json) {
    printToOutput("Select a CSV");
  } else {
    let fieldOutput = "";
    json.columns.forEach(col => {
      fieldOutput += col + "<br>";
    });
    printToOutput(fieldOutput);
  }
}


//JARED 

function wordCloud(){
    $("#report").css("display", "block")
    //fill = d3.scaleOrdinal(d3.schemeCategory20);
    var keywords = json.map(d=>d['Keywords (comma separated)']);
    var keys = [];
    console.log(keywords);
    keywords.forEach(function (d,i) {
                     var words = d.split(',');
                   words.forEach(function (d, i){
                       keys.push(d.replace(/\s/g, ''));
                   });
                     });
    
    var source = d3.rollup(keys, v => v.length, d => d) 
 //  var cloudwords = source.map(function(group) {
//        return {
//            text: source.key,
//            value: source.value
//        }
//    })
    
    var final = [];
    source.forEach(function(d, v, i){
        final.push({text: v, value: d * 200});
    });
    
    console.log(final);
    layout = d3.layout.cloud().size([900,200]).words(final).font("Impact").padding(3).rotate(function() { return ~~(Math.random() * 2) * 90; }).on("end", draw);

    layout.start();
    d3.select("#demo1")
    
}

function draw(words) {
    
    
    console.log(words)
    d3.select("#demo1")
        .append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .text((d) => d.text)
        .style("font-size", (d) => d.size + "px")
        .style("font-family", (d) => d.font)
        //.style("fill", (d, i) => fill(i))
        //.style("fill", d=>color(d))
        .style("fill",function() {return "hsl(" + Math.random() * 500 + ",100%,50%)"; })
        .attr("text-anchor", "middle")
        .attr("transform", (d) => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
        .attr("align","center")
        .attr("stroke", "grey")
        .attr("stroke-width", 1);
}

function fillCarousel() {
  let unique = [...new Set(json.map(d => d['Media Source URL']))];
    var active = "";
// $(".carousel-inner").html("");
  unique.forEach(function (d, i) {
    //console.log(`i= ${i}, URL: ${d}`);
      var makeiFrame = true;
    var request = new XMLHttpRequest();
    request.open('GET', d, true);
    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        if (request.status === 404) {
          makeiFrame = false;
        }
      }
    };
    request.send();
     if(i == 1){
         active = "active";

         //$('#carousel').carousel($(this).attr('data-to')false);
     }
      
      if(makeiFrame){
              $(".carousel-inner").append(`
                        <div class="carousel-item $(active)">
                            <div class="iframely-embed">
                               <div class="iframely-responsive">
                                 <a data-iframely-url href="${d}"></a>
                               </div>
                             </div>
                        </div>`);

                $('.carousel-indicators').append(`<li data-target="#carouselExampleIndicators1" data-slide-to="${i}&maxheight=200" class=""></li>`);
          iframely.load();
      }
  });
    iframely.load();
    $('.carousel').carousel(1)

}


//Word Cloud




//refelections
function addReflections(){
    let meta = json.filter(function(d){return d['Meta Level Comment?'] == "Yes"});
    let auto = json.filter(function(d){return d['Meta Level Comment?'] == "Auto-ethnographic Reflection"});
    
    meta.join(auto);
    console.log(meta);
    
    meta.forEach(function(d,i){
        var comment = d['Comments'];
        $("#AutoethnographicReflections").append(`<blockquote>${comment}</blockquote>`);
    })
}



                 

//JARED^

document.getElementById("input").addEventListener("change", loadFile);

//<!--<iframe class="embed-responsive-item" src="$iframe.ly/api/iframely?url=${d}&api_key=bac3b281e7be748b06d55a" height="300" width="600"></iframe>-->
