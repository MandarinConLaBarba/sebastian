define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {


    return {
        execute : function(el) {

            return sebastian.flow("examples.step")
                .step("one", function() {
                    return helper.appendStepCompleteMessage.call(el, "one", 1000);
                })
                .step("two", function() {
                    return helper.appendStepCompleteMessage.call(el, "two", 500);
                })
                .begin();

        }
    };




});