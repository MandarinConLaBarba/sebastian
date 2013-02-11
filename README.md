    //Use case: define a flow w/ one or more steps

    $.Flow('flowOne')
        .step('one', function() {

        })
        .step('two', function() {

        });

    //Use case: result from previous step passed to next step
    $.Flow('flowOne')
        .step('one', function() {

            return "someResult";

        })
        .step('two', function(arg1) {

            //arg1 === "someResult" //should evaluate true!

        });
    //Use case: on failure matching response jump to another flow
    $.Flow('flowOne')
        .step('one', function() {

        })
        .step('two', function() {

        }).on.failure('someErrorCode').jumpTo('flowTwo');

    //Use case: on failure w/ ANY response jump to another flow
    $.Flow('flowOne')
        .step('one', function() {

        })
        .step('two', function() {

        }).on.failure().jumpTo('flowTwo');
    //Use case: on failure matching response jump to another flow, specific step
    $.Flow('flowOne')
        .step('one', function() {

        })
        .step('two', function() {

        }).on.failure('someErrorCode').jumpTo('flowTwo', 'two');
    //Use case: on failure w/ ANY response jump to another flow, specific step
    $.Flow('flowOne')
        .step('one', function() {

        })
        .step('two', function() {

        }).on.failure().jumpTo('flowTwo', 'two');
    //Use case: begin a flow
    $.Flow('flowOne').begin();
    //Use case: begin a flow while skipping one or more steps
    $.Flow('flowOne').skip('one').begin();
    //Use case: begin a flow at a certain step
    $.Flow('flowOne').begin('two');
    //Use case: fetch a step:
    $.Flow('flowOne').step('one'); //returns the step callback
