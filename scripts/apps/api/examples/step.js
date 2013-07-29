define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {


    var flow = sebastian.flow("examples.step")
        .step("one", function() {

            return helper.appendStepCompleteMessage.call(this.$el, "one", 1000);
        })
        .step("two", function() {

            return helper.appendStepCompleteMessage.call(this.$el, "two", 500);

        })
        .waterfall();

    return flow;


});