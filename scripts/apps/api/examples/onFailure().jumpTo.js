define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {


    return {
        execute : function(el) {

            var delegateFlow = sebastian.flow("examples.onFailure().jumpTo.delegate")
                .step("one", function() {

                    return helper.appendSuccessMessage.call(el,
                        "Step one complete, in the failure delegate flow.");

                });

            return sebastian.flow("examples.onFailure().jumpTo")
                .step("one", function() {

                    return helper.appendStepCompleteMessage.call(el, "one");

                })
                .delay(1000)
                .step("two", function() {

                    helper.appendMessage.call(el, "Entering step two...");

                    return $.Deferred().reject("someFailureCode");

                })
                .step("three", function() {

                    //this should not be executed!
                    return helper.appendStepCompleteMessage.call(el, "three");
                })
                .onFailure("someFailureCode").jumpTo(delegateFlow)
                .begin();


        }
    };


});