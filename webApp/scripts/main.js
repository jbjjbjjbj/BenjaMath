CKEDITOR.config.height = '75vh';

CKEDITOR.replace("editor");

CKEDITOR.instances.editor.setData("<h3>Example of use:</h3><pre>2*2<br>solve{x^2=4,x}</pre>");

parser = new DOMParser();

var userExpressions = [];

//Function to solve the equations
function solve (eq, variable) {
  eq = new algebra.parse(eq);
  solved = eq.solveFor(variable)
  return {string: solved.toString(), algebra: solved};
}

//Function to split the multiple sloutions from the equation solving intro and array of expressions("stringified")
function solutionToArray(ex) {
  //Input ex in string form
  if (ex.indexOf(",") !== -1) {
    ex = ex.split(",");
  }
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
    for (m of mathArray){
      if (m !== ""){
        var curlyOpen = m.indexOf("{");
        var curlyClose = m.indexOf("}");
        if (curlyOpen !== -1){
          if (curlyClose !== -1){
            var args = m.substring(curlyOpen + 1 , curlyClose);
            args = args.split(",");
            if (typeof args[1] !== "string"){
              args[1] = "x";
            }
            var ls = args[1];
            var rs = window[m.substring(0, curlyOpen)](args[0], args[1]);
            userExpressions.push({ls: ls, rs: {string: solutionToArray(rs.string)}});
          }
        } else {
          userExpressions.push({ls: m, rs: {string: new algebra.parse(m).toString()}});
        }
        var rsRender = "";
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
        } else {
          rsRender = math.parse(solution).toTex();
        }
        replaceString += katex.renderToString(math.parse(userExpressions[userExpressions.length - 1].ls).toTex() + "=" + rsRender) + "<br>";
      }
    }
    $(element).replaceWith(replaceString);
  }
  $("#preview").append(data.getElementsByTagName("body")[0].innerHTML);
  userExpressions = [];
}

setInterval (function() {
  window["renderPreview"]();

}, 500);
