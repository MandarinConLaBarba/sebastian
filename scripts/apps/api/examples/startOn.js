define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {


    var flow = sebastian.flow("examples.startOn")
        .step("one", function() {

            return helper.appendStepCompleteMessage.call(this.$el, "one", 1000);
        })
        .step("two", function() {
            console.log("two")
            return helper.appendStepCompleteMessage.call(this.$el, "two", 500);

        })
        .step("three", function() {
            console.log("three")
            return helper.appendStepCompleteMessage.call(this.$el, "three", 500);

        })
        .startOn("two");

    return flow;


});