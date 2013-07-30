define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {


    return {
        execute : function(el) {

            return sebastian.flow("examples.parallel")
                .step("one", function() {

                    return helper.appendSuccessMessage.call(el,
                        "Step one should finish last.", 1000);
                })
                .step("two", function() {

                    return helper.appendSuccessMessage.call(el,
                        "Step two should finish first.", 200);

                })
                .step("three", function() {

                    return helper.appendSuccessMessage.call(el,
                        "Step three should finish second.", 500);

                })
                .parallel()
                .begin();

        }
    };


});