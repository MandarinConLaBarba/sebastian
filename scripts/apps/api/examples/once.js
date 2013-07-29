define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {


    var flow = sebastian.flow("examples.once")
        .step("one", function() {

            return helper.appendSuccessMessage.call(this.$el, "This step/flow will only run one time!", 1000);
        })
        .once();

    return flow;


});