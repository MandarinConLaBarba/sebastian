define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {


    var flow = sebastian.flow("examples.onFailure().loop")
        .step("one", function() {
            return helper.appendStepCompleteMessage.call(this.$el, "one", 1000);

        })
        .step("two", function() {

            helper.appendMessage.call(this.$el, "Entering step two...");
            if (typeof this.loopCount == "undefined") {
                this.loopCount = 0;
            }

            this.loopCount++;

            //Limit the # of loops to 3
            if (this.loopCount >= 3) {
                return $.Deferred().reject("timeoutFailureCode");
            }

            return $.Deferred().reject("someFailureCode");

        })
        .onFailure("someFailureCode").loop();

    return flow;


});