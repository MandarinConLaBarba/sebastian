define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {

    var flow = sebastian.flow("examples.begin")
        .step("one", function() {
            //do something..
        })
        .step("two", function() {
            //do something else..
        });

    //Begin the flow
    flow.begin();

    return flow;


});