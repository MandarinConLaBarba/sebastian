define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {

    return {
        execute : function(el) {

            return sebastian.flow("examples.once")
                .step("one", function() {

                    return helper.appendSuccessMessage.call(el,
                        "This step/flow will only run one time!", 1000);
                })
                .once()
                .begin();

        }
    };




});