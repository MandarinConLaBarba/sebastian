define([
    "jquery",
    "sebastian",
    "apps/api/examples/helper"], function(
    $,
    sebastian,
    helper) {

    return {
        execute : function(el) {

            var flow = sebastian.flow("examples.create")
                .step("one", function() {
                    helper.appendSuccessMessage.call(el,
                        "this.someData value: " + this.someData);
                });

            //Create a flow/execution
            var execution = flow.create();

            execution
                .context({
                    someData : "Data that is private to execution <u>one</u> of flow " + flow.name
                })
                .execute();

            //Create another flow/execution
            var execution = flow.create();

            //someData variable for first execution will not be overwritten
            return execution
                .context({
                    someData : "Data that is private to execution <u>two</u> of flow " + flow.name
                })
                .execute();

        }
    };



});