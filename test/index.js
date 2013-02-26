var $ = require("jquery-deferred"),
    _ = require("underscore"),
    sinon = require("sinon"),
    should = require("should"),
    flow = require("../sebastian").flow;

describe("flow", function(){

    var wrappedStubs = {},
        resolved = $.Deferred().resolve(),
        rejected = $.Deferred().reject(),
        target;

    beforeEach(function() {

        target = flow("someFlow");

    });

    afterEach(function() {

        _.invoke(wrappedStubs, 'restore');

        target.destroy();

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

                afterEach(function() {
                    this.flowStep.destroy();
                });


                it("should create a new object in the steps array with a name in the format of " +
                    "'step.{length}.{flow.name}'", function() {

                    var self = this;
                    var found = _.find(target.steps, function(step, index) {
                        return step.name === "step." + (index+1) + "." + self.flowStep.name;
                    });

                    should.exist(found);

                });

                it("should create a new object in the steps array with a " +
                    "callback that calls the flow's begin method", function(){

                    var self = this;
                    var found = _.find(target.steps, function(step, index) {
                        return step.name === "step." + (index+1) + "." + self.flowStep.name;
                    });

                    found.callback();

                    this.flowStep.begin.called.should.be.true;

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

            describe("when second argument is a string", function(){

                beforeEach(function() {
                    this.flowStep = flow("someOtherFlow");
                    sinon.stub(this.flowStep, "begin");

                    this.result = target.step("one", "someOtherFlow");
                });

                beforeEach(function() {
                    this.found = _.find(target.steps, function(step) {
                        return step.name === "one";
                    });
                });

                afterEach(function() {
                    this.flowStep.destroy();
                });

                it("should create a new object in the steps array with the name", function() {

                    this.found.name.should.equal("one");

                });

                it("should create a new object in the steps array with a " +
                    "callback that calls the begin method on the flow with name matching the second argument", function() {

                    this.found.callback();

                    this.flowStep.begin.called.should.be.true;

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

                afterEach(function() {
                    this.flowStep.destroy();
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

            wrappedStubs.parallelMode = sinon.stub(target.modes, "parallel");
            wrappedStubs.waterfallMode = sinon.stub(target.modes, "waterfall");
            wrappedStubs.attachFailCallback = sinon.stub(target, "attachFailCallback");
            wrappedStubs.attachFailDelegate = sinon.stub(target, "attachFailDelegate");
            wrappedStubs.attachSuccessDelegate = sinon.stub(target, "attachSuccessDelegate");

        });

        describe("when a context is specified", function(){

            beforeEach(function() {
                this.ctx = sinon.stub();
                this.result = target
                    .step("one", sinon.stub())
                    .context(this.ctx)
                    .begin();
            });

            it("should call the steps on the ctx argument", function() {

                target.step("one").callback.calledOn(this.ctx).should.be.true;

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

                target.modes.waterfall.called.should.be.false;
                target.modes.parallel.called.should.be.false;

            });

            it("should call attachFailCallback", function(){

                target.attachFailCallback.called.should.be.true;

            });

            it("should call attachFailDelegate", function(){

                target.attachFailDelegate.called.should.be.true;

            });

            it("should call attachSuccessDelegate", function(){

                target.attachSuccessDelegate.called.should.be.true;

            });

        });

        describe("when there are two or more steps in the flow", function(){
            beforeEach(function() {
                target
                    .step("one", sinon.stub())
                    .step("two", sinon.stub());
            });

            describe("and the execution mode is not specified", function(){

                beforeEach(function() {
                    target.begin();
                });

                it("should execute the steps in sequence (waterfall mode)", function() {

                    target.modes.waterfall.called.should.be.true;

                });

                it("should NOT execute the steps in parallel (parallel mode)", function(){

                    target.modes.parallel.called.should.be.false;

                });

                it("should call attachFailCallback", function(){

                    target.attachFailCallback.called.should.be.true;

                });

                it("should call attachFailDelegate", function(){

                    target.attachFailDelegate.called.should.be.true;

                });

                it("should call attachSuccessDelegate", function(){

                    target.attachSuccessDelegate.called.should.be.true;

                });

            });

            describe("and the execution mode is parallel", function(){

                beforeEach(function() {
                    target.parallel().begin();
                });

                it("should NOT execute the steps in sequence (waterfall mode)", function() {

                    target.modes.waterfall.called.should.be.false;

                });

                it("should execute the steps in parallel (parallel mode)", function(){

                    target.modes.parallel.called.should.be.true;

                });

                it("should call attachFailCallback", function(){

                    target.attachFailCallback.called.should.be.true;

                });

                it("should call attachFailDelegate", function(){

                    target.attachFailDelegate.called.should.be.true;

                });

                it("should call attachSuccessDelegate", function(){

                    target.attachSuccessDelegate.called.should.be.true;

                });

            });

            describe("and a startOn step has been specified", function(){

                beforeEach(function() {
                    target
                        .startOn("two")
                        .begin();
                });

                it("should NOT execute steps before the startOn step", function() {

                    target.step("one").callback.called.should.be.false;

                });


                it("should execute steps on or after the startOn step", function() {

                    target.step("two").callback.called.should.be.true;

                });
            });

            describe("and a skip step has been specified", function(){

                beforeEach(function() {
                    target
                        .skip("two")
                        .begin();

                });

                it("should NOT execute the skipped step", function() {

                    target.step("two").callback.called.should.be.false;

                });

                it("should execute steps that were not skipped", function(){

                    target.step("one").callback.called.should.be.true;

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
                    target.onFailure("blah").jumpTo(flow("secondFlow"));
                });

                it("should add an object to the conditionalFailDelegates object", function() {

                    target.conditionalFailDelegates.blah.should.equal(flow("secondFlow"));

                });
            });

            describe("when there is NOT an argument to onFailure", function(){

                beforeEach(function() {
                    target.onFailure().jumpTo(flow("secondFlow"));
                });

                it("should set the defaultFailDelegate", function() {

                    target.defaultFailDelegate.should.equal(flow("secondFlow"));

                });
            });

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

            describe("when third argument is not empty", function(){

                beforeEach(function() {
                    this.arg1 = "firstArg";
                    this.arg2 = "secondArg";

                    _.each(this.stubbedSteps, function(stub) {
                        stub.returns($.Deferred().resolve());
                    });

                    target.modes.waterfall(null, this.stepsToExecute, [this.arg1, this.arg2]);
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

                    target.modes.waterfall(null, this.stepsToExecute);

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

                target.modes.waterfall(null, this.stepsToExecute);

                this.stubbedSteps.two.called.should.be.false;

                stepOneDeferred.resolve();

                this.stubbedSteps.two.called.should.be.true;


            });

            it("should not call downstream steps if upstream steps rejected", function(){


                var stepOneDeferred = $.Deferred(),
                    stepTwoDeferred = $.Deferred();

                this.stubbedSteps.one.returns(stepOneDeferred);
                this.stubbedSteps.two.returns(stepTwoDeferred);

                target.modes.waterfall(null, this.stepsToExecute);

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

                target.modes.waterfall(null, this.stepsToExecute);

                this.stubbedSteps.two.called.should.be.false;

                stepOneDeferred.resolve("someArg");

                this.stubbedSteps.two.calledWith("someArg").should.be.true;


            });

            it("should pass multiple result arguments from upstream step to downstream step", function(){

                var stepOneDeferred = $.Deferred(),
                    stepTwoDeferred = $.Deferred();

                this.stubbedSteps.one.returns(stepOneDeferred);
                this.stubbedSteps.two.returns(stepTwoDeferred);

                target.modes.waterfall(null, this.stepsToExecute);

                this.stubbedSteps.two.called.should.be.false;

                stepOneDeferred.resolve("someArg", "someArg2");

                this.stubbedSteps.two.firstCall.args[0].should.equal("someArg");
                this.stubbedSteps.two.firstCall.args[1].should.equal("someArg2");


            });
        });


        describe("parallel", function(){

            describe("when all steps resolve", function(){

                beforeEach(function() {
                    _.each(this.stubbedSteps, function(stub) {
                        stub.returns($.Deferred().resolve());
                    });

                    target.modes.parallel(null, this.stepsToExecute);

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

                    target.modes.parallel(null, this.stepsToExecute);

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

                    target.modes.parallel(null, this.stepsToExecute, [this.arg1, this.arg2]);
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


    describe("attachFailDelegate", function(){

        describe("when conditionalFailDelegates is truthy", function(){

            beforeEach(function() {
                this.context = {
                    promise : {
                        fail : sinon.stub()
                    },
                    conditionalFailDelegates: []
                };

            });

            it("should call the fail method on the promise argument", function() {

                target.attachFailDelegate.call(this.context);

                this.context.promise.fail.called.should.be.true;


            });

            describe("when the fail callback is fired", function(){

                describe("when no conditionalFailDelegate is matched using the fail callback response data", function(){

                    describe("when there is a defaultFailDelegate", function(){

                        beforeEach(function() {

                            this.delegateFlow = flow("someDelegateFlow");

                            sinon.stub(this.delegateFlow, "context");
                            sinon.stub(this.delegateFlow, "begin");

                            this.delegateFlowPromise = sinon.stub();

                            this.delegateFlow.context.returns(this.delegateFlow);
                            this.delegateFlow.begin.returns(this.delegateFlowPromise);

                            this.context.promise.fail.callsArg(0);

                        });

                        afterEach(function() {
                            flow("someDelegateFlow").destroy();
                        });


                        describe("when defaultFailDelegate is a flow object", function(){

                            beforeEach(function() {

                                this.context.defaultFailDelegate = this.delegateFlow;

                                target.attachFailDelegate.call(this.context);
                            });


                            it("should call the begin method on the flow with name " +
                                "that matches defaultFailDelegate", function() {

                                this.delegateFlow.begin.called.should.be.true;

                            });

                            it("should set the context promise to the result of " +
                                "the delegate flow begin method", function(){

                                this.context.promise.should.equal(this.delegateFlowPromise);

                            });
                        });

                        describe("when defaultFailDelegate is a string", function(){

                            beforeEach(function() {

                                this.context.defaultFailDelegate = this.delegateFlow.name;

                                target.attachFailDelegate.call(this.context);
                            });

                            it("should call the begin method on the flow with name " +
                                "that matches defaultFailDelegate", function() {


                                this.delegateFlow.begin.called.should.be.true;

                            });
                        });

                    });

                });

            });
        });
    });
});