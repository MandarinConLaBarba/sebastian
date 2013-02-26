var $ = require("jquery-deferred"),
    flow = require("../../sebastian").flow;

flow("examples.flow.terminal")
    .step("one", function() {
        console.log("executing step one in examples.flow.terminal...");
    })
    .step("two", function() {
        console.log("executing step two in examples.flow.terminal...");
        return "this should be in return value";
    });

flow("examples.flow.one")
    .step("one", function() {
        console.log("executing step one in examples.flow.one...");
    })
    .step("two", function() {
        console.log("executing step two in examples.flow.one...");
        return "this should ALSO NOT be in return value";
    })
    .onSuccess()
    .jumpTo("examples.flow.terminal");

flow("examples.flow.two")
    .step("one", function() {
        console.log("executing step one in examples.flow.two...");
    })
    .step("two", function() {
        console.log("executing step two in examples.flow.two...");
        return "this should NOT be in return value";
    });

var promise = flow("examples.flow.two")
    .onSuccess()
    .jumpTo("examples.flow.one")
    .begin();


promise.then(function(result) {
    console.log(result);
});

