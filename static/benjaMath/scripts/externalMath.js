function ajaxRq(aUrl, aData){
  let response;
  $.ajax({
    type: "POST",
    contentType: "application/json",
    url: aUrl,
    data: JSON.stringify(aData),
    success: function(msg, status, jqXHR){
      console.log("Getting data from post request");
      response = msg;
    },
    async: false
  });
  return response;
}

function solveEqExt(eq, variable){
  return(ajaxRq("/solveEq/", {"eq": eq, "variable": variable}));
}
