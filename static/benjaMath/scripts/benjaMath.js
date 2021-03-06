/*
  INITIAL CODE TO BE RUN
*/
CKEDITOR.config.height = '75vh';

CKEDITOR.replace("editor");

CKEDITOR.instances.editor.setData("<h3>Example of use:</h3><pre>2*2<br>3^3<br>solve{x^2=4,x}<br>noEval{f(x)=ax^2+bx+c}</pre>");

parser = new DOMParser();

var userExpressions = {};

var lastUsedPath = "test";

for (var i in CKEDITOR.instances) {
  CKEDITOR.instances[i].on("change", function() {
    renderPreview();
  });
  CKEDITOR.instances[i].on("instanceReady", function() {
    renderPreview();
  });
}

/*
  FUNCTIONS
*/

//APPLICATION FEATURES

//Event for printButton
document.getElementById("printButton").addEventListener("click", function(){
  $("#content").hide();
  let previewContent = $("#preview").html();
  $("body").append("<div id='printContent'>" + previewContent + "</div>");
  window.print();
  $("#printContent").remove();
  $("#content").show();
});

//Event for the saveButton
document.getElementById("saveButton").addEventListener("click", function(){
  let editorData = CKEDITOR.instances.editor.getData();
  var blob = new Blob([editorData], {type: "text/plain;charset=utf-8"});
  var projectName = prompt("Enter project name:","BenjaMath Project");
  if(projectName !== null){
    saveAs(blob, projectName + ".html");
  }
});

//Event for the openButton
document.getElementById("openButton").addEventListener("click", function(){
  $("#openInput").trigger("click");
});

//Event for choosing new file
document.getElementById("openInput").addEventListener("change", function(evt){
  //Choose the first file from the list, as only one file is allowed
  var f = evt.target.files[0];
  //Declare a new fileReader
  var reader = new FileReader();
  //Set up the code for loading a file with the reader
  reader.onload = function(e){
    //Contents of file being read
    var contents = e.target.result;
    //Set the contents of the editor
    CKEDITOR.instances.editor.setData(contents);
  }
  lastUsedPath = f.path;
  //Read the file as text and then run the onload function
  reader.readAsText(f);

});

//MATH HANDLING

//Function to solve the equations
function solve (eq, variable) {
  let requestData = ajaxRq("/solveEq/", {"eq": eq, "variable": variable});
  requestData = JSON.parse(requestData);
  return requestData;
}

//Function to split the multiple sloutions from the equation solving intro and array of expressions("stringified")
function solutionToArray(ex) {
  //Input ex in string form
  if (ex.indexOf(",") !== -1) {
    ex = ex.split(",");
  }
  return ex;
}

//Floating point evaluation
function evalf(ex, decimals){
  return JSON.parse(ajaxRq("/evalfCalc/", {"ex": ex, "decimals" : decimals}));
}

function simplify(ex){
  return JSON.parse(ajaxRq("/simplifyExpression/", {"ex": ex}));
}

function noEval(ex){
  return ex;
}

function renderPreview(){
  $("#preview").empty();
  var eData = CKEDITOR.instances.editor.getData();
  var data = parser.parseFromString(eData, "text/html");
  var preTags = data.getElementsByTagName("pre");
  //This loop check wheter there are any elements in the pretags array.
  //If there is take the one at position 0 and replace it. This works because the list is live updating.
  while (preTags.length > 0){
    var element = preTags[0];
    var replaceString = "";
    var mathArray = element.innerHTML.split("\n");
    var latexResult = "";
    for (m of mathArray){
      if (m !== "") {
        if (typeof userExpressions[m] === "undefined") {
          var curlyOpen = m.indexOf("{");
          var curlyClose = m.lastIndexOf("}");
          if (curlyOpen !== -1){
            if (curlyClose !== -1){
              var args = m.substring(curlyOpen + 1 , curlyClose);
              args = args.split(",");
              if (typeof args[1] !== "string"){
                args[1] = "x";
              }
              latexResult = window[m.substring(0, curlyOpen)](args[0], args[1]);
              userExpressions[m] = latexResult;
            }
          } else {
            //Default operation if not function is detected
            latexResult = simplify(m);
            userExpressions[m] = latexResult;
          }
        } else {
          latexResult = userExpressions[m];
        }
        replaceString += katex.renderToString(latexResult) + "<br>";
      }
    }
    $(element).replaceWith(replaceString);
  }
  console.log(userExpressions);
  $("#preview").append(data.getElementsByTagName("body")[0].innerHTML);
}
