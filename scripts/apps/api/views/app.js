define([
    "jquery",
    "backbone",
    "underscore",
    "apps/api/models/method",
    "apps/api/views/method",
    "apps/api/views/nav",
    "apps/api/flows/splash"], function(
    $,
    Backbone,
    _,
    MethodModel,
    MethodView,
    NavView,
    SplashFlow) {

    return Backbone.View.extend({

        events : {

        },

        initialize : function() {},

        render : function() {
            var self = this,
                methods = new Backbone.Collection();

            $.getJSON("doc.json")
                .then(function(comments) {
                    //create new method view for each comment..
                    _.chain(comments)
                        .sortBy(function(comment) {
                            if (comment.ctx.cons &&
                                comment.ctx.cons === "execution") {
                                return 1;
                            };
                            return -1;
                        })
                        .each(function(comment) {
                            var method = new MethodModel(comment),
                                methodContainer = $(document.createElement('div'))
                                    .addClass("methodContainer")
                                    .addClass("spied");

                            self.$el.find("#apiMethodContainer")
                                .append(methodContainer);

                            var executableExamples = [
                                    "loop",
                                    "onSuccess.loop",
                                    "onSuccess.jumpTo",
                                    "onFailure.jumpTo",
                                    "onFailure.handleWith",
                                    "onFailure.loop",
                                    "once",
                                    "waterfall",
                                    "step",
                                    "delay",
                                    "context",
                                    "skip",
                                    "startOn",
                                    "parallel",
                                    "begin",
                                    "create"
                                ],
                                examples = executableExamples.concat([]);

//                            if (examples.indexOf(method.get("exampleName")) > -1 &&
//                                method.get("ctx").constructor != "execution") {
                                method.set("examples", [{
                                    executable : executableExamples.indexOf(method.get("ctx").name) > -1 ? true : true,
                                    path : "apps/api/examples/" + method.get("exampleName")
                                }]);
                            //}

                            new MethodView({
                                model : method,
                                el : methodContainer
                            }).render();

                            methods.push(method);

                        });

                    new NavView({
                        methods : methods,
                        el : self.$el.find('#side-nav-container')
                    }).render();

                });

            SplashFlow.context({
                    $el : this.$el.find("#splash-effect")
                });

            var loop = function() {
                SplashFlow.begin().done(loop);
            };

            loop();

        }

    });



});