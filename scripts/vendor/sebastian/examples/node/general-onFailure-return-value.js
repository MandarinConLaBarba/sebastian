var $ = require("jquery-deferred"),
    flow = require("../../sebastian").flow;

/**
 * Demonstrates how you can direct flow when a specific error result is encountered
 *
 */

flow("firstFlow")
    .step("one", function() {
        console.log("executing step one in firstFlow...");
    })
    .step("two", function() {
        var deferred = $.Deferred();

        deferred.resolve("the composite flow should be resolved, even though the second flow failed");

        return deferred;

    });

flow("secondFlow")
    .step("one", function() {
        console.log("executing step one in second flow...");
        return $.Deferred().reject("blah");
    })
    .step("two", function() {
        console.log("executing step two in second flow...");
    });


console.log("beginning flow two, chained to one on failure 'blah'");
var promise = flow("secondFlow").onFailure("blah").jumpTo("firstFlow").begin();

promise.fail(function() {
    console.log("it failed..");
});

promise.then(function(result) {
    console.log(result);
});
