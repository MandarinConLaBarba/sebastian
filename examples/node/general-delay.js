var $ = require("jquery-deferred"),
    flow = require("../../sebastian").flow;

flow("someFlow")
    .step("one", function() {
        console.log("one..");
    })
    .delay(1000)
    .step("two", function() {
        console.log("two..");
    });

flow("someFlow")
    .begin();
