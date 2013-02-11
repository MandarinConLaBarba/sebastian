# jquery.flow - better name hopefully forthcoming

##Intro

jquery.flow is a flow control library aimed at encouraging developers to write organized, testable code.

##Examples/Use Cases

###Use case: define a flow w/ one or more steps

```
    $.Flow('flowOne')
        .step('one', function() {

        })
        .step('two', function() {

        });
```

###Use case: result from previous step passed to next step

```
    $.Flow('flowOne')
        .step('one', function() {

            return "someResult";

        })
        .step('two', function(arg1) {

            //arg1 === "someResult" //should evaluate true!

        });
```

###Use case: on failure matching response jump to another flow

```
    $.Flow('flowOne')
        .step('one', function() {

        })
        .step('two', function() {

        }).onFailure('someErrorCode').jumpTo('flowTwo');
```

###Use case: on failure w/ ANY response jump to another flow

```
    $.Flow('flowOne')
        .step('one', function() {

        })
        .step('two', function() {

        }).onFailure().jumpTo('flowTwo');
```

###Use case: on failure matching response jump to another flow, specific step

```
    $.Flow('flowOne')
        .step('one', function() {

        })
        .step('two', function() {

        }).onFailure('someErrorCode').jumpTo('flowTwo', 'two');
```

###TBD - Use case: on failure w/ ANY response jump to another flow, specific step

```
    $.Flow('flowOne')
        .step('one', function() {

        })
        .step('two', function() {

        }).onFailure().jumpTo('flowTwo', 'two');
```

###Use case: begin a previously defined flow

```
    $.Flow('flowOne').begin();
```

###Use case: begin a flow while skipping one or more steps
```
    $.Flow('flowOne')
        .skip('one')
        .skip('two')
        .begin();
```

###Use case: begin a flow at a certain step
```
    $.Flow('flowOne')
        .startOn('two')
        .begin();
```

###Use case: fetch a previously defined step (for testing purposes):
```
    $.Flow('flowOne').step('one'); //returns the step
```
