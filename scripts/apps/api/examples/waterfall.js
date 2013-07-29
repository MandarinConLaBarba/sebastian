define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {


    var flow = sebastian.flow("examples.waterfall")
        .step("one", function() {

            return helper.appendStepCompleteMessage.call(this.$el, "one", 500);

        })
        .step("two", function() {

            var deferred = $.Deferred();

            helper.appendStepCompleteMessage.call(this.$el, "two", 500)
                .then(function() {
                    deferred.resolve("stepTwoResult");
                });

            return deferred;
        })
        .step("three", function(stepOneArg) {

            return helper.appendSuccessMessage.call(this.$el,
                "Step three completed, received arg " + stepOneArg + " from previous step.", 500);

        });

    return flow;


})