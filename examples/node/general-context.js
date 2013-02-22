var $ = require("jquery-deferred"),
    flow = require("../../sebastian").flow;

flow("examples.flow.withContext")
    .step("one", function() {
        console.log("one..");
        console.log("Value of this.someProperty: " + this.someProperty);
    })
    .step("two", function() {
        console.log("two..");
    })
    .context({
        "someProperty" : "someData"
    })
    .begin();
