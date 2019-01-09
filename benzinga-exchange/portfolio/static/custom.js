var YAHOO = {
        Finance: {
            SymbolSuggest: {}
        }
};
 

$( "#lookup" ).click(function() {
  document.location.href = '/portfolio/' + $('#txtTicker').val();
  return false;
});

$("#txtTicker").autocomplete({
source: function (request, response) {
var query=request.term;  
$.ajax({
              type: "GET",
              url: "http://d.yimg.com/autoc.finance.yahoo.com/autoc",
              data: {query: query},
              dataType: "jsonp",
              jsonp : "callback",
              jsonpCallback: "YAHOO.Finance.SymbolSuggest.ssCallback",
          });
          // call back function
          YAHOO.Finance.SymbolSuggest.ssCallback = function (data) {           
                var suggestions = [];
                //alert(JSON.stringify(data.ResultSet.Result));                            
                $.each(data.ResultSet.Result, function(i, val) {                                                                 
                    suggestions.push(val.symbol + " " + val.name + " " + val.exchDisp);
                });
               
            response(suggestions);
          }
},
minLength: 1,
select: function (event, ui) {
               // alert(ui.item.value.split(" ")[0]);
               $('#txtTicker').val(ui.item.value.split(" ")[0]);
               document.location.href = '/portfolio/' + $('#txtTicker').val();
               return false;
},
open : function(){
        $(".ui-autocomplete:visible").css({top:"+=5",left:"-=2"});
    },
});
