var $ = require("jquery-deferred"),
    flow = require("../../sebastian").flow;

flow("examples.flow.parallel")
    .step("one", function(arg1, arg2) {

        console.log("Entering step one..");
        //Arguments passed to begin() are available in first step.
        console.log("arg 1 passed from begin(): " + arg1);
        console.log("arg 2 passed from begin(): " + arg2);
    })
    .step("two", function(arg1, arg2) {
        console.log("Entering step two..");
        //Arguments passed to begin() are available in first step.
        console.log("arg 1 passed from begin(): " + arg1);
        console.log("arg 2 passed from begin(): " + arg2);

    })
    .parallel()
    .begin("cool", "data");