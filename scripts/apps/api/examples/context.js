define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {

    return {
        execute : function(el) {
            var flow = sebastian.flow("examples.context")
                .step("one", function() {

                    return helper.appendSuccessMessage.call(el,
                        "This step has this.someVariable as " + this.someVariable);

                })
                .context({
                    someVariable : "myData"
                });

            return flow.begin();

        }
    };

});