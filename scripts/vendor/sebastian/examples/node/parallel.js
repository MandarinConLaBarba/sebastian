var $ = require("jquery-deferred"),
    flow = require("../../sebastian").flow;

flow("mockAsyncFlow")
    .step("one", function() {
        var deferred = $.Deferred();
        setTimeout(function() {
            console.log("step 1...");
            deferred.resolve();
        }, 301);

        return deferred;

    })
    .step("two", function() {
        var deferred = $.Deferred();
        setTimeout(function() {
            console.log("step 2...");
            deferred.resolve();
        }, 200);

        return deferred;
    })
    .step("three", function() {
        var deferred = $.Deferred();
        setTimeout(function() {
            console.log("step 3...");
            deferred.resolve();
        }, 100);

        return deferred;
    })
    .parallel()
    .begin();