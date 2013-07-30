define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {

    return {
        execute : function(demoContainer) {

            var flow = sebastian.flow("examples.begin")
                .step("one", function() {
                    return helper.appendStepCompleteMessage.call(demoContainer, "one");
                });

            //Begin the flow
            return flow.begin();

        }
    }



});