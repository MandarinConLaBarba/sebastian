var $ = require("jquery-deferred"),
    flow = require("../../sebastian").flow;

flow("secondFlow")
    .step("one", function() {
        console.log("executing step one in second flow...");
        return $.Deferred().reject("blah");
    })
    .step("two", function() {
        console.log("executing step two in second flow...");
    });


console.log("beginning flow two, chained to one on failure 'blah'");
flow("secondFlow")
    .onFailure("blah2")
    .handleWith(function() {
        console.log("it shouldn't fail here!");
    })
    .onFailure("blah")
    .handleWith(function() {
        console.log("it failed!");
    }).begin();