//This script will refresh the iframe contains the #content element
//Thus the server having started

//The content of the iframe
var frameContent = document.getElementById("contentFrame").contentWindow;

setTimeout(function() {
  //Refresh after 500 ms if the document is not loaded
  let contentTest = frameContent.document.getElementById("content");
  if(contentTest === null){
    location.reload();
  }
}, 500);

//When the iframe is loaded run this
$("iframe#contentFrame").on("load", function(){
  //Insert saveAs button
  let saveAsButton = frameContent.document.createElement("button");
  saveAsButton.id = "saveAsButton";
  let buttonText = frameContent.document.createTextNode("Save As");
  saveAsButton.appendChild(buttonText);
  frameContent.document.getElementById("buttons").appendChild(saveAsButton);

  //Depedencies for the save function
  var app = require("electron").remote;
  var dialog = app.dialog;
  var fs = require('fs');

  //Overwrite the click event for the saveAs button
  frameContent.document.getElementById("saveAsButton").addEventListener("click", function(){
    let editorData = frameContent.CKEDITOR.instances.editor.getData();
    dialog.showSaveDialog(function(path){
      fs.writeFile(path, editorData, function(err) {
        frameContent.lastUsedPath = path;
        if(err) {
          return console.log(err);
        }
      });
    });
  });

  frameContent.document.getElementById("saveButton").addEventListener("click", function(){
    let editorData = frameContent.CKEDITOR.instances.editor.getData();
    fs.writeFile(frameContent.lastUsedPath, editorData, function(err) {
      if(err) {
        return console.log(err);
      }
    });
  });
});
