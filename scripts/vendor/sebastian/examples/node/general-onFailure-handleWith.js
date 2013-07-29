var $ = require("jquery-deferred"),
    flow = require("../../sebastian").flow;

flow("secondFlow")
    .step("one", function() {
        console.log("executing step one in second flow...");
        return $.Deferred().reject();
    })
    .step("two", function() {
        console.log("executing step two in second flow...");
    });


console.log("beginning flow two, chained to one on failure 'blah'");
flow("secondFlow")
    .onFailure()
    .handleWith(function() {
        console.log("it failed!");
    }).begin();


