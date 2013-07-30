define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {

    return {
        execute : function(demoContainer) {

            var flow = sebastian.flow("examples.create")
                .step("one", function() {
                    helper.appendSuccessMessage.call(demoContainer,
                        "this.someData value: " + this.someData);
                });

            //Create a flow/executor
            var executor = flow.create();

            executor
                .context({
                    someData : "flowContextOne"
                })
                .execute();


            var executor2 = flow.create();

            //someData variable for first execution will not be overwritten
            return executor2
                .context({
                    someData : "flowContextTwo"
                })
                .execute();

        }
    };



});