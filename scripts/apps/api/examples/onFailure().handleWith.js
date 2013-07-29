define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {


    var flow = sebastian.flow("examples.onFailure().handleWith")
        .step("one", function() {

            return helper.appendStepCompleteMessage.call(this.$el, "one");


        })
        .step("two", function() {

            helper.appendMessage.call(this.$el, "Entering step two...");

            return $.Deferred().reject("someFailureCode");

        })
        .step("three", function() {

            //this should not be executed!
            return helper.appendStepCompleteMessage.call(this.$el, "three");
        })
        .onFailure("someFailureCode").handleWith(function() {
            return helper.appendFailureMessage.call(this.$el, "Failure successfully handled.");
        });

    return flow;


});