# TOC
   - [flow](#flow)
     - [begin](#flow-begin)
       - [when there are no steps in the flow](#flow-begin-when-there-are-no-steps-in-the-flow)
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
     - [modes](#flow-modes)
       - [waterfall](#flow-modes-waterfall)
         - [when all steps resolve](#flow-modes-waterfall-when-all-steps-resolve)
<a name="" />
 
<a name="flow" />
# flow
<a name="flow-begin" />
## begin
<a name="flow-begin-when-there-are-no-steps-in-the-flow" />
### when there are no steps in the flow
should return a rejected deferred.

```js
this.result.state().should.equal("rejected");

                this.result.fail(function(result) {
                    result.should.equal("There are no steps to execute in current execution plan.")
                })
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

