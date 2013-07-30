define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {


    return {
        execute : function(el) {

            var flow = sebastian.flow("examples.delay")
                .step("one", function() {

                    return helper.appendStepCompleteMessage.call(el, "one");
                })
                .delay(1000)
                .step("two", function() {

                    return helper.appendStepCompleteMessage.call(el, "two");

                })
                .delay(1000)
                .step("three", function() {
                    return helper.appendStepCompleteMessage.call(el, "three");

                })
                .delay(1000);

            return flow.begin();

        }
    };


});