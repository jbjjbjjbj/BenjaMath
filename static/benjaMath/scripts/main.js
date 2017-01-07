CKEDITOR.config.height = '75vh';

CKEDITOR.replace("editor");

CKEDITOR.instances.editor.setData("<h3>Example of use:</h3><pre>2*2<br>3^3<br>solve{x^2=4,x}<br>noEval{f(x)=ax^2+bx+c}</pre>");

parser = new DOMParser();

var userExpressions = [];

//Event for printButton
document.getElementById("printButton").addEventListener("click", function(){
  $("#content").hide();
  let previewContent = $("#preview").html();
  console.log(previewContent);
  $("body").append("<div id='printContent'>" + previewContent + "</div>");
  window.print();
  $("#printContent").remove();
  $("#content").show();
});

//Function to solve the equations
function solve (eq, variable) {
  var eqAlgebra = new algebra.parse(eq);
  let result = {};
  result.ls = eqAlgebra.toTex() + "\\Longrightarrow " + variable;
  /*This statement will try to solve the equation with javascript, if it is
  unsuccesful the eqation will be send to the server*/
  try {
    var solved = eqAlgebra.solveFor(variable);
    var solvedString = solved.toString();
  } catch(err) {
    //Send the equation to the server
    var solvedString = JSON.parse(solveEqExt(eq, variable));
    /*The next 2 steps are necesarry as python lists are weird
    The solutions will be converted to the same format as algebrajs*/
    solvedString = solvedString.substring(1, solvedString.length);
    solvedString = solvedString.substring(0, solvedString.length - 1);
  }
  result.rs = {string: solvedString, algebra: solved};
  return result;
}

//Function to split the multiple sloutions from the equation solving intro and array of expressions("stringified")
function solutionToArray(ex) {
  //Input ex in string form
  if (ex.indexOf(",") !== -1) {
    ex = ex.split(",");
  }
  return ex;
}

function noEval(ex){
  var result = {};
  result.ls = ex;
  result.rs = {string: ""};
  return result;
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
    for (m of mathArray){
      if (m !== ""){
        var curlyOpen = m.indexOf("{");
        var curlyClose = m.lastIndexOf("}");
        if (curlyOpen !== -1){
          if (curlyClose !== -1){
            var args = m.substring(curlyOpen + 1 , curlyClose);
            args = args.split(",");
            if (typeof args[1] !== "string"){
              args[1] = "x";
            }
            var result = window[m.substring(0, curlyOpen)](args[0], args[1]);
            userExpressions.push({ls: result.ls, rs: {string: solutionToArray(result.rs.string)}});
          }
        } else {
          userExpressions.push({ls: math.parse(m).toTex(), rs: {string: new algebra.parse(m).toString()}});
        }


        var rsRender = "=";
        var solution = userExpressions[userExpressions.length - 1].rs.string;
        if (typeof solution === "object"){
          rsRender = "(";
          for (var i = 0; i < solution.length; i++) {
            rsRender += math.parse(solution[i]).toTex();
            if(solution.length - i !== 1){
              rsRender += ",";
            }
          }
          rsRender += ")";
        } else if(solution === ""){
          rsRender = "";
        } else {
          rsRender += math.parse(solution).toTex();
        }

        replaceString += katex.renderToString(userExpressions[userExpressions.length - 1].ls + rsRender) + "<br>";
      }
    }
    $(element).replaceWith(replaceString);
  }
  $("#preview").append(data.getElementsByTagName("body")[0].innerHTML);
  userExpressions = [];
}

for (var i in CKEDITOR.instances) {
  CKEDITOR.instances[i].on("change", function() {
    renderPreview();
  });
  CKEDITOR.instances[i].on("instanceReady", function() {
    renderPreview();
  });
}
