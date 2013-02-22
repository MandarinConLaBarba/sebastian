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

    var flows = {},
        defaultMode = "waterfall";

    var internals = {
        /**
         * Private method for executing a step
         *
         * Meant to be called with .call(step), where step was created via public API .step(name, callback);
         *
         * @param ctx
         * @param args
         * @return deferred
         */
        step : function(ctx, args) {
            return this.callback.apply(ctx, args);
        }
    };

    //flow factory/getter
    Flow = function(name) {

        if (!flows[name]) {
            flows[name] = Object.create({

                /**
                 * Simple flag to use when determining if step should be executed as a flow or callback
                 */
                flow : true,

                /**
                 * The 'this' context for the flow steps
                 *
                 */
                ctx : null,

                /**
                 * List of steps in the flow
                 *
                 */
                steps : [],

                /**
                 * A list of step names to skip
                 *
                 */
                skipSteps : [],

                /**
                 * Step with which to start the flow.
                 *
                 */
                startingStep : null,

                /**
                 * List of conditional fail callbacks
                 *
                 */
                conditionalFailCallbacks : {},

                /**
                 * List of conditional fail delegates
                 *
                 */
                conditionalFailDelegates : {},

                /**
                 * The default fail callback. This is fired if no appropriate conditional fail callback is used.
                 *
                 */
                defaultFailCallback : function() {},

                /**
                 * The default fail flow. This is fired if no appropriate conditional fail flow is used.
                 *
                 */
                defaultFailDelegate : null,

                /**
                 * The default success flow. This is fired when the flow is resolved. Used to chain flows together
                 *
                 */
                defaultSuccessDelegate : null,

                /**
                 * Used to attach failure callbacks/delegates
                 *
                 * @param responseCode optional responseCode to be used w/ conditional fail callbacks/delegates
                 * @return {Object}
                 */
                onFailure : function(responseCode) {

                    var self = this,
                        storeDelegate = function(flow) {
                            if (responseCode) {
                                self.conditionalFailDelegates[responseCode] = flow;
                            } else {
                                self.defaultFailDelegate = flow;
                            }
                            return self;
                        };

                    return {
                        handleWith : function(callback) {
                            if (responseCode) {
                                self.conditionalFailCallbacks[responseCode] = callback;
                            } else {
                                self.defaultFailCallback = callback;
                            }

                            return self;
                        },
                        loop : function() {
                            return storeDelegate(self);
                        },
                        jumpTo : function(flow) {
                            return storeDelegate(flow);
                        }
                    };
                },

                /**
                 * Add success condition flows
                 *
                 * @return {Object}
                 */
                onSuccess : function() {

                    var self = this;

                    return {
                        jumpTo : function(flow) {
                            self.defaultSuccessDelegate = flow;
                            return self;
                        }
                    };
                },

                /**
                 *
                 * @param promise
                 */
                attachFailCallback : function(promise) {

                    var self = this;

                    //Attach wrapper failure callback
                    promise.fail(function(response) {
                        var code = response && response.responseCode ?
                            response.responseCode : response;

                        var failureCallback,
                            conditionalCallback = self.conditionalFailCallbacks[code];

                        //If there's a conditional failure callback, set it to common variable
                        if (conditionalCallback) {
                            failureCallback = conditionalCallback;
                            //Else, set it to the default (declared on flow w/ onFailure())
                        } else if (self.fail) {
                            failureCallback = self.defaultFailCallback;
                            //Else return
                        } else {
                            return;
                        }

                        //If there's a context, invoke .call(ctx)
                        if (self.ctx) {
                            failureCallback.call(self.ctx, response);
                            //Else call 'normally'
                        } else {
                            failureCallback(response);
                        }
                    });

                },

                /**
                 * Attach flows on failure
                 *
                 * @param promise
                 */
                attachFailDelegate : function(promise) {

                    var self = this;

                    if (this.conditionalFailDelegates) {
                        promise.fail(function(response) {
                            var code = response && response.responseCode ?
                                response.responseCode : response;

                            var failureDelegate,
                                conditionalDelegate = self.conditionalFailDelegates[code];

                            //If there's a conditional failure callback, set it to common variable
                            if (conditionalDelegate) {
                                failureDelegate = conditionalDelegate;
                                //Else, set it to the default (declared on flow class)
                            } else if (self.defaultFailDelegate) {
                                failureDelegate = self.defaultFailDelegate;
                                //Else return
                            } else {
                                return;
                            }

                            var flow = failureDelegate;
                            flow = flow.flow ? flow : Flow(failureDelegate);
                            flow.context(self.ctx)
                                .begin();


                        });
                    }

                },

                /**
                 * Attach flows on success
                 *
                 * @param promise
                 */
                attachSuccessDelegate : function(promise) {
                    var self = this;
                    if (this.defaultSuccessDelegate) {
                        promise.then(function() {
                            var flow = Flow(self.defaultSuccessDelegate);
                            flow.context(self.ctx).begin();
                        });
                    }
                },

                /**
                 * Get or set a step. If only a function/flow is passed a step name will be created in the format of
                 *
                 * 'step.{n}'
                 *
                 * For example, step.1, step.2, step.3, etc
                 *
                 * @param arg1 the name of the step or a step callback (when no name is specified)
                 * @param arg2 the step callback/flow. If this is falsey and first arg is a string the function acts as a getter, otherwise it's a setter
                 * @return {*}
                 */
                step : function(arg1, arg2) {

                    var self = this,
                        wrapFlowCallback = function(flow) {
                            return function() {
                                flow.context(this).begin([].slice.call(arguments));
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

                },

                mode : "waterfall",

                modes : {

                    /**
                     * Execute the steps sequentially, and pass return value from upstream step to downstream step args
                     *
                     * @param ctx
                     * @param stepsToExecute
                     * @param args pass to first step
                     * @return {*}
                     */
                    waterfall : function(ctx, stepsToExecute, args) {

                        return _.reduce(stepsToExecute, function(promise, step) {
                            /**
                             * If not a promise object, means we're on the first step.
                             * Call the first step using $.when(), which always returns a promise, regardless of whether the function
                             * passed returns one.
                             */
                            if (!promise.then) {
                                promise = $.when(internals.step.call(promise, ctx, args));
                            }

                            /**
                             * Attach the step as success callback to the promise
                             */
                            return $.when(promise).then(function() {
                                return internals.step.call(step, ctx, [].slice.call(arguments));
                            });
                        });

                    },

                    /**
                     * Execute all steps at once
                     *
                     * @param ctx
                     * @param stepsToExecute
                     * @param args passed to all steps
                     * @return {*}
                     */
                    parallel : function(ctx, stepsToExecute, args) {
                        var promises = [];
                        for (var index in stepsToExecute) {
                            promises.push(internals.step.call(stepsToExecute[index], ctx, args));
                        }

                        return $.when.apply(null, promises);
                    }
                },

                /**
                 * Set flow to execute in waterfall mode
                 *
                 * @return {*}
                 */
                parallel : function() {
                    this.mode = "parallel";
                    return this;
                },

                /**
                 * Set flow to execute in parallel mode
                 *
                 * @return {*}
                 */
                waterfall : function() {
                    this.mode = "waterfall";
                    return this;
                },

                /**
                 * Begin the flow
                 *
                 * All arguments are passed on to either first step (waterfall) or all steps (parallel)
                 *
                 * Example usage:
                 *
                 * flow.begin();
                 *
                 * Or
                 *
                 * flow.begin(arg1, arg2, arg3, ..);
                 *
                 */
                begin : function() {

                    //generate flow plan based on starting step name and 'skipped' steps
                    var self = this,
                        stepsToExecute = [],
                        stepStartIndex = 0;

                    //get the starting step index
                    if (this.startingStep) {
                        _.each(this.steps, function(step, indx) {
                            if (self.startingStep === step.name) {
                                stepStartIndex = indx;
                            }
                        });
                    }

                    //build execution plan
                    for (var i = 0; i < this.steps.length; i++)
                    {
                        if (i < stepStartIndex || self.skipSteps.indexOf(self.steps[i].name) >= 0) {
                            continue;
                        }

                        stepsToExecute.push(self.steps[i]);

                    }

                    if (stepsToExecute.length === 0) {
                        return $.Deferred().reject("There are no steps to execute in current execution plan.");
                    }

                    var promise,
                        args = [].slice.call(arguments);
                    if (stepsToExecute.length === 1) {
                        promise = $.when(internals.step.call(stepsToExecute[0], self.ctx, args));
                    } else {
                        promise = this.modes[this.mode](self.ctx, stepsToExecute, args);
                    }

                    //attach failure callback wrapper...this will get the failure result and decide whether to invoke conditional
                    //callbacks or the general failure callback
                    this.attachFailCallback(promise);

                    //jump to any flows specified by 'jumpTo'
                    this.attachFailDelegate(promise);
                    this.attachSuccessDelegate(promise);

                    return promise;

                },

                /**
                 * Specify the 'this' context for the flow
                 *
                 * @param obj
                 */
                context : function(obj) {
                    this.ctx = obj;
                    return this;
                },

                /**
                 * Specify a step to start the flow on
                 *
                 * @param stepName
                 * @return {*}
                 */
                startOn : function(stepName) {
                    this.startingStep = stepName;
                    return this;
                },

                /**
                 * Specify a step to skip
                 *
                 * @param stepName
                 * @return {*}
                 */
                skip : function(stepName) {

                    this.skipSteps.push(stepName);

                    return this;

                },

                /**
                 * Remove the flow from the internal object
                 */
                destroy : function () {
                    delete flows[this.name];
                }
            });

            flows[name].name = name;
        }

        //start over with skipped steps and starting steps..
        flows[name].skipSteps = [];
        flows[name].startingStep = [];
        flows[name].mode = defaultMode;

        return flows[name];

    };

    /**
     * Some useful methods from underscore (underscorejs.org)
     */

    /**
     *
     Copyright (c) 2009-2013 Jeremy Ashkenas, DocumentCloud

     Permission is hereby granted, free of charge, to any person
     obtaining a copy of this software and associated documentation
     files (the "Software"), to deal in the Software without
     restriction, including without limitation the rights to use,
     copy, modify, merge, publish, distribute, sublicense, and/or sell
     copies of the Software, and to permit persons to whom the
     Software is furnished to do so, subject to the following
     conditions:
     *
     */

    var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

    var nativeForEach      = ArrayProto.forEach,
        nativeReduce       = ArrayProto.reduce,
        nativeBind         = FuncProto.bind;

    // Create a safe reference to the Underscore object for use below.
    var _ = function(obj) {
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    };

    // The cornerstone, an `each` implementation, aka `forEach`.
    // Handles objects with the built-in `forEach`, arrays, and raw objects.
    // Delegates to **ECMAScript 5**'s native `forEach` if available.
    var each = _.each = function(obj, iterator, context) {
        if (obj === null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            for (var key in obj) {
                if (_.has(obj, key)) {
                    if (iterator.call(context, obj[key], key, obj) === breaker) return;
                }
            }
        }
    };

    var reduceError = 'Reduce of empty array with no initial value';

    // **Reduce** builds up a single result from a list of values, aka `inject`,
    // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
    _.reduce = function(obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj === null) obj = [];
        if (nativeReduce && obj.reduce === nativeReduce) {
            if (context) iterator = _.bind(iterator, context);
            return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
        }
        each(obj, function(value, index, list) {
            if (!initial) {
                memo = value;
                initial = true;
            } else {
                memo = iterator.call(context, memo, value, index, list);
            }
        });
        if (!initial) throw new TypeError(reduceError);
        return memo;
    };

    // Create a function bound to a given object (assigning `this`, and arguments,
    // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
    // available.
    _.bind = function(func, context) {
        if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
        var args = slice.call(arguments, 2);
        return function() {
            return func.apply(context, args.concat(slice.call(arguments)));
        };
    };

    return Flow;
}));