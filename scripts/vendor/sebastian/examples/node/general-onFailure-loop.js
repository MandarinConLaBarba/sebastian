var $ = require("jquery-deferred"),
    flow = require("../../sebastian").flow;

flow("examples.onFailure.loop")
    .step("one", function() {
        var deferred = $.Deferred();
        setTimeout(function() {
            console.log("executing step one in examples.onFailure.loop...");
            deferred.resolve();
        }, 1000);

        return deferred;
    })
    .step("two", function() {
        var deferred = $.Deferred();
        setTimeout(function() {
            console.log("executing step two in examples.onFailure.loop...");

            //Reject to demonstrate that it loops on failure
            deferred.reject();
        }, 1000);

        return deferred;
    })
    .onFailure()
    .loop()
    .begin();//This will loop forever...



