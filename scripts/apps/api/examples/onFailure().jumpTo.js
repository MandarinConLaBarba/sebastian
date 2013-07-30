define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {

    var delegate = sebastian.flow("examples.onFailure().jumpTo.delegate")
        .step("one", function() {

            return helper.appendSuccessMessage.call(this.$el, "Step one complete, in the failure delegate flow.");

        });


    var flow = sebastian.flow("examples.onFailure().jumpTo")
        .step("one", function() {

            return helper.appendStepCompleteMessage.call(this.$el, "one");

        })
        .delay(1000)
        .step("two", function() {

            helper.appendMessage.call(this.$el, "Entering step two...");

            return $.Deferred().reject("someFailureCode");

        })
        .step("three", function() {

            //this should not be executed!
            return helper.appendStepCompleteMessage.call(this.$el, "three");
        })
        .onFailure("someFailureCode").jumpTo(delegate);

    return flow;


});