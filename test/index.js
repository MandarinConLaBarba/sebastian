var $ = require("jquery-deferred"),
    _ = require("underscore"),
    sinon = require("sinon"),
    should = require("should"),
    flow = require("../sebastian").flow;

describe("flow", function(){

    var wrappedStubs = {},
        target,
        pureStubs = {};

    beforeEach(function() {

        target = flow("someFlow");

    });

    afterEach(function() {

        _.invoke(wrappedStubs, 'restore');

        target.destroy();

    });

    describe("begin", function(){

        beforeEach(function() {

            wrappedStubs.parallelMode = sinon.stub(target.modes, "parallel");
            wrappedStubs.waterfallMode = sinon.stub(target.modes, "waterfall");
            wrappedStubs.attachFailCallback = sinon.stub(target, "attachFailCallback");
            wrappedStubs.attachFailDelegate = sinon.stub(target, "attachFailDelegate");
            wrappedStubs.attachSuccessDelegate = sinon.stub(target, "attachSuccessDelegate");

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

    describe("modes", function(){

        describe("waterfall", function(){

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

    });

});