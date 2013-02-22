var $ = require("jquery-deferred"),
    flow = require("../../sebastian").flow;

flow("someFlow")
    .step("one", function() {
        console.log("one..");
    })
    .step("two", function() {
        console.log("two..");
    })
    .step("three", function() {
        console.log("three..");
    });

flow("someFlow")
    .skip("one")
    .skip("two")
    .begin();
