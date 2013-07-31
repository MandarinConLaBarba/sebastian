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

                                method.set("examples", [{
                                    path : "apps/api/examples/" + method.get("exampleName")
                                }]);

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
                })
                .loop()
                .begin();

        }

    });



});