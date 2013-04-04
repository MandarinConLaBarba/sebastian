var $ = require('jquery-deferred'),
    sebastian = require('../../sebastian');


var delegate = sebastian.flow("blah.some.sub.flow")
    .step("sub-one", function() {

        console.log("Shallow copies do get cloned:" + this.contextTest);
        console.log("Deep properties don't get cloned:" + this.someObject.someProp);
    });


var flow = sebastian.flow("blah.some.flow")
    .step("one", function(timeOutLen, ctxVal) {

        this.contextTest = ctxVal;
        this.someObject.someProp = ctxVal;

        var def = $.Deferred();

        setTimeout(function() {

            def.reject("someFailure");

        }, timeOutLen);

        return def;


    })
    .step("two", function() {

    })
    .onFailure("someFailure")
    .jumpTo(delegate);

var context = {
    someObject : {
        "someProp" : "someVal"
    }
};

flow.context(context)
    .begin(1000, "contextValue1");


flow.context(context)
    .begin(10, "contextValue2");