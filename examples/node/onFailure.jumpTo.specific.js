var $ = require("jquery-deferred"),
    flow = require("../../flow").flow;

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


console.log("beginning flow two, chained to one on failure 'blah'");
flow("secondFlow").onFailure("blah").jumpTo("firstFlow").begin();
