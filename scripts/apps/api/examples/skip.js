define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {


    return {
        execute : function(el) {

            var flow = sebastian.flow("examples.skip")
                .step("one", function() {

                    return helper.appendStepCompleteMessage.call(el, "one", 1000);
                })
                .step("two", function() {

                    return helper.appendStepCompleteMessage.call(el, "two", 1000);
                })
                .step("three", function() {

                    return helper.appendStepCompleteMessage.call(el, "three", 500);

                });

            flow.skip("two");

            return flow.begin();

        }
    };

});