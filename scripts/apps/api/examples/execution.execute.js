define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {

    return {
        execute : function(el) {

            var flow = sebastian.flow("examples.execution.execute")
                .step("one", function() {
                    helper.appendStepCompleteMessage.call(el, "one");
                });

            //Create a flow/execution
            var execution = flow.create();

            return execution.execute();

        }
    };



});