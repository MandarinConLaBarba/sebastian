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

## Documentation

For full documentation, check out the [Sebastian GitHub page](http://mandarinconlabarba.github.com/sebastian/).

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
