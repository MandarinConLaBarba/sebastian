var $ = require("jquery-deferred"),
    flow = require("../../sebastian").flow;

flow("examples.flow.one")
    .step("one", function() {
        console.log("flow one, step one..");
        return $.Deferred().reject("rejected in examples.flow.one");
    }).
    step("two", function() {
        console.log("flow one, step two..");

    });

flow("examples.flow.delegate")
    .step("one", function() {
        console.log("In the failure delegate flow..");
    });

/**
 * Demonstrates that a failure in a flow used as a step causes the failure delegate to be triggered, and stops
 * execution of examples.flow.two
 */
flow("examples.flow.two")
    .step("one", "examples.flow.one")
    .step("two", function() {
        console.log("flow two, step one..");
    })
    .onFailure()
    .jumpTo("examples.flow.delegate")
    .begin();
