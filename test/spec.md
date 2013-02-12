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

