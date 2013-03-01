# TOC
   - [flow](#flow)
     - [step](#flow-step)
       - [in general](#flow-step-in-general)
       - [when one argument passed](#flow-step-when-one-argument-passed)
         - [when the argument is a string](#flow-step-when-one-argument-passed-when-the-argument-is-a-string)
         - [when the argument is a function](#flow-step-when-one-argument-passed-when-the-argument-is-a-function)
         - [when the argument is another flow](#flow-step-when-one-argument-passed-when-the-argument-is-another-flow)
           - [the step callback](#flow-step-when-one-argument-passed-when-the-argument-is-another-flow-the-step-callback)
       - [when two arguments passed](#flow-step-when-two-arguments-passed)
         - [when the second argument is a function](#flow-step-when-two-arguments-passed-when-the-second-argument-is-a-function)
         - [when second argument is a string](#flow-step-when-two-arguments-passed-when-second-argument-is-a-string)
         - [when the second argument is a flow](#flow-step-when-two-arguments-passed-when-the-second-argument-is-a-flow)
     - [begin](#flow-begin)
       - [when a context is specified](#flow-begin-when-a-context-is-specified)
       - [when there are no steps in the flow](#flow-begin-when-there-are-no-steps-in-the-flow)
       - [when there are steps in the flow](#flow-begin-when-there-are-steps-in-the-flow)
         - [when arguments are passed](#flow-begin-when-there-are-steps-in-the-flow-when-arguments-are-passed)
           - [when flow execution mode is waterfall](#flow-begin-when-there-are-steps-in-the-flow-when-arguments-are-passed-when-flow-execution-mode-is-waterfall)
           - [when flow execution mode is parallel](#flow-begin-when-there-are-steps-in-the-flow-when-arguments-are-passed-when-flow-execution-mode-is-parallel)
       - [when there is only one step in the flow](#flow-begin-when-there-is-only-one-step-in-the-flow)
       - [when there are two or more steps in the flow](#flow-begin-when-there-are-two-or-more-steps-in-the-flow)
         - [and the execution mode is not specified](#flow-begin-when-there-are-two-or-more-steps-in-the-flow-and-the-execution-mode-is-not-specified)
         - [and the execution mode is parallel](#flow-begin-when-there-are-two-or-more-steps-in-the-flow-and-the-execution-mode-is-parallel)
         - [and a startOn step has been specified](#flow-begin-when-there-are-two-or-more-steps-in-the-flow-and-a-starton-step-has-been-specified)
         - [and a skip step has been specified](#flow-begin-when-there-are-two-or-more-steps-in-the-flow-and-a-skip-step-has-been-specified)
     - [startOn](#flow-starton)
     - [skip](#flow-skip)
     - [waterfall](#flow-waterfall)
     - [parallel](#flow-parallel)
     - [onFailure](#flow-onfailure)
       - [loop](#flow-onfailure-loop)
         - [when there is an onFailure argument](#flow-onfailure-loop-when-there-is-an-onfailure-argument)
         - [when there is NOT an onFailure argument](#flow-onfailure-loop-when-there-is-not-an-onfailure-argument)
       - [jumpTo](#flow-onfailure-jumpto)
         - [when there is an argument to onFailure](#flow-onfailure-jumpto-when-there-is-an-argument-to-onfailure)
         - [when there is NOT an argument to onFailure](#flow-onfailure-jumpto-when-there-is-not-an-argument-to-onfailure)
     - [modes](#flow-modes)
       - [waterfall](#flow-modes-waterfall)
         - [when third argument is not empty](#flow-modes-waterfall-when-third-argument-is-not-empty)
         - [when all steps resolve](#flow-modes-waterfall-when-all-steps-resolve)
       - [parallel](#flow-modes-parallel)
         - [when all steps resolve](#flow-modes-parallel-when-all-steps-resolve)
         - [when all steps reject](#flow-modes-parallel-when-all-steps-reject)
         - [when third argument is not empty](#flow-modes-parallel-when-third-argument-is-not-empty)
     - [attachFailDelegate](#flow-attachfaildelegate)
       - [when conditionalFailDelegates is truthy](#flow-attachfaildelegate-when-conditionalfaildelegates-is-truthy)
         - [when the fail callback is fired](#flow-attachfaildelegate-when-conditionalfaildelegates-is-truthy-when-the-fail-callback-is-fired)
           - [when no conditionalFailDelegate is matched using the fail callback response data](#flow-attachfaildelegate-when-conditionalfaildelegates-is-truthy-when-the-fail-callback-is-fired-when-no-conditionalfaildelegate-is-matched-using-the-fail-callback-response-data)
             - [when there is a defaultFailDelegate](#flow-attachfaildelegate-when-conditionalfaildelegates-is-truthy-when-the-fail-callback-is-fired-when-no-conditionalfaildelegate-is-matched-using-the-fail-callback-response-data-when-there-is-a-defaultfaildelegate)
               - [when defaultFailDelegate is a flow object](#flow-attachfaildelegate-when-conditionalfaildelegates-is-truthy-when-the-fail-callback-is-fired-when-no-conditionalfaildelegate-is-matched-using-the-fail-callback-response-data-when-there-is-a-defaultfaildelegate-when-defaultfaildelegate-is-a-flow-object)
               - [when defaultFailDelegate is a string](#flow-attachfaildelegate-when-conditionalfaildelegates-is-truthy-when-the-fail-callback-is-fired-when-no-conditionalfaildelegate-is-matched-using-the-fail-callback-response-data-when-there-is-a-defaultfaildelegate-when-defaultfaildelegate-is-a-string)
             - [when there is NOT a defaultFailDelegate](#flow-attachfaildelegate-when-conditionalfaildelegates-is-truthy-when-the-fail-callback-is-fired-when-no-conditionalfaildelegate-is-matched-using-the-fail-callback-response-data-when-there-is-not-a-defaultfaildelegate)
<a name="" />
 
<a name="flow" />
# flow
<a name="flow-step" />
## step
<a name="flow-step-in-general" />
### in general
should return the flow object.

```js
this.result.should.equal(target);
```

<a name="flow-step-when-one-argument-passed" />
### when one argument passed
<a name="flow-step-when-one-argument-passed-when-the-argument-is-a-string" />
#### when the argument is a string
should return the step.

```js
this.result.callback.should.equal(this.stepOneCallback);
```

should not add a step to the steps array.

```js
target.steps.length.should.equal(1);
```

<a name="flow-step-when-one-argument-passed-when-the-argument-is-a-function" />
#### when the argument is a function
should create a new object in the steps array with a name in format of 'step.{length}'.

```js
var self = this;
                        var found = _.find(target.steps, function(step) {
                            return step.callback === self.stepCallback;
                        });

                        found.name.should.equal("step." + (target.steps.length));
```

<a name="flow-step-when-one-argument-passed-when-the-argument-is-another-flow" />
#### when the argument is another flow
should create a new object in the steps array with a name in the format of 'step.{length}.{flow.name}'.

```js
var self = this;
                        var found = _.find(target.steps, function(step, index) {
                            return step.name === "step." + (index+1) + "." + self.flowStep.name;
                        });

                        should.exist(found);
```

<a name="flow-step-when-one-argument-passed-when-the-argument-is-another-flow-the-step-callback" />
##### the step callback
should call the flow's begin method.

```js
this.flowStep.begin.called.should.be.true;
```

should return the result of the flow's begin method.

```js
this.result.should.equal("somePromise");
```

<a name="flow-step-when-two-arguments-passed" />
### when two arguments passed
<a name="flow-step-when-two-arguments-passed-when-the-second-argument-is-a-function" />
#### when the second argument is a function
should create a new object in the steps array with a name.

```js
this.found.name.should.equal("one");
```

should create a new object in the steps array with a callback.

```js
this.found.callback();

                        this.callbackStub.called.should.be.true;
```

<a name="flow-step-when-two-arguments-passed-when-second-argument-is-a-string" />
#### when second argument is a string
should create a new object in the steps array with the name.

```js
this.found.name.should.equal("one");
```

should create a new object in the steps array with a callback that calls the begin method on the flow with name matching the second argument.

```js
this.found.callback();

                        this.flowStep.begin.called.should.be.true;
```

<a name="flow-step-when-two-arguments-passed-when-the-second-argument-is-a-flow" />
#### when the second argument is a flow
should create a new object in the steps array with a name.

```js
this.found.name.should.equal("one");
```

should create a new object in the steps array with a callback that calls the flow's begin method.

```js
this.found.callback();

                        this.flowStep.begin.called.should.be.true;
```

<a name="flow-begin" />
## begin
<a name="flow-begin-when-a-context-is-specified" />
### when a context is specified
should call the steps on the ctx argument.

```js
target.step("one").callback.calledOn(this.ctx).should.be.true;
```

<a name="flow-begin-when-there-are-no-steps-in-the-flow" />
### when there are no steps in the flow
should return a rejected deferred.

```js
this.result.state().should.equal("rejected");

                    this.result.fail(function(result) {
                        result.should.equal("There are no steps to execute in current execution plan.")
                    })
```

<a name="flow-begin-when-there-are-steps-in-the-flow" />
### when there are steps in the flow
<a name="flow-begin-when-there-are-steps-in-the-flow-when-arguments-are-passed" />
#### when arguments are passed
<a name="flow-begin-when-there-are-steps-in-the-flow-when-arguments-are-passed-when-flow-execution-mode-is-waterfall" />
##### when flow execution mode is waterfall
should pass the arguments to the waterfall mode handler.

```js
var args = wrappedStubs.waterfallMode.firstCall.args[2];

                            args[0].should.equal(this.arg1);
                            args[1].should.equal(this.arg2);
```

<a name="flow-begin-when-there-are-steps-in-the-flow-when-arguments-are-passed-when-flow-execution-mode-is-parallel" />
##### when flow execution mode is parallel
should pass the arguments to the parallel mode handler.

```js
var args = wrappedStubs.parallelMode.firstCall.args[2];

                            args[0].should.equal(this.arg1);
                            args[1].should.equal(this.arg2);
```

<a name="flow-begin-when-there-is-only-one-step-in-the-flow" />
### when there is only one step in the flow
should execute the step.

```js
target.step("one").callback.called.should.be.true;
```

should not call waterfall or parallel methods.

```js
target.modes.waterfall.called.should.be.false;
                    target.modes.parallel.called.should.be.false;
```

should call attachFailCallback.

```js
target.attachFailCallback.called.should.be.true;
```

should call attachFailDelegate.

```js
target.attachFailDelegate.called.should.be.true;
```

should call attachSuccessDelegate.

```js
target.attachSuccessDelegate.called.should.be.true;
```

<a name="flow-begin-when-there-are-two-or-more-steps-in-the-flow" />
### when there are two or more steps in the flow
<a name="flow-begin-when-there-are-two-or-more-steps-in-the-flow-and-the-execution-mode-is-not-specified" />
#### and the execution mode is not specified
should execute the steps in sequence (waterfall mode).

```js
target.modes.waterfall.called.should.be.true;
```

should NOT execute the steps in parallel (parallel mode).

```js
target.modes.parallel.called.should.be.false;
```

should call attachFailCallback.

```js
target.attachFailCallback.called.should.be.true;
```

should call attachFailDelegate.

```js
target.attachFailDelegate.called.should.be.true;
```

should call attachSuccessDelegate.

```js
target.attachSuccessDelegate.called.should.be.true;
```

<a name="flow-begin-when-there-are-two-or-more-steps-in-the-flow-and-the-execution-mode-is-parallel" />
#### and the execution mode is parallel
should NOT execute the steps in sequence (waterfall mode).

```js
target.modes.waterfall.called.should.be.false;
```

should execute the steps in parallel (parallel mode).

```js
target.modes.parallel.called.should.be.true;
```

should call attachFailCallback.

```js
target.attachFailCallback.called.should.be.true;
```

should call attachFailDelegate.

```js
target.attachFailDelegate.called.should.be.true;
```

should call attachSuccessDelegate.

```js
target.attachSuccessDelegate.called.should.be.true;
```

<a name="flow-begin-when-there-are-two-or-more-steps-in-the-flow-and-a-starton-step-has-been-specified" />
#### and a startOn step has been specified
should NOT execute steps before the startOn step.

```js
target.step("one").callback.called.should.be.false;
```

should execute steps on or after the startOn step.

```js
target.step("two").callback.called.should.be.true;
```

<a name="flow-begin-when-there-are-two-or-more-steps-in-the-flow-and-a-skip-step-has-been-specified" />
#### and a skip step has been specified
should NOT execute the skipped step.

```js
target.step("two").callback.called.should.be.false;
```

should execute steps that were not skipped.

```js
target.step("one").callback.called.should.be.true;
```

<a name="flow-starton" />
## startOn
should set the startingStep property.

```js
target.startingStep.should.equal("someStepName");
```

should return the flow.

```js
target.should.equal(this.result);
```

<a name="flow-skip" />
## skip
should push the skipped step name to the skipSteps property.

```js
target.skipSteps.indexOf("someSkippedStep").should.not.be.below(0);
```

should return the flow.

```js
this.result.should.equal(this.result);
```

<a name="flow-waterfall" />
## waterfall
should set the mode property to waterfall.

```js
target.mode.should.equal("waterfall");
```

should return the flow.

```js
this.result.should.equal(this.result);
```

<a name="flow-parallel" />
## parallel
should set the mode property to parallel.

```js
target.mode.should.equal("parallel");
```

should return the flow.

```js
this.result.should.equal(this.result);
```

<a name="flow-onfailure" />
## onFailure
<a name="flow-onfailure-loop" />
### loop
<a name="flow-onfailure-loop-when-there-is-an-onfailure-argument" />
#### when there is an onFailure argument
should itself to the conditionalFailDelegates object.

```js
target.conditionalFailDelegates.blah.should.equal(target);
```

<a name="flow-onfailure-loop-when-there-is-not-an-onfailure-argument" />
#### when there is NOT an onFailure argument
should set the defaultFailDelegate.

```js
target.defaultFailDelegate.should.equal(target);
```

<a name="flow-onfailure-jumpto" />
### jumpTo
<a name="flow-onfailure-jumpto-when-there-is-an-argument-to-onfailure" />
#### when there is an argument to onFailure
should add an object to the conditionalFailDelegates object.

```js
target.conditionalFailDelegates.blah.should.equal(flow("secondFlow"));
```

<a name="flow-onfailure-jumpto-when-there-is-not-an-argument-to-onfailure" />
#### when there is NOT an argument to onFailure
should set the defaultFailDelegate.

```js
target.defaultFailDelegate.should.equal(flow("secondFlow"));
```

<a name="flow-modes" />
## modes
<a name="flow-modes-waterfall" />
### waterfall
should not call downstream steps until upstream steps are resolved.

```js
var stepOneDeferred = $.Deferred(),
                        stepTwoDeferred = $.Deferred();

                    this.stubbedSteps.one.returns(stepOneDeferred);
                    this.stubbedSteps.two.returns(stepTwoDeferred);

                    target.modes.waterfall(null, this.stepsToExecute);

                    this.stubbedSteps.two.called.should.be.false;

                    stepOneDeferred.resolve();

                    this.stubbedSteps.two.called.should.be.true;
```

should not call downstream steps if upstream steps rejected.

```js
var stepOneDeferred = $.Deferred(),
                        stepTwoDeferred = $.Deferred();

                    this.stubbedSteps.one.returns(stepOneDeferred);
                    this.stubbedSteps.two.returns(stepTwoDeferred);

                    target.modes.waterfall(null, this.stepsToExecute);

                    this.stubbedSteps.two.called.should.be.false;

                    stepOneDeferred.reject();

                    this.stubbedSteps.one.called.should.be.true;
                    this.stubbedSteps.two.called.should.be.false;
```

should pass single result argument from upstream step to downstream step.

```js
var stepOneDeferred = $.Deferred(),
                        stepTwoDeferred = $.Deferred();

                    this.stubbedSteps.one.returns(stepOneDeferred);
                    this.stubbedSteps.two.returns(stepTwoDeferred);

                    target.modes.waterfall(null, this.stepsToExecute);

                    this.stubbedSteps.two.called.should.be.false;

                    stepOneDeferred.resolve("someArg");

                    this.stubbedSteps.two.calledWith("someArg").should.be.true;
```

should pass multiple result arguments from upstream step to downstream step.

```js
var stepOneDeferred = $.Deferred(),
                        stepTwoDeferred = $.Deferred();

                    this.stubbedSteps.one.returns(stepOneDeferred);
                    this.stubbedSteps.two.returns(stepTwoDeferred);

                    target.modes.waterfall(null, this.stepsToExecute);

                    this.stubbedSteps.two.called.should.be.false;

                    stepOneDeferred.resolve("someArg", "someArg2");

                    this.stubbedSteps.two.firstCall.args[0].should.equal("someArg");
                    this.stubbedSteps.two.firstCall.args[1].should.equal("someArg2");
```

<a name="flow-modes-waterfall-when-third-argument-is-not-empty" />
#### when third argument is not empty
should pass third arguments to first step.

```js
var passedArgs = this.stubbedSteps.one.firstCall.args;

                        passedArgs[0].should.equal(this.arg1);
                        passedArgs[1].should.equal(this.arg2);
```

should NOT pass third arguments to second step.

```js
var passedArgs = this.stubbedSteps.two.firstCall.args;

                        passedArgs.length.should.equal(0);
```

<a name="flow-modes-waterfall-when-all-steps-resolve" />
#### when all steps resolve
should call all steps.

```js
_.each(this.stubbedSteps, function(stub) {
                            stub.called.should.be.true;
                        });
```

should call the steps in order.

```js
this.stubbedSteps.one.calledBefore(this.stubbedSteps.two);
```

<a name="flow-modes-parallel" />
### parallel
<a name="flow-modes-parallel-when-all-steps-resolve" />
#### when all steps resolve
should call all steps.

```js
_.each(this.stubbedSteps, function(stub) {
                            stub.called.should.be.true;
                        });
```

<a name="flow-modes-parallel-when-all-steps-reject" />
#### when all steps reject
should call all steps.

```js
_.each(this.stubbedSteps, function(stub) {
                            stub.called.should.be.true;
                        });
```

<a name="flow-modes-parallel-when-third-argument-is-not-empty" />
#### when third argument is not empty
should pass third arguments to first step.

```js
var passedArgs = this.stubbedSteps.one.firstCall.args;

                        passedArgs[0].should.equal(this.arg1);
                        passedArgs[1].should.equal(this.arg2);
```

should pass third arguments to second step.

```js
var passedArgs = this.stubbedSteps.two.firstCall.args;

                        passedArgs[0].should.equal(this.arg1);
                        passedArgs[1].should.equal(this.arg2);
```

<a name="flow-attachfaildelegate" />
## attachFailDelegate
<a name="flow-attachfaildelegate-when-conditionalfaildelegates-is-truthy" />
### when conditionalFailDelegates is truthy
should call the fail method on the promise argument.

```js
target.attachFailDelegate.call(this.context, this.promise);

                    this.promise.fail.called.should.be.true;
```

<a name="flow-attachfaildelegate-when-conditionalfaildelegates-is-truthy-when-the-fail-callback-is-fired" />
#### when the fail callback is fired
<a name="flow-attachfaildelegate-when-conditionalfaildelegates-is-truthy-when-the-fail-callback-is-fired-when-no-conditionalfaildelegate-is-matched-using-the-fail-callback-response-data" />
##### when no conditionalFailDelegate is matched using the fail callback response data
<a name="flow-attachfaildelegate-when-conditionalfaildelegates-is-truthy-when-the-fail-callback-is-fired-when-no-conditionalfaildelegate-is-matched-using-the-fail-callback-response-data-when-there-is-a-defaultfaildelegate" />
###### when there is a defaultFailDelegate
<a name="flow-attachfaildelegate-when-conditionalfaildelegates-is-truthy-when-the-fail-callback-is-fired-when-no-conditionalfaildelegate-is-matched-using-the-fail-callback-response-data-when-there-is-a-defaultfaildelegate-when-defaultfaildelegate-is-a-flow-object" />
####### when defaultFailDelegate is a flow object
should call the begin method on the flow with name that matches defaultFailDelegate.

```js
this.delegateFlow.begin.called.should.be.true;
```

should resolve the masterPromise when the delegate flow is resolved.

```js
this.delegateFlowPromise.then.callsArg(0);

                                    target.attachFailDelegate.call(this.context, this.promise);

                                    this.context.masterPromise.resolve.called.should.be.true;
```

<a name="flow-attachfaildelegate-when-conditionalfaildelegates-is-truthy-when-the-fail-callback-is-fired-when-no-conditionalfaildelegate-is-matched-using-the-fail-callback-response-data-when-there-is-a-defaultfaildelegate-when-defaultfaildelegate-is-a-string" />
####### when defaultFailDelegate is a string
should call the begin method on the flow with name that matches defaultFailDelegate.

```js
this.delegateFlow.begin.called.should.be.true;
```

<a name="flow-attachfaildelegate-when-conditionalfaildelegates-is-truthy-when-the-fail-callback-is-fired-when-no-conditionalfaildelegate-is-matched-using-the-fail-callback-response-data-when-there-is-not-a-defaultfaildelegate" />
###### when there is NOT a defaultFailDelegate
should reject the master promise.

```js
this.context.masterPromise.reject.called.should.be.true;
```

should reject the master promise with the promise failure result.

```js
this.context.masterPromise.reject.firstCall.args[0]
                                    .should.equal(this.failValue);
```

