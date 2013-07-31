define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {

    return {
        execute : function(el) {

            var flow = sebastian.flow("examples.execution.context")
                .step("one", function() {
                    helper.appendStepCompleteMessage.call(el, "one");
                });

            //Create a flow/execution
            var execution = flow.create();

            return execution
                .context({
                    someVariable : "Data that is private to this execution"
                })
                .execute();

        }
    };



});