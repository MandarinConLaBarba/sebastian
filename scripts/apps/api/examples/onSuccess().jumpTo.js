define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {


    return {
        execute : function(el) {

            var delegate = sebastian.flow("examples.onSuccess().jumpTo.delegate")
                .step("one", function() {

                    return helper.appendSuccessMessage.call(el,
                        "Step one complete, in the success delegate flow.");

                });

            return sebastian.flow("examples.onSuccess().jumpTo")
                .step("one", function() {

                    return helper.appendStepCompleteMessage.call(el, "one");

                })
                .delay(1000)
                .step("two", function() {

                    return helper.appendStepCompleteMessage.call(el, "two");

                })
                .delay(1000)
                .onSuccess().jumpTo(delegate)
                .begin();


        }
    };
});