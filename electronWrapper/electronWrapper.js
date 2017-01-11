//This script will refresh the iframe contains the #content element
//Thus the server having started

var frameContent = document.getElementById("contentFrame");

setTimeout(function() {
  let contentTest = frameContent.contentWindow.document.getElementById("content");
  if(contentTest === null){
    location.reload();
  }
}, 3000);
