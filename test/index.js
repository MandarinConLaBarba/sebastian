var $ = require("jquery-deferred"),
    _ = require("underscore"),
    sinon = require("sinon"),
    should = require("should"),
    flow = require("../flow").flow;

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

});