var $ = require("jquery-deferred"),
    flow = require("../../sebastian").flow;

flow("firstFlow")
    .step("one", function() {
        console.log("executing step one in firstFlow...");
    })
    .step("two", function() {
        console.log("executing step two in firstFlow...");
    });

flow("secondFlow")
    .step("one", function() {
        console.log("executing step one in second flow...");
        return $.Deferred().reject("blah");
    })
    .step("two", function() {
        console.log("executing step two in second flow...");
    });


console.log("beginning flow two, chained to one on failure ");
flow("secondFlow").onFailure().jumpTo("firstFlow").begin();
