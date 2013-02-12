var $ = require("jquery-deferred"),
    flow = require("../flow").flow;

var flowOne = flow("firstFlow");

flowOne
    .step("one", function() {
        console.log("hello..");
    }).step("two", function() {
        console.log("hello 2..");
    }).begin();


flow("someFlow")
    .step("one", function() {
        var deferred = $.Deferred();
        setTimeout(function() {
            console.log("flow 3, step 1...");
            deferred.resolve();
        }, 301);

        return deferred;

    })
    .step("two", function() {
        var deferred = $.Deferred();
        setTimeout(function() {
            console.log("flow 3, step 2...");
            deferred.resolve();
        }, 200);

        return deferred;
    })
    .step("three", function() {
        var deferred = $.Deferred();
        setTimeout(function() {
            console.log("flow 3, step 3...");
            deferred.resolve();
        }, 100);

        return deferred;
    })
    .waterfall()
    .begin();

flow("someFlow")
    .parallel()
    .begin();

//this will fail, since no steps..
$.when(flow("blah").begin()).always(function(result) {

    console.log(result);
});