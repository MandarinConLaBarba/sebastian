define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {


    var flow = sebastian.flow("examples.delay")
        .step("one", function() {

            return helper.appendStepCompleteMessage.call(this.$el, "one");
        })
        .delay(1000)
        .step("two", function() {

            return helper.appendStepCompleteMessage.call(this.$el, "two");

        })
        .delay(1000)
        .step("three", function() {

            return helper.appendStepCompleteMessage.call(this.$el, "three");

        })
        .delay(1000);

    return flow;


});