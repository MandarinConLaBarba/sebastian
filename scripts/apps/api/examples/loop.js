define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {


    return {
        execute : function(el) {

            var deferred = sebastian.flow("examples.loop")
                .step("one", function() {
                    return helper.appendStepCompleteMessage.call(el, "one", 100);

                })
                .step("two", function() {

                    var result = helper.appendStepCompleteMessage.call(el, "two", 100);

                    this.loopCount++;

                    //Limit the # of loops to 3
                    if (this.loopCount >= 3) {
                        helper.appendFailureMessage.call(el, "Flow failed after three executions as intended", 200);
                        return $.Deferred().reject();
                    }

                    return result;

                })
                .context({
                    loopCount : 0
                })
                .loop()
                .begin();

            return deferred;

        }
    };


});