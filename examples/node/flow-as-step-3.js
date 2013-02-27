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
 * Example showing result from step one passed to flow two
 */

flow("examples.flow.two")
    .step("one", function() {
        console.log("flow two, step one..");

        return $.Deferred().resolve("blah");
    })
    .step("two", "examples.flow.one")
    .begin();
