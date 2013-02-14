# Sebastian

##Intro

Sebastian is a flow control library aimed at encouraging developers to write organized, testable code. It works in the browser
or with Node.js.

## Rationale

There are many flow-control libraries out there, but none that I am quite satisfied with at the moment. [Async](https://github.com/caolan/async)
is great, but I don't agree with Node.js-style callback conventions and I don't like mixing success and error condition
logic. Also, I have found Async-wrapped code to be difficult to test. Sebastian is built to encourage construction of discrete chunks
of manageable code that can be easily tested. I'm a big fan of Deferreds. Sebastian uses jQuery Deferred $.when() wrapper
to treat asynchronous and synchronous steps/code the same.

## Dependencies

* For Node.js, [jquery-deferred](https://github.com/zzdhidden/node-jquery-deferred), but Q support may be added at a later date.
* For browser environments, jQuery.

## Getting started

### To use as a Node.js module, install with NPM, or add as a dependency in your package.json.

```
npm install sebastian
```

Then, require the module and add a flow:

```
var flow = require("sebastian").flow;

flow("helloFlow")
    .step("one", function() {
        console.log("hello..");
    }).step("two", function() {
        console.log("hello 2..");
    }).begin();
```

This creates a flow called "helloFlow", adds to steps two the flow, and starts the flow.

### To use with an AMD module loader (only tested w/ RequireJS):

```
    require(["jquery", "path/to/sebastian"], function($, sebastian) {

        //call the local definition
        sebastian.flow("blah")
                .step("one", function() {
                    console.log("step one..");
                })
                .step("two", function() {
                    console.log("step two..");
                })
                .begin();

    });
```

### To use with old-school sequential script tags:

```
<script type="text/javascript" src="vendor/jquery/jquery.min.js"></script>
<script type="text/javascript" src="/sebastian.js"></script>

<script type="text/javascript">

    $.Flow("firstFlow")
            .step("one", function() {
                console.log("executing step one in firstFlow...");
            })
            .step("two", function() {
                console.log("executing step two in firstFlow...");
            }).begin();


</script>

```

## Tests/Specs

* [Tests](test/index.js)
* [Specs](test/spec.md)

## Examples

To see all examples (Node.js) go [here](examples/node/)

### To execute units of code sequentially:

When flow is executed sequentially, result from each step is passed on to the next step.

```
    flow("mockAsyncFlow")
            .step("one", function() {
                var deferred = $.Deferred();
                setTimeout(function() {
                    console.log("step 1...");
                    deferred.resolve();
                }, 301);

                return deferred;

            })
            .step("two", function() {
                var deferred = $.Deferred();
                setTimeout(function() {
                    console.log("step 2...");
                    deferred.resolve();
                }, 200);

                return deferred;
            })
            .step("three", function() {
                var deferred = $.Deferred();
                setTimeout(function() {
                    console.log("step 3...");
                    deferred.resolve();
                }, 100);

                return deferred;
            })
            .begin();

```

### To execute units of code in parallel:

```
    flow("mockAsyncFlow")
            .step("one", function() {
                var deferred = $.Deferred();
                setTimeout(function() {
                    console.log("step 1...");
                    deferred.resolve();
                }, 301);

                return deferred;

            })
            .step("two", function() {
                var deferred = $.Deferred();
                setTimeout(function() {
                    console.log("step 2...");
                    deferred.resolve();
                }, 200);

                return deferred;
            })
            .step("three", function() {
                var deferred = $.Deferred();
                setTimeout(function() {
                    console.log("step 3...");
                    deferred.resolve();
                }, 100);

                return deferred;
            })
            .parallel()
            .begin();
```

### To skip a step in a flow:

```

    flow("someFlow")
        .step("one", function() {
            console.log("one..");
        })
        .step("two", function() {
            console.log("two..");
        })
        .step("three", function() {
            console.log("three..");
        });

    flow("someFlow")
        .skip("one")
        .begin();

```

### To skip more than one step in a flow:

```
    flow("someFlow")
            .step("one", function() {
                console.log("one..");
            })
            .step("two", function() {
                console.log("two..");
            })
            .step("three", function() {
                console.log("three..");
            });

    flow("someFlow")
        .skip("one")
        .skip("two")
        .begin();

```

### To start a flow on a specific step:
```
    flow("someFlow")
            .step("one", function() {
                console.log("one..);
            })
            .step("two", function() {
                console.log("two..);
            })
            .step("three", function() {
                console.log("three..);
            });

    flow("someFlow")
        .startOn("two")
        .begin();

```

### To direct flow to another flow when failure occurs:

```
    flow("firstFlow")
            .step("one", function() {
                console.log("executing step one in firstFlow...");
            })
            .step("two", function() {
                console.log("executing step two in firstFlow...");
            });

    flow("secondFlow")
            .step("one", function() {
                console.log("executing step one in second flow...");
                return $.Deferred().reject("blah");
            })
            .step("two", function() {
                console.log("executing step two in second flow...");
            });


    console.log("beginning flow two, chained to one on failure");
    flow("secondFlow").onFailure().jumpTo("firstFlow").begin();

```

### To direct flow to another flow when specific failure occurs:

```
    flow("firstFlow")
            .step("one", function() {
                console.log("executing step one in firstFlow...");
            })
            .step("two", function() {
                console.log("executing step two in firstFlow...");
            });

    flow("secondFlow")
            .step("one", function() {
                console.log("executing step one in second flow...");
                return $.Deferred().reject("blah");
            })
            .step("two", function() {
                console.log("executing step two in second flow...");
            });


    console.log("beginning flow two, chained to one on failure 'blah'");
    flow("secondFlow").onFailure("blah").jumpTo("firstFlow").begin();

```

### To direct flow to another flow when success occurs:

```
    flow("firstFlow")
            .step("one", function() {
                console.log("executing step one in firstFlow...");
            })
            .step("two", function() {
                console.log("executing step two in firstFlow...");
            });

    flow("secondFlow")
            .step("one", function() {
                console.log("executing step one in second flow...");
            })
            .step("two", function() {
                console.log("executing step two in second flow...");
            });


    console.log("beginning flow two, chained to one on success");
    flow("secondFlow").onSuccess().jumpTo("firstFlow").begin();

```

### To to add error handler for specific error:

```
    flow("secondFlow")
            .step("one", function() {
                console.log("executing step one in second flow...");
                return $.Deferred().reject("blah");
            })
            .step("two", function() {
                console.log("executing step two in second flow...");
            });


    console.log("beginning flow two, chained to one on failure 'blah'");
    flow("secondFlow")
        .onFailure("blah")
        .handleWith(function() {
                console.log("it failed!");
            }).begin();

```

### To access a previously defined flow:

```

    flow("someFlow").step("one", function() {});

    var someFlow = flow("someFlow");

    someFlow.begin();

```


### To access a step (useful when unit testing):

```
    flow("someFlow").step("one", function() {});

    var someFlow = flow("someFlow");

    var step = someFlow.step("one");

    var name = step.name; //the step name
    var callback = step.callback; //the actual step function/logic

```









