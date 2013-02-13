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

    //flow factory/getter
    Flow = function(name) {

        if (!flows[name]) {
            flows[name] = Object.create({
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
                    var self = this;

                    return {
                        handleWith : function(callback) {
                            if (responseCode) {
                                self.conditionalFailCallbacks[responseCode] = callback;
                            } else {
                                self.defaultFailCallback = callback;
                            }

                            return self;
                        },
                        jumpTo : function(flow) {
                            if (responseCode) {
                                self.conditionalFailDelegates[responseCode] = flow;
                            } else {
                                self.defaultFailDelegate = flow;
                            }

                            return self;
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
                 * @param ctx
                 */
                attachFailCallback : function(promise, ctx) {

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
                            //Else, set it to the default (declared on flow class)
                        } else if (self.fail) {
                            failureCallback = self.defaultFailCallback;
                            //Else return
                        } else {
                            return;
                        }

                        //If there's a context, invoke .call(ctx)
                        if (ctx) {
                            failureCallback.call(ctx, response);
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
                 * @param ctx
                 */
                attachFailDelegate : function(promise, ctx) {

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

                            var flow = Flow(failureDelegate);

                            flow.begin(ctx);

                        });
                    }

                },

                /**
                 * Attach flows on success
                 *
                 * @param promise
                 * @param ctx
                 */
                attachSuccessDelegate : function(promise, ctx) {
                    var self = this;
                    if (this.defaultSuccessDelegate) {
                        promise.then(function() {
                            var flow = Flow(self.defaultSuccessDelegate);
                            flow.begin(ctx);
                        });
                    }
                },

                /**
                 * Get or set a step.
                 *
                 * @param name the name of the step
                 * @param callback the step callback/logic. If this is falsey, the function acts as a getter, otherwise it's a setter
                 * @return {*}
                 */
                step : function(name, callback) {

                    if (callback) {
                        this.steps.push({
                            name : name,
                            callback : callback
                        });
                        return this;
                    } else {
                        var foundStep,
                            self = this;
                        for (var i = 0; i < this.steps.length; i++)
                        {
                            if (self.steps[i].name === name) {
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
                     *
                     */
                    waterfall : function(ctx, stepsToExecute) {

                        return _.reduce(stepsToExecute, function(promise, step) {
                            /**
                             * If not a promise object, means we're on the first step.
                             * Call the first step using $.when(), which always returns a promise, regardless of whether the function
                             * passed returns one.
                             */
                            if (!promise.then) {
                                promise = $.when(promise.callback.call(ctx));
                            }

                            /**
                             * Attach the step as success callback to the promise
                             */
                            return $.when(promise).then(function(result) {
                                return step.callback.call(ctx, result);
                            });
                        });

                    },

                    parallel : function(ctx, stepsToExecute) {
                        var promises = [];
                        for (var index in stepsToExecute) {
                            promises.push(stepsToExecute[index].callback.call(ctx));
                        }

                        return $.when.apply(null, promises);
                    }
                },

                parallel : function() {
                    this.mode = "parallel";
                    return this;
                },
                waterfall : function() {
                    this.mode = "waterfall";
                    return this;
                },

                /**
                 * Begin the flow
                 *
                 */
                begin : function(ctx) {

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

                    var promise;
                    if (stepsToExecute.length === 1) {
                        promise = $.when(stepsToExecute[0].callback.call(ctx));
                    } else {
                        promise = this.modes[this.mode](ctx, stepsToExecute);
                    }

                    //attach failure callback wrapper...this will get the failure result and decide whether to invoke conditional
                    //callbacks or the general failure callback
                    this.attachFailCallback(promise, ctx);

                    //jump to any flows specified by 'jumpTo'
                    this.attachFailDelegate(promise, ctx);
                    this.attachSuccessDelegate(promise, ctx);

                    return promise;

                },

                startOn : function(stepName) {
                    this.startingStep = stepName;
                    return this;
                },

                skip : function(stepName) {

                    this.skipSteps.push(stepName);

                    return this;

                },
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