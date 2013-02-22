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
    })
    .step("two", function() {
        console.log("executing step two in second flow...");
    });


console.log("beginning flow two, chained to one on success");
flow("secondFlow").onSuccess().jumpTo("firstFlow").begin();
