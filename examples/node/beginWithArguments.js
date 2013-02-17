var $ = require("jquery-deferred"),
    flow = require("../../sebastian").flow;

//flow("mockAsyncFlow")
//    .step("one", function(arg1, arg2) {
//
//        console.log(arguments);
//
//        return $.Deferred().resolve("weee");
//
//    }).
//    step("two", function() {
//        console.log(arguments);
//    })
//    .begin(null, "one", "two");


flow("mockAsyncFlow.2")
    .step("one", function(arg1, arg2) {

        console.log(arguments);

        return $.Deferred().resolve("weee");

    }).
    step("two", function() {
        console.log(arguments);
    })
    .parallel()
    .begin(null, "blah", "blah2");
