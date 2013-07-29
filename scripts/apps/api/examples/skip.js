define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {


    var flow = sebastian.flow("examples.skip")
        .step("one", function() {

            return helper.appendStepCompleteMessage.call(this.$el, "one", 1000);
        })
        .step("two", function() {

            return helper.appendStepCompleteMessage.call(this.$el, "two", 1000);
        })
        .step("three", function() {

            return helper.appendStepCompleteMessage.call(this.$el, "three", 500);

        });

    flow.skip("two");

    return flow;


});