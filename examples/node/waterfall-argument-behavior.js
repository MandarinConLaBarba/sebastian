var $ = require("jquery-deferred"),
    flow = require("../../sebastian").flow;

flow("examples.flow.waterfall")
    .step("one", function() {
        //can return a single value:
        return "some great data";

    })
    .step("two", function(arg1) {

        console.log("Entering step two..");
        console.log("arg 1 passed from step one: " + arg1);

        //Or a deferred for multiple values
        return $.Deferred().resolve("more", "stuff");
    })
    .step("three", function(arg1, arg2) {
        console.log("Entering step two..");
        console.log("arg 1 passed from step two: " + arg1);
        console.log("arg 2 passed from step two: " + arg2);
    })
    .begin();