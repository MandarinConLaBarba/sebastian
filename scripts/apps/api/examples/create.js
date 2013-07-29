define([
    "jquery",
    "sebastian"], function(
    $,
    sebastian) {

    var flow = sebastian.flow("examples.create")
        .step("one", function() {
            this.someDate = new Date();
            //do something..
        })
        .step("two", function() {
            //do something else..
        });

    //Create a flow/executor
    var executor = flow.create();

    executor
        .context({})
        .execute();

    var executor2 = flow.create();

    //someData variable for first execution will not be overwritten
    executor2
        .context({})
        .execute();


});