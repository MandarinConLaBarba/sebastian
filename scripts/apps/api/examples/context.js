define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {

    var flow = sebastian.flow("examples.context")
        .step("one", function() {

            return helper.appendSuccessMessage.call(this.$el,
                "This step has the this.someVariable as " + this.someVariable);

        })
        .context({
            someVariable : "myData"
        });

    return flow;

});