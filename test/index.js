(function(root, enqueue) {
    // Set up appropriately for the environment.
    if (typeof exports !== 'undefined') {
        // Node/CommonJS, need jQuery-deferred instead of regular jQuery
        enqueue(
            require('jquery-deferred'),
            require("underscore"),
            require('sinon'),
            require('should'),
            require('../sebastian').flow);
    } else if (typeof define === 'function' && define.amd) {

        // AMD/Testacular
        define(['jquery', 'underscore', 'sinon', 'chai', 'sebastian'], function($, _, sinon, chai, sebastian) {
            enqueue($, _, sinon, chai.Should(), sebastian.flow);

        });
    }
}(this, function($, _, sinon, should, flow) {


    var getStubbedFlow = function(name) {

        var delegateFlow = flow(name);

        sinon.stub(delegateFlow, "context");
        sinon.stub(delegateFlow, "begin");

        var delegateFlowPromise = {
            then : sinon.stub(),
            fail : sinon.stub()
        };

        delegateFlow.context.returns(delegateFlow);
        delegateFlow.begin.returns(delegateFlowPromise);
        delegateFlow.flow = true;

        return delegateFlow;

    };

    describe("flow", function(){

        var wrappedStubs = {},
            resolved = $.Deferred().resolve(),
            rejected = $.Deferred().reject(),
            target,
            execution;

        beforeEach(function() {

            target = flow("someFlow");
            execution = target.internals.execution.prototype;


        });

        afterEach(function() {

            _.invoke(wrappedStubs, 'restore');

        });

        describe("integration", function(){

            describe("when a flow has 'once' modifier", function(){

                beforeEach(function() {
                    target = flow("run.only.once")
                        .step("step.0", sinon.stub())
                        .once();

                });

                describe("and the begin method is called twice", function(){

                    beforeEach(function() {
                        this.stepZeroReturnValue = $.Deferred();
                        target.step("step.0").callback.returns(this.stepZeroReturnValue);

                        this.result1 =  target.begin();
                        this.result2 = target.begin();

                    });

                    describe("and the first flow execution is still in progress", function(){

                        it("should return the same promise", function(){

                            this.result1.should.equal(this.result2);

                        });

                    });

                    describe("and the first flow execution is NOT still in progress", function(){

                        beforeEach(function() {
                            this.stepZeroReturnValue.resolve();
                        });

                        it("should return the same promise result returned from the first execution", function(){

                            this.result1.should.equal(this.result2);

                        });

                    });


                });


            });

            describe("when a flow of different name is already running", function(){

                beforeEach(function() {

                    target.step("step.0", sinon.stub());
                    target.step("step.0").callback.returns($.Deferred());

                    this.result = target.begin();
                    var differentFlow = flow("a.different.flow")
                        .step("step.0", sinon.stub());
                    differentFlow.step("step.0").callback.returns($.Deferred());
                    this.result2 = differentFlow.begin();

                });

                it("should NOT return the promise from the first flow", function(){

                    this.result.should.not.equal(this.result2);

                });


            });

            describe("when a flow of same name is run twice", function(){

                beforeEach(function() {

                    target.step("step.0", sinon.stub());
                    target.step("step.0").callback.returns($.Deferred());


                    this.result = target.begin();
                    this.result2 = target.begin();
                });

                describe("and the first execution is pending", function(){

                    it("should NOT return the promise from the first flow execution", function(){

                        this.result.should.not.equal(this.result2);

                    });


                });

                describe("and the first execution is complete", function(){

                    beforeEach(function() {
                        target.step("step.0").callback.firstCall.returnValue.resolve();
                    });

                    it("should should NOT return the deferred from the first flow execution", function(){

                        this.result.should.not.equal(this.result2);

                    });

                });

            });

            describe("when 'flow::resolve::tether' is returned by first step", function(){

                beforeEach(function() {
                    this.stepDeferred = $.Deferred();
                    var self = this;
                    this.result = target
                        .step("step.0", function() {

                            return $.Deferred().resolve("flow::resolve::tether", self.stepDeferred);
                        })
                        .step("step.1", sinon.stub())
                        .begin();

                });

                it("should return not execute subsequent steps", function(){

                    target.step("step.1").callback.called.should.be.false;

                });

                describe("when the first step is pending", function(){

                    it("should keep the flow deferred pending", function(){

                        this.result.state().should.equal("pending");

                    });


                });

                describe("when the first step is rejected", function(){

                    beforeEach(function() {

                        this.stepDeferred.reject();
                    });

                    it("should reject the flow deferred", function(){

                        this.result.state().should.equal("rejected");

                    });

                });

                describe("when the first step is resolved", function(){

                    beforeEach(function() {
                        this.stepDeferred.resolve();
                    });

                    it("should resolve the flow deferred", function(){

                        this.result.state().should.equal("resolved");

                    });

                });


            });

            describe("when 'flow::resolve' is returned by first step", function(){

                beforeEach(function() {
                    this.result = target
                        .step("step.0", function() {

                            return $.Deferred().resolve("flow::resolve", "value1");
                        })
                        .step("step.1", sinon.stub())
                        .begin();

                });

                it("should not execute subsequent steps", function(){

                    target.step("step.1").callback.called.should.be.false;

                });

                it("should resolve the flow", function(){

                    this.result.state().should.equal("resolved");

                });

                it("should return arguments after the first position to the master flow", function(){

                    this.result.then(function(response) {
                        response.should.equal("value1");
                    })

                });

            });

            describe("when flow is added as a step", function(){

                beforeEach(function() {

                    this.childFlow = flow("childFlow")
                        .step("step.0", sinon.stub());
                    target
                        .step("step.0", sinon.stub())
                        .step("step.1", this.childFlow);
                });


                describe("and step before the flow-step returns arguments via deferred", function(){

                    beforeEach(function() {
                        this.stepZeroResults = ["returnValue1", "returnValue2"];
                        target
                            .step("step.0").callback
                            .returns($.Deferred().resolve(this.stepZeroResults[0], this.stepZeroResults[1]));

                        target.begin();
                    });

                    it("should pass individual arguments to the flow-step's first step", function(){

                        var childFlowStepZeroArgs = this.childFlow.step("step.0").callback.firstCall.args;
                        childFlowStepZeroArgs[0]
                            .should.equal(this.stepZeroResults[0]);
                        childFlowStepZeroArgs[1]
                            .should.equal(this.stepZeroResults[1]);

                    });
                        
                });

            });

            describe("when the last step in a flow is another flow", function(){

                describe("and the first step is async", function(){

                    beforeEach(function() {

                        this.childFlow = flow("childFlow")
                            .step("step.0", sinon.stub());
                        this.result = target
                            .step("step.0", function() {
                                var def = $.Deferred();

                                setTimeout(function() {
                                    def.resolve();
                                }, 1);

                                return def;
                            })
                            .step("step.1", sinon.stub())
                            .step("step.2", this.childFlow)
                            .begin();
                    });

                    it("should call steps in correct order", function(done){

                        var self = this;
                        this.result.then(function() {
                            target.step("step.1").callback.calledBefore(self.childFlow.step("step.0"))
                                .should.be.true;

                            done();

                        });

                    });


                });

                describe("and the last step in the child flow resolves", function(){

                    beforeEach(function() {
                        this.childFlow = flow("childFlow")
                            .step("step.0", function() {
                                return $.Deferred().resolve("childResponse");
                            });
                        this.result = target
                            .step("step.0", function() {})
                            .step("step.1", this.childFlow)
                            .begin();
                    });

                    it("should resolve the master flow promise", function(){

                        this.result.then(function(response) {
                            response.should.equal("childResponse");
                        });

                    });

                });

            });

            describe("when the last step in a flow resolves", function(){

                describe("and there are no success delegates", function(){

                    beforeEach(function() {
                        this.result = target
                            .step("step.0", function() {})
                            .step("step.1", function() {
                                return $.Deferred().resolve("someData");
                            })
                            .begin();
                    });

                    it("should resolve the flow promise", function(){

                        this.result.then(function(response) {
                            response.should.equal("someData");
                        })

                    });

                });

            });

            describe("when an execution is created", function(){

                describe("when mode is waterfall", function(){

                    describe("and a step is completed", function(){

                        beforeEach(function() {
                            this.execution = target
                                .step("step.0", function() {})
                                .step("step.1", function() {
                                    return $.Deferred().resolve("someData");
                                })
                                .create();
                        });


                        it("should emit an event", function(){
                            var stepsCompleted = [];

                            this.execution.on('step-succeeded', function(stepName) {
                                stepsCompleted.push(stepName);
                            });

                            this.execution.execute();

                            stepsCompleted.length.should.equal(2);
                        });

                    });

                    describe("and a step fails", function(){

                        beforeEach(function() {
                            this.execution = target
                                .step("step.0", function() {})
                                .step("step.1", function() {
                                    return $.Deferred().reject("someData");
                                })
                                .create();
                        });



                        it("should emit an event", function(){
                            var stepsFailed = [];

                            this.execution.on('step-failed', function(stepName) {
                                stepsFailed.push(stepName);
                            });

                            this.execution.execute();
                            stepsFailed.length.should.equal(1);
                        });


                    });

                });

                describe("when mode is parallel", function(){

                    describe("and a step is completed", function(){

                        beforeEach(function() {
                            this.execution = target
                                .step("step.0", function() {})
                                .step("step.1", function() {
                                    return $.Deferred().resolve("someData");
                                })
                                .parallel()
                                .create();
                        });


                        it("should emit an event", function(){
                            var stepsCompleted = [];

                            this.execution.on('step-succeeded', function(stepName) {
                                stepsCompleted.push(stepName);
                            });

                            this.execution.execute();

                            stepsCompleted.length.should.equal(2);
                        });

                    });

                });


            });


        });

        describe("step", function(){

            describe("in general", function(){

                beforeEach(function() {
                    this.stepOneCallback = sinon.stub();
                    this.result = target.step("one", this.stepOneCallback);
                });

                it("should return the flow object", function() {

                    this.result.should.equal(target);

                });
            });

            describe("when one argument passed", function(){

                describe("when the argument is a string", function(){

                    beforeEach(function() {

                        this.stepOneCallback = sinon.stub();
                        target.step("one", this.stepOneCallback);

                        this.result = target.step("one");
                    });


                    it("should return the step", function() {

                        this.result.callback.should.equal(this.stepOneCallback);

                    });

                    it("should not add a step to the steps array", function(){

                        target.steps.length.should.equal(1);

                    });
                });

                describe("when the argument is a function", function(){
                    beforeEach(function() {
                        this.stepCallback = sinon.stub();
                        target.step(this.stepCallback);
                    });

                    it("should create a new object in the steps array with a name in format of 'step.{length}'", function() {

                        var self = this;
                        var found = _.find(target.steps, function(step) {
                            return step.callback === self.stepCallback;
                        });

                        found.name.should.equal("step." + (target.steps.length));

                    });
                });

                describe("when the argument is another flow", function(){

                    beforeEach(function() {
                        this.flowStep = flow("someOtherFlow");
                        sinon.stub(this.flowStep, "begin");
                        target.step(this.flowStep);
                    });


                    it("should create a new object in the steps array with a name in the format of " +
                        "'step.{length}.{flow.name}'", function() {

                        var self = this;
                        var found = _.find(target.steps, function(step, index) {
                            return step.name === "step." + (index+1) + "." + self.flowStep.name;
                        });

                        should.exist(found);

                    });


                    describe("the step callback", function(){

                        beforeEach(function() {
                            this.flowStep.begin.returns("somePromise");

                            var self = this;
                            var foundStep = _.find(target.steps, function(step, index) {
                                return step.name === "step." + (index+1) + "." + self.flowStep.name;
                            });

                            this.result = foundStep.callback();

                        });

                        it("should call the flow's begin method", function(){



                            this.flowStep.begin.called.should.be.true;

                        });


                        it("should return the result of the flow's begin method", function(){

                            this.result.should.equal("somePromise");

                        });

                    });
                });

            });

            describe("when two arguments passed", function(){

                describe("when the second argument is a function", function(){

                    beforeEach(function() {
                        this.callbackStub = sinon.stub();
                        this.result = target.step("one", this.callbackStub);
                    });

                    beforeEach(function() {
                        this.found = _.find(target.steps, function(step) {
                            return step.name === "one";
                        });
                    });

                    it("should create a new object in the steps array with a name", function() {

                        this.found.name.should.equal("one");

                    });

                    it("should create a new object in the steps array with a callback", function() {

                        this.found.callback();

                        this.callbackStub.called.should.be.true;

                    });
                });

                describe("when the second argument is a flow", function(){

                    beforeEach(function() {
                        this.flowStep = flow("someOtherFlow");
                        sinon.stub(this.flowStep, "begin");

                        this.result = target.step("one", this.flowStep);
                    });

                    beforeEach(function() {
                        this.found = _.find(target.steps, function(step) {
                            return step.name === "one";
                        });
                    });

                    it("should create a new object in the steps array with a name", function() {

                        this.found.name.should.equal("one");

                    });

                    it("should create a new object in the steps array with a " +
                        "callback that calls the flow's begin method", function() {

                        this.found.callback();

                        this.flowStep.begin.called.should.be.true;

                    });
                });

            });

        });

        describe("begin", function(){

            beforeEach(function() {

                wrappedStubs.parallelMode = sinon.stub(execution.modes, "parallel");
                wrappedStubs.waterfallMode = sinon.stub(execution.modes, "waterfall");
                wrappedStubs.attachFailCallback = sinon.stub(execution, "attachFailCallback");
                wrappedStubs.attachFailDelegate = sinon.stub(execution, "attachFailDelegate");
                wrappedStubs.attachSuccessDelegate = sinon.stub(execution, "attachSuccessDelegate");

            });

            describe("when a context is specified", function(){

                describe("and flow is executed once", function(){

                    beforeEach(function() {
                        this.ctx = {
                            prop1 : "someValue"
                        };
                        this.result = target
                            .step("one", function() {
                                return this.prop1;
                            })
                            .context(this.ctx)
                            .begin();
                    });

                    it("should call the steps on the ctx argument", function() {

                        this.result.then(function(ret) {
                            ret.should.equal("someValue");
                        });

                    });


                });

                describe("and the flow is executed twice", function(){

                    beforeEach(function() {
                        this.ctx = {};
                        this.result1 = target
                            .step("one", function() {
                                if (!this.someValue) {
                                    this.someValue = 0;
                                }
                                this.someValue++;
                                return this.someValue;
                            })
                            .context(this.ctx)
                            .begin();

                        this.result2 = target
                            .context(this.ctx)
                            .begin();
                    });


                    it("should maintain separate execution contexts", function(){

                        this.result1.then(function(ret) {
                            ret.should.equal(1);
                        });
                        this.result2.then(function(ret) {
                            ret.should.equal(1);
                        });

                    });

                });
            });

            describe("when there are no steps in the flow", function(){

                beforeEach(function() {

                    this.result = target.begin();
                });

                it("should return a rejected deferred", function() {

                    this.result.state().should.equal("rejected");

                    this.result.fail(function(result) {
                        result.should.equal("There are no steps to execute in current execution plan.")
                    })

                });
            });

            describe("when there are steps in the flow", function(){

                beforeEach(function() {
                    target
                        .step("one", sinon.stub())
                        .step("two", sinon.stub());
                });

                describe("when arguments are passed", function(){

                    beforeEach(function() {
                        this.arg1 = "firstArg";
                        this.arg2 = "secondArg";


                    });

                    describe("when flow execution mode is waterfall", function(){

                        beforeEach(function() {

                            wrappedStubs.waterfallMode.returns(rejected);

                            target.begin(this.arg1, this.arg2);

                        });

                        it("should pass the arguments to the waterfall mode handler", function() {

                            var args = wrappedStubs.waterfallMode.firstCall.args[2];

                            args[0].should.equal(this.arg1);
                            args[1].should.equal(this.arg2);

                        });

                    });

                    describe("when flow execution mode is parallel", function(){

                        beforeEach(function() {

                            wrappedStubs.parallelMode.returns(rejected);

                            target.parallel().begin(this.arg1, this.arg2);
                        });

                        it("should pass the arguments to the parallel mode handler", function() {

                            var args = wrappedStubs.parallelMode.firstCall.args[2];

                            args[0].should.equal(this.arg1);
                            args[1].should.equal(this.arg2);

                        });


                    });

                });

            });

            describe("when there is only one step in the flow", function(){

                beforeEach(function() {
                    target
                        .step("one", sinon.stub())
                        .begin();
                });

                it("should execute the step", function() {

                    target.step("one").callback.called.should.be.true;

                });

                it("should not call waterfall or parallel methods", function(){

                    execution.modes.waterfall.called.should.be.false;
                    execution.modes.parallel.called.should.be.false;

                });

                it("should call attachFailCallback", function(){

                    execution.attachFailCallback.called.should.be.true;

                });

                it("should call attachFailDelegate", function(){

                    execution.attachFailDelegate.called.should.be.true;

                });

                it("should call attachSuccessDelegate", function(){

                    execution.attachSuccessDelegate.called.should.be.true;

                });

            });

            describe("when there are two or more steps in the flow", function(){
                beforeEach(function() {

                    wrappedStubs.waterfallMode.returns(rejected);

                    target
                        .step("one", sinon.stub())
                        .step("two", sinon.stub())
                        .step("three", sinon.stub());
                });

                describe("and the execution mode is not specified", function(){

                    beforeEach(function() {
                        target.begin();
                    });

                    it("should execute the steps in sequence (waterfall mode)", function() {

                        execution.modes.waterfall.called.should.be.true;

                    });

                    it("should NOT execute the steps in parallel (parallel mode)", function(){

                        execution.modes.parallel.called.should.be.false;

                    });

                    it("should call attachFailCallback", function(){

                        execution.attachFailCallback.called.should.be.true;

                    });

                    it("should call attachFailDelegate", function(){

                        execution.attachFailDelegate.called.should.be.true;

                    });

                    it("should call attachSuccessDelegate", function(){

                        execution.attachSuccessDelegate.called.should.be.true;

                    });

                });

                describe("and the execution mode is parallel", function(){

                    beforeEach(function() {

                        wrappedStubs.parallelMode.returns(rejected);

                        target.parallel().begin();
                    });

                    it("should NOT execute the steps in sequence (waterfall mode)", function() {

                        execution.modes.waterfall.called.should.be.false;

                    });

                    it("should execute the steps in parallel (parallel mode)", function(){

                        execution.modes.parallel.called.should.be.true;

                    });

                    it("should call attachFailCallback", function(){

                        execution.attachFailCallback.called.should.be.true;

                    });

                    it("should call attachFailDelegate", function(){

                        execution.attachFailDelegate.called.should.be.true;

                    });

                    it("should call attachSuccessDelegate", function(){

                        target.internals.execution.prototype.attachSuccessDelegate.called.should.be.true;

                    });

                });

                describe("and a startOn step has been specified", function(){

                    beforeEach(function() {
                        target
                            .startOn("two")
                            .begin();
                    });

                    it("should NOT execute steps before the startOn step", function() {

                        var args = wrappedStubs.waterfallMode.firstCall.args[1];

                        args[0].should.not.equal(target.step("one"));

                    });


                    it("should execute steps on or after the startOn step", function() {

                        var args = wrappedStubs.waterfallMode.firstCall.args[1];

                        args[0].should.equal(target.step("two"));
                        args[1].should.equal(target.step("three"));

                    });
                });

                describe("and a skip step has been specified", function(){

                    beforeEach(function() {
                        target
                            .skip("two")
                            .begin();

                    });

                    it("should NOT execute the skipped step", function() {

                        var args = wrappedStubs.waterfallMode.firstCall.args[1];

                        args[1].should.not.equal(target.step("two"));

                    });

                    it("should execute steps that were not skipped", function(){

                        var args = wrappedStubs.waterfallMode.firstCall.args[1];

                        args[0].should.equal(target.step("one"));
                        args[1].should.equal(target.step("three"));


                    });
                });

            });


        });

        describe("startOn", function(){

            beforeEach(function() {
                this.result = target.startOn("someStepName");
            });

            it("should set the startingStep property", function() {

                target.startingStep.should.equal("someStepName");

            });

            it("should return the flow", function(){

                target.should.equal(this.result);

            });
        });

        describe("delay", function(){

            beforeEach(function() {
                this.result = target
                    .step("step.0", sinon.stub())
                    .delay(1);

            });

            it("should add a new step with same name as last step added plus '-delay'", function(){

                var step = target.step("step.0-delay");

                should.exist(step);

            });

            it("should return the flow object", function(){

                this.result.should.equal(target);

            });

            it("should add a callback to the delay step that returns a deferred", function(){

                var step = target.step("step.0-delay");

                var result = step.callback();

                result.state().should.equal('pending');

            });
        });

        describe("skip", function(){

            beforeEach(function() {
                this.result = target.skip("someSkippedStep");
            });


            it("should push the skipped step name to the skipSteps property", function() {

                target.skipSteps.indexOf("someSkippedStep").should.not.be.below(0);

            });

            it("should return the flow", function(){

                this.result.should.equal(this.result);

            });
        });

        describe("waterfall", function(){

            beforeEach(function() {
                this.result = target.waterfall();
            });

            it("should set the mode property to waterfall", function() {

                target.mode.should.equal("waterfall");

            });

            it("should return the flow", function(){

                this.result.should.equal(this.result);
            });

        });

        describe("parallel", function(){

            beforeEach(function() {
                this.result = target.parallel();
            });

            it("should set the mode property to parallel", function() {

                target.mode.should.equal("parallel");

            });

            it("should return the flow", function(){

                this.result.should.equal(this.result);

            });
        });

        describe("onFailure", function(){

            describe("loop", function(){

                describe("when there is an onFailure argument", function(){

                    beforeEach(function() {
                        target.onFailure("blah").loop();
                    });

                    it("should itself to the conditionalFailDelegates object", function() {

                        target.conditionalFailDelegates.blah.should.equal(target);

                    });
                });

                describe("when there is NOT an onFailure argument", function(){

                    beforeEach(function() {
                        target.onFailure().loop();
                    });

                    it("should set the defaultFailDelegate", function() {

                        target.defaultFailDelegate.should.equal(target);

                    });
                });

            });

            describe("jumpTo", function(){

                describe("when there is an argument to onFailure", function(){

                    beforeEach(function() {

                        this.expectedDelegateFlow = flow("secondFlow");
                        target.onFailure("blah").jumpTo(this.expectedDelegateFlow);
                    });

                    it("should add an object to the conditionalFailDelegates object", function() {

                        target.conditionalFailDelegates.blah.should.equal(this.expectedDelegateFlow);

                    });
                });

                describe("when there is NOT an argument to onFailure", function(){

                    beforeEach(function() {

                        this.expectedDelegateFlow = flow("secondFlow");

                        target.onFailure().jumpTo(this.expectedDelegateFlow);
                    });

                    it("should set the defaultFailDelegate", function() {

                        target.defaultFailDelegate.should.equal(this.expectedDelegateFlow);

                    });
                });

            });

        });

        describe("onSuccess", function(){

            describe("loop", function(){

                beforeEach(function() {
                    this.result = target.onSuccess().loop();
                });

                it("should set the defaultSuccessDelegate", function() {

                    target.defaultSuccessDelegate.should.equal(target);

                });

                it("should return the flow", function(){

                    this.result.should.equal(target);

                });

            });

            describe("jumpTo", function(){

                beforeEach(function() {

                    this.expectedDelegateFlow = flow("secondFlow");
                    this.result = target
                        .onSuccess()
                        .jumpTo(this.expectedDelegateFlow);
                });


                it("should do something", function(){

                    target.defaultSuccessDelegate.should.equal(this.expectedDelegateFlow);

                });

                it("should return the flow", function(){

                    this.result.should.equal(target);

                });

            });

        });

        describe("loop", function(){

            beforeEach(function() {
                this.result = target.loop();
            });

            it("should set the defaultSuccessDelegate", function() {

                target.defaultSuccessDelegate.should.equal(target);

            });

            it("should return the flow", function(){

                this.result.should.equal(target);

            });

        });

        describe("modes", function(){

            beforeEach(function() {

                this.stubbedSteps = {
                    one : sinon.stub(),
                    two : sinon.stub()
                };

                this.stepsToExecute = [
                    {
                        name : "one",
                        callback : this.stubbedSteps.one
                    },
                    {
                        name : "two",
                        callback : this.stubbedSteps.two
                    }];

            });

            describe("waterfall", function(){

                beforeEach(function() {
                    target = target.internals.execution.prototype.modes.waterfall;
                });

                describe("when third argument is not empty", function(){

                    beforeEach(function() {

                        this.arg1 = "firstArg";
                        this.arg2 = "secondArg";

                        _.each(this.stubbedSteps, function(stub) {
                            stub.returns($.Deferred().resolve());
                        });

                        target(null, this.stepsToExecute, [this.arg1, this.arg2]);
                    });

                    it("should pass third arguments to first step", function() {

                        var passedArgs = this.stubbedSteps.one.firstCall.args;

                        passedArgs[0].should.equal(this.arg1);
                        passedArgs[1].should.equal(this.arg2);

                    });

                    it("should NOT pass third arguments to second step", function(){

                        var passedArgs = this.stubbedSteps.two.firstCall.args;

                        passedArgs.length.should.equal(0);

                    });
                });

                describe("when all steps resolve", function(){

                    beforeEach(function() {

                        _.each(this.stubbedSteps, function(stub) {
                            stub.returns($.Deferred().resolve());
                        });

                        target(null, this.stepsToExecute);

                    });

                    it("should call all steps", function() {

                        _.each(this.stubbedSteps, function(stub) {
                            stub.called.should.be.true;
                        });

                    });


                    it("should call the steps in order", function(){

                        this.stubbedSteps.one.calledBefore(this.stubbedSteps.two);

                    });

                });

                it("should not call downstream steps until upstream steps are resolved", function(){

                    var stepOneDeferred = $.Deferred(),
                        stepTwoDeferred = $.Deferred();

                    this.stubbedSteps.one.returns(stepOneDeferred);
                    this.stubbedSteps.two.returns(stepTwoDeferred);

                    target(null, this.stepsToExecute);

                    this.stubbedSteps.two.called.should.be.false;

                    stepOneDeferred.resolve();

                    this.stubbedSteps.two.called.should.be.true;


                });

                it("should not call downstream steps if upstream steps rejected", function(){


                    var stepOneDeferred = $.Deferred(),
                        stepTwoDeferred = $.Deferred();

                    this.stubbedSteps.one.returns(stepOneDeferred);
                    this.stubbedSteps.two.returns(stepTwoDeferred);

                    target(null, this.stepsToExecute);

                    this.stubbedSteps.two.called.should.be.false;

                    stepOneDeferred.reject();

                    this.stubbedSteps.one.called.should.be.true;
                    this.stubbedSteps.two.called.should.be.false;


                });

                it("should pass single result argument from upstream step to downstream step", function(){

                    var stepOneDeferred = $.Deferred(),
                        stepTwoDeferred = $.Deferred();

                    this.stubbedSteps.one.returns(stepOneDeferred);
                    this.stubbedSteps.two.returns(stepTwoDeferred);

                    target(null, this.stepsToExecute);

                    this.stubbedSteps.two.called.should.be.false;

                    stepOneDeferred.resolve("someArg");

                    this.stubbedSteps.two.calledWith("someArg").should.be.true;


                });

                it("should pass multiple result arguments from upstream step to downstream step", function(){

                    var stepOneDeferred = $.Deferred(),
                        stepTwoDeferred = $.Deferred();

                    this.stubbedSteps.one.returns(stepOneDeferred);
                    this.stubbedSteps.two.returns(stepTwoDeferred);

                    target(null, this.stepsToExecute);

                    this.stubbedSteps.two.called.should.be.false;

                    stepOneDeferred.resolve("someArg", "someArg2");

                    this.stubbedSteps.two.firstCall.args[0].should.equal("someArg");
                    this.stubbedSteps.two.firstCall.args[1].should.equal("someArg2");


                });
            });


            describe("parallel", function(){

                beforeEach(function() {
                    target = target.internals.execution.prototype.modes.parallel;
                });

                describe("when all steps resolve", function(){

                    beforeEach(function() {
                        _.each(this.stubbedSteps, function(stub) {
                            stub.returns($.Deferred().resolve());
                        });

                        target(null, this.stepsToExecute);

                    });

                    it("should call all steps", function() {

                        _.each(this.stubbedSteps, function(stub) {
                            stub.called.should.be.true;
                        });

                    });
                });

                describe("when all steps reject", function(){

                    beforeEach(function() {
                        _.each(this.stubbedSteps, function(stub) {
                            stub.returns($.Deferred().reject());
                        });

                        target(null, this.stepsToExecute);

                    });


                    it("should call all steps", function() {

                        _.each(this.stubbedSteps, function(stub) {
                            stub.called.should.be.true;
                        });

                    });
                });


                describe("when third argument is not empty", function(){

                    beforeEach(function() {
                        this.arg1 = "firstArg";
                        this.arg2 = "secondArg";

                        _.each(this.stubbedSteps, function(stub) {
                            stub.returns($.Deferred().resolve());
                        });

                        target(null, this.stepsToExecute, [this.arg1, this.arg2]);
                    });

                    it("should pass third arguments to first step", function() {

                        var passedArgs = this.stubbedSteps.one.firstCall.args;

                        passedArgs[0].should.equal(this.arg1);
                        passedArgs[1].should.equal(this.arg2);

                    });

                    it("should pass third arguments to second step", function(){

                        var passedArgs = this.stubbedSteps.two.firstCall.args;

                        passedArgs[0].should.equal(this.arg1);
                        passedArgs[1].should.equal(this.arg2);

                    });
                });
            });
        });

        describe("attachFailCallback", function(){

            beforeEach(function() {
                target = target.internals.execution.prototype.attachFailCallback;
                this.context = {};
                this.context.flow = {
                    conditionalFailCallbacks: {}
                };

                this.promise = {
                    fail : sinon.stub()
                };

            });

            it("should call the fail method on the promise argument", function() {

                target.call(this.context, this.promise);

                this.promise.fail.called.should.be.true;

            });

            describe("when promise fail method is fired", function(){

                beforeEach(function() {
                    this.promise.fail.callsArg(0);
                });

                describe("when there are no conditional fail callbacks that match response data", function(){

                    describe("when there is a default fail callback", function(){

                        beforeEach(function() {
                            this.context.flow = {
                                conditionalFailCallbacks : {},
                                defaultFailCallback : sinon.stub()
                            };
                            target.call(this.context, this.promise);
                        });

                        it("should call the default fail callback", function(){

                            this.context.flow.defaultFailCallback.called.should.be.true;

                        });

                    });

                });

            });

        });

        describe("attachSuccessDelegate", function(){

            beforeEach(function() {

                target = target.internals.execution.prototype.attachSuccessDelegate;
                this.context = {
                    masterPromise : {
                        resolve : sinon.stub()
                    }
                };

                this.promise = {
                    then : sinon.stub()
                };

                this.promise.then.callsArg(0);

                this.delegateFlow = getStubbedFlow("successDelegateFlow");

            });

            describe("when there is a defaultSuccessDelegate", function(){

                describe("when the master promise resolves", function(){

                    describe("when defaultSuccessDelegate is a flow object", function(){

                        beforeEach(function() {
                            this.context.flow = {
                                defaultSuccessDelegate : this.delegateFlow
                            };
                            target.call(this.context, this.promise);
                        });

                        it("should call the begin method on the success delegate flow", function(){

                            this.delegateFlow.begin.called.should.be.true;

                        });


                    });

                });

            });

        });


        describe("attachFailDelegate", function(){

            describe("when conditionalFailDelegates is truthy", function(){

                beforeEach(function() {
                    this.context = {
                        masterPromise : {
                            then : sinon.stub(),
                            reject : sinon.stub(),
                            resolve : sinon.stub()
                        },
                        conditionalFailDelegates: {}
                    };

                    this.promise = {
                        fail : sinon.stub()
                    };

                });

                it("should call the fail method on the promise argument", function() {

                    target.internals.execution.prototype.attachFailDelegate.call(this.context, this.promise);

                    this.promise.fail.called.should.be.true;

                });

                describe("when the fail callback is fired", function(){

                    describe("when no conditionalFailDelegate is matched using the fail callback response data", function(){

                        describe("when there is a defaultFailDelegate", function(){

                            beforeEach(function() {

                                this.delegateFlow = getStubbedFlow("someDelegateFlow");

                                this.promise.fail.callsArg(0);

                            });

                            describe("when defaultFailDelegate is a flow object", function(){

                                beforeEach(function() {

                                    this.context.flow = {
                                        conditionalFailDelegates : {},
                                        defaultFailDelegate : this.delegateFlow
                                    };

                                    target.internals.execution.prototype.attachFailDelegate.call(this.context, this.promise);
                                });


                                it("should call the begin method on the flow with name " +
                                    "that matches defaultFailDelegate", function() {

                                    this.delegateFlow.begin.called.should.be.true;

                                });

                                it("should resolve the masterPromise when the delegate flow is resolved", function(){

                                    target.internals.execution.prototype.attachFailDelegate.call(this.context, this.promise);

                                    this.delegateFlow.begin.returnValue
                                        .then.firstCall.args[0]();

                                    this.context.masterPromise.resolve.called.should.be.true;

                                });

                            });

                        });

                        describe("when there is NOT a defaultFailDelegate", function(){

                            beforeEach(function() {

                                this.failValue = "someFailureCode";
                                this.promise.fail.callsArgWith(0, this.failValue);

                                this.context.flow = {
                                    conditionalFailDelegates : {}
                                };

                                target.internals.execution.prototype.attachFailDelegate.call(this.context, this.promise);
                            });

                            it("should reject the master promise", function() {

                                this.context.masterPromise.reject.called.should.be.true;

                            });

                            it("should reject the master promise with the promise failure result", function(){

                                this.context.masterPromise.reject.firstCall.args[0]
                                    .should.equal(this.failValue);

                            });
                        });

                    });

                });
            });
        });
    });

}));





