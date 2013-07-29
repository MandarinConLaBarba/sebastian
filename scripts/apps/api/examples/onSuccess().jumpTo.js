define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {

    var delegate = sebastian.flow("examples.onSuccess().jumpTo.delegate")
        .step("one", function() {

            return helper.appendSuccessMessage.call(this.$el, "Step one complete, in the failure delegate flow.");

        });


    var flow = sebastian.flow("examples.onSuccess().jumpTo")
        .step("one", function() {

            return helper.appendStepCompleteMessage.call(this.$el, "one");

        })
        .delay(1000)
        .step("two", function() {

            return helper.appendStepCompleteMessage.call(this.$el, "two");

        })
        .delay(1000)
        .onSuccess().jumpTo(delegate);

    return flow;


});