define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {


    return {
        execute : function(el) {

            return sebastian.flow("examples.onFailure().handleWith")
                .step("one", function() {

                    return helper.appendStepCompleteMessage.call(el, "one");

                })
                .step("two", function() {

                    helper.appendMessage.call(el, "Entering step two...");

                    return $.Deferred().reject("someFailureCode");

                })
                .step("three", function() {

                    //this should not be executed!
                    return helper.appendStepCompleteMessage.call(el, "three");
                })
                .onFailure("someFailureCode").handleWith(function() {
                    return helper.appendFailureMessage.call(el,
                        "Failure successfully handled.");
                }).begin();
        }
    };


});