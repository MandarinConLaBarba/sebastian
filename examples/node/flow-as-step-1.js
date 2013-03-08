var $ = require("jquery-deferred"),
    flow = require("../../sebastian").flow;


flow("examples.flow.one")
    .step("one", function() {
        console.log("flow one, step one..");
        console.log(arguments);
    }).
    step("two", function() {
        console.log("flow one, step two..");
    })
    .parallel();

/**
 * Example passing the flow object:
 */
flow("examples.flow.two")
    .step("one", function() {
        console.log("flow two, step one..");
        return $.Deferred().resolve("one", "two");
    })
    .step("two", flow("examples.flow.one"))
    .begin();

