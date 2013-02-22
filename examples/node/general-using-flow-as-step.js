var $ = require("jquery-deferred"),
    flow = require("../../sebastian").flow;


flow("examples.flow.one")
    .step("one", function() {

        console.log("flow one, step one..");
        console.log("arguments:");
        console.log(arguments);

    }).
    step("two", function() {

        console.log("flow one, step two..");
        console.log("arguments:");
        console.log(arguments);


    })
    .parallel();

//Example passing the flow object:
flow("examples.flow.two")
    .step("one", function() {
        console.log("flow two, step one..");
    }).
    step("two", flow("examples.flow.one"))
    .begin();

//Reset
flow("examples.flow.two").destroy();

//Example passing the flow name:
flow("examples.flow.two")
    .step("one", function() {
        console.log("flow two, step one..");
    }).
    step("two", "examples.flow.one")
    .begin();

//Reset
flow("examples.flow.two").destroy();

//Showing that arguments returned from step one are passed to step two flow
flow("examples.flow.two")
    .step("one", function() {
        console.log("flow two, step one..");

        return $.Deferred().resolve("blah");
    }).
    step("two", "examples.flow.one")
    .begin();
