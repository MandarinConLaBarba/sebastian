/*jshint loopfunc:true*/
(function(root, factory) {
    // Set up appropriately for the environment.
    if (typeof exports !== 'undefined') {
        // Node/CommonJS, need jQuery-deferred instead of regular jQuery
        exports.flow = factory(root, {}, require('jquery-deferred'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'exports'], function($, exports) {
            return {flow : factory(root, exports, $)};
        });
    } else {
        // Browser globals
        var flow = factory(root, {}, root.jQuery);
        //Set it's own window property
        window.Sebastian = {flow : flow};
        //Attach to jQuery
        $.Flow = flow;
    }
}(this, function(root, Flow, $) {

    var internals = {
        /**
         * Private method for executing a step
         *
         * Meant to be called with .call(step), where step was created via public API .step(name, callback);
         *
         * @param ctx
         * @param args
         * @api private
         * @return Deferred
         */
        step : function(ctx, args) {
            return this.callback.apply(ctx, args);
        },
        onceCache : {}
    };

    /**
     * Execution constructor
     * @param flow
     */
    var execution = function(flow) {

        this.masterPromise = $.Deferred();

        this.flow = flow;

    };

    /**
     * Execute the flow
     *
     * @param args
     * @returns {Deferred}
     */
    execution.prototype.execute = function(args) {

        /*!
         * If once() applied, check for a cached deferred
         */
        if (this.flow.runOnce) {
            var cached = internals.onceCache[this.flow.name];
            /*!
             * If cached, use the cached promise, otherwise cache it
             */
            if (cached) {
                return cached;
            } else {
                internals.onceCache[this.flow.name] = this.masterPromise;
            }
        }

        //generate execution plan based on starting step name and 'skipped' steps
        var self = this,
            stepsToExecute = [];

        //build execution plan
        for (var i = 0; i < this.flow.steps.length; i++)
        {
            if (this.flow.startingStep && this.flow.steps[i].name !== this.flow.startingStep) {
                continue;
            }

            if (this.flow.skipSteps.indexOf(this.flow.steps[i].name) >= 0) {
                continue;
            }

            stepsToExecute.push(this.flow.steps[i]);

        }

        if (stepsToExecute.length === 0) {
            return $.Deferred().reject("There are no steps to execute in current execution plan.");
        }

        var promise;
        if (stepsToExecute.length === 1) {
            promise = $.when(internals.step.call(stepsToExecute[0], self.flow.ctx, args));
        } else {
            promise = this.modes[this.flow.mode].call(self, this.flow.ctx, stepsToExecute, args);
        }

        //attach failure callback wrapper...this will get the failure result and decide whether to invoke conditional
        //callbacks or the general failure callback
        this.attachFailCallback(promise);

        //jump to any flows specified by 'jumpTo'
        this.attachFailDelegate(promise);
        this.attachSuccessDelegate(promise);

        promise.then(this.masterPromise.resolve);

        return this.masterPromise;

    };

    /**
     * Attach a fail callback to the execution
     *
     * @param {Promise} promise
     * @api private
     */
    execution.prototype.attachFailCallback = function(promise) {

        var self = this;

        //Attach wrapper failure callback
        promise.fail(function(response) {
            var code = response && response.responseCode ?
                response.responseCode : response;

            var failureCallback,
                conditionalCallback = self.flow.conditionalFailCallbacks[code];

            //If there's a conditional failure callback, set it to common variable
            if (conditionalCallback) {
                failureCallback = conditionalCallback;
                //Else, set it to the default (declared on flow w/ onFailure())
            } else if (self.flow.defaultFailCallback) {
                failureCallback = self.flow.defaultFailCallback;
                //Else return
            } else {
                return;
            }

            //If there's a context, invoke .call(ctx)
            if (self.flow.ctx) {
                failureCallback.call(self.flow.ctx, response);
                //Else call 'normally'
            } else {
                failureCallback(response);
            }
        });

    };

    /**
     * Attach flow to handle failure
     *
     * @param {Promise} promise
     * @api private
     */
    execution.prototype.attachFailDelegate = function(promise) {

        var self = this;

        promise.fail(function(response) {
            var code = response && response.responseCode ?
                response.responseCode : response;

            var failureDelegate,
                conditionalDelegate = self.flow.conditionalFailDelegates[code];

            //If there's a conditional failure callback, set it to common variable
            if (conditionalDelegate) {
                failureDelegate = conditionalDelegate;
            } else if (self.flow.defaultFailDelegate) {
                //Else if there's a defaultFailDelegate, set it to the default (declared on flow class)
                failureDelegate = self.flow.defaultFailDelegate;
            } else {
                /**
                 * Else if we found no delegate, go ahead and reject the main promise for the flow
                 */
                return self.masterPromise.reject(response);
            }

            //TODO: figure out why I can't do delegate.flow instanceof flow - flow is null for some reason
            if (!failureDelegate.flow) {
                throw new Error("Flow Error: a failure flow was provided, but it doesn't appear to be a flow.");
            }

            failureDelegate.context(self.flow.ctx)
                .begin()
                .then(self.masterPromise.resolve);

        });

    };

    /**
     * Attach flow to handle success
     *
     * @param {Promise} promise
     * @api private
     */
    execution.prototype.attachSuccessDelegate = function(promise) {
        var exe = this;
        if (this.flow.defaultSuccessDelegate) {
            promise.then(function() {
                var delegate = exe.flow.defaultSuccessDelegate;
                //TODO: figure out why I can't do delegate.flow instanceof flow - flow is null for some reason
                if (delegate.flow !== true) {
                    throw new Error("Flow Error: a success flow was provided, but it doesn't appear to be a flow.");
                }
                delegate.context(exe.flow.ctx)
                    .begin()
                    .then(exe.masterPromise.resolve);

            });
        }
    };

    execution.prototype.modes = {};

    /**
     * Execute the steps sequentially, and pass return value from upstream step to downstream step args
     *
     * @param ctx
     * @param stepsToExecute
     * @param args pass to first step
     * @api private
     * @return {*}
     */
    execution.prototype.modes.waterfall = function(ctx, stepsToExecute, args) {

        var masterPromise = this.masterPromise,
            lastPromise,
            chain = function(step) {
                return function() {
                    //get the arguments into an array
                    var args = [].slice.call(arguments);
                    //check for the resolve command, and if found stop the flow in its tracks.
                    if (args[0] === "flow::resolve") {
                        //remove first arg, which is the special command
                        args.shift();
                        //resolve the master promise
                        masterPromise.resolve.apply(masterPromise, args);
                        //return (and stop flow execution).
                        return;
                    } else if (args[0] === "flow::resolve::tether") {
                        //tether master promise to deferred argument...arg[1] is expected to be a Deferred!
                        return args[1]
                            .then(masterPromise.resolve, masterPromise.reject);
                    }

                    return internals.step.call(step, ctx, args);
                };
            };

        for (var i = 0; i < stepsToExecute.length; i++) {
            var step = stepsToExecute[i];
            //If no promise set, then it's the first step. Execute it and continue
            if (!lastPromise) {
                lastPromise = $.when(internals.step.call(step, ctx, args));
                continue;
            }

            lastPromise = $.when(lastPromise).then(chain(step));
        }

        return lastPromise;

    };

    /**
     * Execute all steps at once
     *
     * @param ctx
     * @param stepsToExecute
     * @param args passed to all steps
     * @api private
     * @return {*}
     */
    execution.prototype.modes.parallel = function(ctx, stepsToExecute, args) {
        var promises = [];
        for (var index in stepsToExecute) {
            promises.push(internals.step.call(stepsToExecute[index], ctx, args));
        }

        return $.when.apply(null, promises);
    };

    /**
     * flow constructor
     * @param name
     */
    var flow = function(name) {

        /*!
         * The flow name
         */
        this.name = name;
        /*!
         * Simple flag to use when determining if step should be executed as a flow or callback
         */
        this.flow = true;
        /*!
         * The 'this' context for the flow steps
         */
        this.ctx = null;
        /*!
         * List of steps in the flow
         */
        this.steps = [];
        /*!
         * A list of step names to skip
         */
        this.skipSteps = [];
        /*!
         * Step with which to start the flow.
         */
        this.startingStep = null;
        /*!
         * List of conditional fail callbacks
         */
        this.conditionalFailCallbacks = {};
        /*!
         * List of conditional fail delegates
         */
        this.conditionalFailDelegates = {};
        /*!
         * The default fail callback. This is fired if no appropriate conditional fail callback is used.
         */
        this.defaultFailCallback = null;
        /*!
         * The default fail flow. This is fired if no appropriate conditional fail flow is used.
         */
        this.defaultFailDelegate = null;
        /*!
         * The default success flow. This is fired when the flow is resolved. Used to chain flows together
         */
        this.defaultSuccessDelegate = null;
        /*!
         * The default execution mode is waterfall
         */
        this.mode = "waterfall";

        /*!
         * Expose for testing, would rather do this another way..
         */
        this.internals = {
            execution : execution
        };
    };

    /**
     * Get or set a step.
     *
     * Basic usage:
     *
     * - ```flow.step(name, callback);```
     *
     * Overloads:
     *
     * - ```flow.step(callback);```
     * - ```flow.step(name, flow);```
     * - ```flow.step(flow);```
     *
     * @param {Object} arg1 name of the step or a step callback (when no name is specified)
     * @param {Object} arg2 step callback/flow. If this is falsey and first arg is a string the function acts as a getter, otherwise it's a setter
     * @api public
     * @return mixed Flow or step
     */
    flow.prototype.step = function(arg1, arg2) {

        var self = this,
            wrapFlowCallback = function(flow) {
                return function() {
                    return flow.context(this).begin.apply(flow, [].slice.call(arguments));
                };
            };

        //Check if second arg is present, if so add/create step object with explicit name
        if (arg2) {
            if (typeof arg2 === "string") {
                arg2 = Flow(arg2);
            }
            this.steps.push({
                name : arg1,
                callback : arg2.flow ? wrapFlowCallback(arg2) : arg2 //if callback is a flow, create a flow wrapper callback
            });
            return this;
        } else if (typeof arg1 === "function"){
            //If first arg is a function, make up a name for them
            this.steps.push({
                name : "step." + (this.steps.length + 1),
                callback : arg1
            });
            return this;
        } else if (typeof arg1 === "object" && arg1.flow) {
            //If first arg is an object, make up a name for them and create a flow wrapper callback
            this.steps.push({
                name : "step." + (this.steps.length + 1) + "." + arg1.name,
                callback : wrapFlowCallback(arg1)
            });
            return this;
        } else {
            var foundStep;
            for (var i = 0; i < this.steps.length; i++)
            {
                if (self.steps[i].name === arg1) {
                    foundStep = self.steps[i];
                    break;
                }

            }
            return foundStep;
        }

    };

    /**
     * Set flow to execute in parallel mode
     *
     * Usage:
     *
     * - ```flow.parallel()```
     *
     *
     * @return Flow
     */
    flow.prototype.parallel = function() {
        this.mode = "parallel";
        return this;
    };

    /**
     * Set flow to execute in waterfall mode
     *
     * Usage:
     *
     * - ```flow.waterfall()```
     *
     * @return Flow
     */
    flow.prototype.waterfall = function() {
        this.mode = "waterfall";
        return this;
    };

    /**
     * Begin the flow. All arguments are passed on to either first step (waterfall) or all steps (parallel).
     *
     * Basic usage:
     *
     * - ```flow.begin()```
     *
     * Overloads:
     *
     * - ```flow.begin(arg1, arg2, arg3, ...);```
     *
     * @return Flow
     */
    flow.prototype.begin = function() {

        var exe = new execution(this);

        return exe.execute([].slice.call(arguments));

    };

    /**
     * Specify the 'this' context for the flow
     *
     * Usage :
     *
     * - ```flow.context(object);```
     *
     * @param {Object} context the context object for the flow
     * @return {Flow} flow
     */
    flow.prototype.context = function(context) {
        this.ctx = context;
        return this;
    };

    /**
     * Specify a step to start the flow on
     *
     * Usage:
     *
     * - ```flow.startOn(stepName);```
     *
     * @param {String} name name of the step to skip
     * @return {Flow} flow
     */
    flow.prototype.startOn = function(name) {
        this.startingStep = name;
        return this;
    };

    /**
     * Set the flow to only run one time...always returning the promise from the first execution.
     *
     * @returns {Flow}
     */
    flow.prototype.once = function() {
        this.runOnce = true;
        return this;
    };

    /**
     * Specify a step to skip
     *
     * Usage:
     *
     * - ``` flow.skip(stepName);```
     *
     * @param {String} name name of the step to skip
     * @return {Flow} Flow
     */
    flow.prototype.skip = function(name) {
        this.skipSteps.push(name);
        return this;
    };

    /**
     * Add a delay after execution of step added last
     *
     * @param {Number} ms milliseconds to delay
     * @return {Flow}
     */
    flow.prototype.delay = function(ms) {

        var last = this.steps[this.steps.length - 1];

        this.step(last.name + "-delay", function() {
            var deferred = $.Deferred();

            setTimeout(deferred.resolve, ms);

            return deferred;
        });

        return this;

    };

    /**
     * Used to attach failure callbacks/delegates
     *
     * @param responseCode optional responseCode to be used w/ conditional fail callbacks/delegates
     * @return {Object}
     */
    flow.prototype.onFailure = function(responseCode) {

        var self = this,
            storeDelegate = function(flow) {
                if (responseCode) {
                    self.conditionalFailDelegates[responseCode] = flow;
                } else {
                    self.defaultFailDelegate = flow;
                }
                return self;
            },
            onFailureOptions = {};

        /**
         * Handle failure with a callback
         *
         * Usage:
         *
         * - ```flow.onFailure().handleWith(callback);```
         * - ```flow.onFailure(responseCode).handleWith(callback);```
         *
         * @param {Function} callback the callback to execute on failure
         * @return Flow
         */
        onFailureOptions.handleWith = function(callback) {
            if (responseCode) {
                self.conditionalFailCallbacks[responseCode] = callback;
            } else {
                self.defaultFailCallback = callback;
            }

            return self;
        };
        /**
         * Handle failure by starting the flow over
         *
         * Usage:
         *
         * - ```flow.onFailure().loop();```
         * - ```flow.onFailure(responseCode).loop();```
         *
         * @return {Flow} flow
         */
        onFailureOptions.loop = function() {
            return storeDelegate(self);
        };

        /**
         * Handle failure by jumping to another flow
         *
         * Usage:
         *
         * - ```flow.onFailure().jumpTo(flow);```
         * - ```flow.onFailure(responseCode).jumpTo(flow);```
         *
         * @param {Flow} flow the flow to delegate to on failure
         * @return {Flow} flow
         */
        onFailureOptions.jumpTo = function(flow) {
            return storeDelegate(flow);
        };

        return onFailureOptions;

    };

    /**
     * Add success condition flows
     *
     * @return {Object}
     */
    flow.prototype.onSuccess = function() {

        var self = this,
            onSuccessOptions = {};

        /**
         * Handle Success by jumping to another flow
         *
         * Usage:
         *
         * - ```flow.onSuccess().jumpTo(flow);```
         *
         * @param {Flow} flow the flow to delegate to on success
         * @return {Flow} flow
         */
        onSuccessOptions.jumpTo = function(flow) {
            self.defaultSuccessDelegate = flow;
            return self;
        };

        return onSuccessOptions;
    };


    /**
     * Flow factory
     *
     * @param {String} name name of the flow
     * @return {Flow}
     * @constructor
     */
    Flow = function(name) {

        return new flow(name);

    };

    return Flow;
}));